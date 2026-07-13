import { getRequest, postRequest, putRequest, type ApiResponse } from '../../utils/apiRequest';
import type { Product } from '../../types/product.types';

export const CATEGORY_NAMES: Record<number, string> = {
  0: 'Snacks',
  1: 'Drinks',
  2: 'Noodles',
  3: 'Ice Cream'
};

export interface ProductWithCategoryName extends Product {
  categoryName: string;
}

interface Project {
  id: string;
  name: string;
  members: Array<{
    avatar: string;
    displayName: string;
    id: string;
  }>;
  owner: {
    avatar: string;
    displayName: string;
    id: string;
  };
}

interface CreateProductRequest {
  name: string;
  price: number;
  quantity: number;
  category: number;
  icon: string;
  metro: string;
  brand: string;
}

type UpdateProductRequest = CreateProductRequest;
export const stockService = {
  async getStocksProjectId(token: string): Promise<string | null> {
    try {
      const cachedProjectId = localStorage.getItem('stocksProjectId');
      if (cachedProjectId) {
        return cachedProjectId;
      }

      const response = await getRequest<Project[]>('projects/all', token);
      
      if (response.success && response.data) {
        const stocksProject = response.data.find(project => project.name === 'stocks');
        
        if (stocksProject) {
          localStorage.setItem('stocksProjectId', stocksProject.id);
          return stocksProject.id;
        }
      }
      
      console.error('Stocks project not found');
      return null;
    } catch (error) {
      console.error('Error fetching stocks project ID:', error);
      return null;
    }
  },

  async getStock(projectId: string, token: string): Promise<ApiResponse<ProductWithCategoryName[]>> {
    try {
      const response = await getRequest<Product[]>(`projects/${projectId}/folders/stock`, token);
      
      if (response.success && response.data) {
        const productsWithCategoryNames = response.data.map(product => ({
          ...product,
          categoryName: CATEGORY_NAMES[product.category] || 'Unknown'
        }));
        
        return {
          ...response,
          data: productsWithCategoryNames
        };
      }
      
      return response as ApiResponse<ProductWithCategoryName[]>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stock',
        status: null
      };
    }
  },

  async getStockAutomatic(token: string): Promise<ApiResponse<ProductWithCategoryName[]>> {
    const projectId = await this.getStocksProjectId(token);
    
    if (!projectId) {
      return {
        success: false,
        error: 'Could not find stocks project',
        status: null
      };
    }
    
    return this.getStock(projectId, token);
  },

  getUniqueBrands(products: ProductWithCategoryName[]): string[] {
    const brands = new Set(products.map(p => p.brand));
    return Array.from(brands).sort();
  },

  getUniqueCategories(products: ProductWithCategoryName[]): string[] {
    const categories = new Set(products.map(p => p.categoryName));
    return Array.from(categories).sort();
  },

  calculateAvailability(currentStock: number, maxStock: number = 100): number {
    return Math.round((currentStock / maxStock) * 100);
  },

  async createProduct(product: Omit<CreateProductRequest, 'metro'> & { metro?: string }, token: string): Promise<ApiResponse<Product>> {
    try {
      const projectId = await this.getStocksProjectId(token);
      
      if (!projectId) {
        return {
          success: false,
          error: 'Could not find stocks project',
          status: null
        };
      }

      const requestData: CreateProductRequest = {
        ...product,
        metro: product.metro || product.name.toLowerCase().replace(/\s+/g, '_')
      };

      const response = await postRequest<Product>(`projects/${projectId}/files/new`, requestData, token);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
        status: null
      };
    }
  },

  async updateProduct(productId: number, updates: Partial<Product>, token: string): Promise<ApiResponse<Product>> {
    try {
      const projectId = await this.getStocksProjectId(token);
      
      if (!projectId) {
        return {
          success: false,
          error: 'Could not find stocks project',
          status: null
        };
      }

      const currentProducts = await this.getStock(projectId, token);
      if (!currentProducts.success || !currentProducts.data) {
        return {
          success: false,
          error: 'Failed to fetch current product data',
          status: null
        };
      }

      const currentProduct = currentProducts.data.find(p => p.id === productId);
      if (!currentProduct) {
        return {
          success: false,
          error: 'Product not found',
          status: null
        };
      }

      const updateData: UpdateProductRequest = {
        name: currentProduct.name, // Name cannot be changed
        price: updates.price ?? currentProduct.price,
        quantity: updates.stock ?? currentProduct.stock,
        category: updates.category ?? currentProduct.category,
        icon: updates.icon ?? currentProduct.icon,
        metro: currentProduct.metro_name,
        brand: updates.brand ?? currentProduct.brand
      };

      const response = await putRequest<Product>(`projects/${projectId}/files/update`, updateData, token);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
        status: null
      };
    }
  },

  async exportCSV(token: string): Promise<Blob | null> {
    try {
      const projectId = await this.getStocksProjectId(token);
      
      if (!projectId) {
        throw new Error('Could not find stocks project');
      }

      const response = await fetch(`api/projects/${projectId}/folders/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} - ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return null;
    }
  },

  async importCSV(file: File, token: string): Promise<ApiResponse<any>> {
    try {
      const projectId = await this.getStocksProjectId(token);
      
      if (!projectId) {
        return {
          success: false,
          error: 'Could not find stocks project',
          status: null
        };
      }

      const arrayBuffer = await file.arrayBuffer();
      
      const response = await fetch(`api/projects/${projectId}/files/restock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        body: arrayBuffer
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Import failed: ${response.status} - ${response.statusText}`,
          status: response.status
        };
      }

      return {
        success: true,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import CSV',
        status: null
      };
    }
  }
};