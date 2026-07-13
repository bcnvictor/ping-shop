import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { StockHeader } from '../components/stock/StockHeader';
import { ProductGrid } from '../components/stock/ProductGrid';
import { ProductDetailsModal } from '../components/stock/updateStocks/ProductDetailsModal';
import { CreateProductModal } from '../components/stock/updateStocks/CreateProductModal';
import { stockService, type ProductWithCategoryName } from '../components/stock/stockService';
import { useUser } from '../contexts/UserContext';
import './Stocks.css';

export const Stocks: React.FC = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductWithCategoryName[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategoryName | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in to view stock',
          background: "#fdf0d5",
          color: "#003049",
        });
        return;
      }

      const response = await stockService.getStockAutomatic(token);
      
      if (response.success && response.data) {
        setProducts(response.data);
        
        const uniqueCategories = stockService.getUniqueCategories(response.data);
        const uniqueBrands = stockService.getUniqueBrands(response.data);
        
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Stock',
          text: response.error || 'Failed to load stock data',
          background: "#fdf0d5",
          color: "#003049",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred while loading stock',
        background: "#fdf0d5",
        color: "#003049",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: ProductWithCategoryName) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateProduct = async (newProduct: {
    name: string;
    price: number;
    quantity: number;
    category: number;
    icon: string;
    brand: string;
  }) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await stockService.createProduct(newProduct, token);
    
    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: 'Product Created',
        text: 'The product has been successfully added to stock',
        background: "#fdf0d5",
        color: "#003049",
      });
      
      await fetchStockData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: response.error || 'Failed to create product',
        background: "#fdf0d5",
        color: "#003049",
      });
    }
  };

  const handleUpdateProduct = async (productId: number, updates: Partial<ProductWithCategoryName>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await stockService.updateProduct(productId, updates, token);
    
    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: 'Product Updated',
        text: 'The product has been successfully updated',
        background: "#fdf0d5",
        color: "#003049",
      });
      
      await fetchStockData();
      setIsDetailsModalOpen(false);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: response.error || 'Failed to update product',
        background: "#fdf0d5",
        color: "#003049",
      });
    }
  };

  const activeFilters: Array<{ label: string; value: string; type: string }> = [];
  
  selectedCategories.forEach(category => {
    activeFilters.push({
      label: category,
      value: category,
      type: 'category'
    });
  });
  
  selectedBrands.forEach(brand => {
    activeFilters.push({
      label: brand,
      value: brand,
      type: 'brand'
    });
  });

  const handleRemoveFilter = (filter: { type: string; value: string }) => {
    if (filter.type === 'category') {
      setSelectedCategories(prev => prev.filter(c => c !== filter.value));
    } else if (filter.type === 'brand') {
      setSelectedBrands(prev => prev.filter(b => b !== filter.value));
    }
  };

  const handleImportCSV = async (file: File) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const result = await Swal.fire({
      title: 'Import CSV',
      text: 'This will update your stock. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, import',
      background: "#fdf0d5",
      color: "#003049",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Importing...',
      text: 'Please wait while we import your CSV',
      allowOutsideClick: false,
      background: "#fdf0d5",
      color: "#003049",
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await stockService.importCSV(file, token);
    
    if (response.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Import Successful',
        text: 'Your stock has been updated',
        background: "#fdf0d5",
        color: "#003049",
      });
      
      window.location.reload();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: response.error || 'Failed to import CSV',
        background: "#fdf0d5",
        color: "#003049",
      });
    }
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Swal.fire({
      title: 'Exporting...',
      text: 'Preparing your CSV file',
      allowOutsideClick: false,
      background: "#fdf0d5",
      color: "#003049",
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const blob = await stockService.exportCSV(token);
    Swal.close();
    
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.download = `stock_export_${dateStr}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: 'Export Complete',
        text: 'Your CSV file has been downloaded',
        background: "#fdf0d5",
        color: "#003049",
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export CSV',
        background: "#fdf0d5",
        color: "#003049",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategories.length === 0 || 
                         selectedCategories.includes(product.categoryName);
    const brandMatch = selectedBrands.length === 0 || 
                      selectedBrands.includes(product.brand);
    const searchMatch = searchTerm === '' || 
                       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && brandMatch && searchMatch;
  });

  return (
    <div className="stock-page">
      <StockHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        brands={brands}
        selectedCategories={selectedCategories}
        selectedBrands={selectedBrands}
        onCategoriesChange={setSelectedCategories}
        onBrandsChange={setSelectedBrands}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onImportCSV={handleImportCSV}
        onExportCSV={handleExportCSV}
      />
      
      <ProductGrid 
        products={filteredProducts}
        loading={loading}
        onProductClick={handleProductClick}
        onCreateClick={isAdmin ? handleCreateClick : undefined}
      />
      
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        isAdmin={isAdmin}
      />
      
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProduct}
        existingBrands={brands}
      />
    </div>
  );
};
