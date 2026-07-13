import { postRequest, getRequest, type ApiResponse } from '../../utils/apiRequest';
import type { CartItem } from '../../types/cart.types';

interface OrderRequest {
  items: Array<{
    category: number;
    name: string;
    quantity: number;
  }>;
}

interface OrderResponse {
  orderId: number; 
  issuer: string;
  seller?: string; 
  content: string;  
  time: string;
  status: number;  // 0=créé, 1=confirmé, 2=livré
}

export const orderService = {

  getStocksProjectId(): string | null {
    return localStorage.getItem('stocksProjectId');
  },


  getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  cartItemsToOrderItems(cartItems: CartItem[]): OrderRequest['items'] {
    return cartItems.map(item => ({
      category: item.category,
      name: item.name,
      quantity: item.quantity
    }));
  },

  async getLatestPendingOrderId(token: string): Promise<number | null> {
    try {
      const response = await getRequest<OrderResponse[]>('order/pending', token);
      
      if (response.success && response.data && response.data.length > 0) {
        // Prendre le premier
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        return sortedOrders[0].orderId;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return null;
    }
  },

  
  async processPartialOrder(cartItems: CartItem[], token: string): Promise<ApiResponse<void>> {
        try {
      const projectId = this.getStocksProjectId();
      const userId = this.getCurrentUserId();
      
      if (!projectId) {
        return {
          success: false,
          error: 'Stocks project not found. Please reconnect.',
          status: null
        };
      }

      if (!userId) {
        return {
          success: false,
          error: 'User ID not found. Please reconnect.',
          status: null
        };
      }

      if (cartItems.length === 0) {
        return {
          success: false,
          error: 'Cart is empty',
          status: null
        };
      }

      // Créer la commande
      const orderRequest: OrderRequest = {
        items: this.cartItemsToOrderItems(cartItems)
      };

      console.log('Creating order with:', orderRequest);
      
      const createResponse = await postRequest(
        `order/${projectId}/send`,
        orderRequest,
        token
      );

      if (!createResponse.success) {
        return {
          success: false,
          error: createResponse.error || 'Failed to create order',
          status: createResponse.status
        };
      }

       return {
        success: true,
        status: 200
      };

    } catch (error) {
      console.error('Error processing order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: null
      };
    }
  },

  async processCompleteOrder(cartItems: CartItem[], token: string): Promise<ApiResponse<void>> {
    try {
      const projectId = this.getStocksProjectId();
      const userId = this.getCurrentUserId();
      
      if (!projectId) {
        return {
          success: false,
          error: 'Stocks project not found. Please reconnect.',
          status: null
        };
      }

      if (!userId) {
        return {
          success: false,
          error: 'User ID not found. Please reconnect.',
          status: null
        };
      }

      if (cartItems.length === 0) {
        return {
          success: false,
          error: 'Cart is empty',
          status: null
        };
      }

      // Créer la commande
      const orderRequest: OrderRequest = {
        items: this.cartItemsToOrderItems(cartItems)
      };

      console.log('Creating order with:', orderRequest);
      
      const createResponse = await postRequest(
        `order/${projectId}/send`,
        orderRequest,
        token
      );

      if (!createResponse.success) {
        return {
          success: false,
          error: createResponse.error || 'Failed to create order',
          status: createResponse.status
        };
      }

      console.log('Order created successfully, fetching pending orders...');

      // Récupérer l'ID de la dernière commande
      const orderId = await this.getLatestPendingOrderId(token);
      
      if (!orderId) {
        return {
          success: false,
          error: 'Failed to retrieve order ID',
          status: null
        };
      }

      console.log('Latest pending order ID:', orderId);

      // Confirmer la commande
      const confirmResponse = await postRequest(
        `order/${localStorage.getItem("stocksProjectId")}/${orderId}/confirm`,
        {},
        token
      );

      if (!confirmResponse.success) {
        return {
          success: false,
          error: confirmResponse.error || 'Failed to confirm order',
          status: confirmResponse.status
        };
      }

      console.log('Order confirmed successfully');

      // Livrer la commande (met à jour les stocks)
      const deliverResponse = await postRequest(
        `order/${orderId}/${userId}/delivered`,
        {},
        token
      );

      if (!deliverResponse.success) {
        return {
          success: false,
          error: deliverResponse.error || 'Failed to deliver order and update stocks',
          status: deliverResponse.status
        };
      }

      console.log('Order delivered and stocks updated successfully');

      return {
        success: true,
        status: 200
      };

    } catch (error) {
      console.error('Error processing order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: null
      };
    }
  },


  canPlaceOrder(): { canOrder: boolean; reason?: string } {
    const projectId = this.getStocksProjectId();
    if (!projectId) {
      return { canOrder: false, reason: 'Stocks project not found. Please reconnect.' };
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      return { canOrder: false, reason: 'User ID not found. Please reconnect.' };
    }

    return { canOrder: true };
  }
};