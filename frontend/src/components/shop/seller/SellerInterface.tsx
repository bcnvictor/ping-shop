import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Plus, Check, Package, Clock, User, Users } from 'lucide-react';
import { getRequest, postRequest } from '../../../utils/apiRequest';
import { orderService } from '../../shop/orderService';
import type { CartItem } from '../../../types/cart.types';
import './SellerInterface.css';

interface OrderItem {
  name: string;
  category: number;
  quantity: number;
}

interface OrderContent {
  items: OrderItem[];
}

interface Order {
  orderId: number;
  issuer: string;
  seller?: string;
  content: string;
  time: string;
  status: number; // 0=unconfirmed, 1=confirmed, 2=delivered
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: number;
  icon: string;
}

interface UserProfile {
  login: string;
  avatar?: string;
  displayName?: string;
}

interface SellerInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'user' | 'seller' | 'admin';
  onProductSelectionMode?: (enabled: boolean) => void;
  selectedProduct?: Product | null;
  onProductAddedToCart?: () => void;
}

const mockOrders: Order[] = [];

export const SellerInterface: React.FC<SellerInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  userRole = 'seller',
  onProductSelectionMode,
  selectedProduct,
  onProductAddedToCart
}) => {
  const [activeTab, setActiveTab] = useState<'quicksale' | 'orders'>('quicksale');
  
  const [quickSaleCart, setQuickSaleCart] = useState<CartItem[]>([]);
  const [customerLogin, setCustomerLogin] = useState('');
  const [isSelectingProducts, setIsSelectingProducts] = useState(false);
  
  // User selection modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (selectedProduct && isSelectingProducts) {
      // 
      //JSP PK MAIS SI ON ENLEVE LE COMMENTAIRE CA EXPLOSE LEGIT
    }
  }, [selectedProduct, isSelectingProducts]);

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setUsersError('No authentication token found');
        return;
      }

      // Récupérer directement tous les utilisateurs avec leurs infos complètes
      const response = await getRequest('user/all', token);
      
      if (!response.success || !response.data) {
        setUsersError(response.error || 'Failed to fetch users');
        return;
      }

      console.log('Response from user/all:', response.data);

      if (!Array.isArray(response.data)) {
        setUsersError('Invalid response format - expected array');
        return;
      }

      // Mapper directement les objets utilisateur
      const userProfiles: UserProfile[] = response.data.map(user => ({
        login: user.login || 'unknown',
        avatar: user.avatar || '',
        displayName: user.displayName || user.login || 'unknown'
      }));

      console.log('Mapped user profiles:', userProfiles);
      setUsers(userProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setUsersLoading(false);
    }
  };

  const openUserModal = () => {
    setIsUserModalOpen(true);
    fetchUsers();
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
  };

  const selectUser = (userLogin: string) => {
    setCustomerLogin(userLogin);
    closeUserModal();
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setOrdersError('No authentication token found');
        return;
      }

      const response = await getRequest<Order[]>('order/pending', token);
      
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrdersError(response.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrdersError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setOrdersLoading(false);
    }
  };
  
  if (!isOpen || (userRole !== 'seller' && userRole !== 'admin')) {
    return null;
  }

  const parseOrderContent = (contentStr: string): OrderContent => {
    try {
      return JSON.parse(contentStr);
    } catch (error) {
      console.error('Error parsing order content:', error);
      return { items: [] };
    }
  };

  const formatDate = (timeStr: string): string => {
    return new Date(timeStr).toLocaleString();
  };

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return 'Unconfirmed';
      case 1: return 'Confirmed';
      case 2: return 'Delivered';
      default: return 'Unknown';
    }
  };

  const addToQuickSaleCart = (product: Product, quantity: number) => {
    const existingItem = quickSaleCart.find(item => item.id === product.id);
    
    if (existingItem) {
      setQuickSaleCart(quickSaleCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        category: product.category,
        totalPrice: product.price * quantity
      };
      setQuickSaleCart([...quickSaleCart, newItem]);
    }

    if (onProductSelectionMode) {
      onProductSelectionMode(false);
    }
    setIsSelectingProducts(false);
  };

  const removeFromQuickSaleCart = (itemId: number) => {
    setQuickSaleCart(quickSaleCart.filter(item => item.id !== itemId));
  };

  const clearQuickSaleCart = () => {
    setQuickSaleCart([]);
  };

  const getQuickSaleTotal = (): number => {
    return quickSaleCart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const processQuickSale = async () => {
    if (quickSaleCart.length === 0 || !customerLogin.trim()) {
      alert('Please add items to cart and specify a customer login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to process the sale');
        return;
      }

      console.log('Processing quick sale for:', customerLogin, quickSaleCart);
      const orderResponse = await orderService.processCompleteOrder(quickSaleCart, token);
      
      if (orderResponse.success) {
        alert(`Quick sale processed for ${customerLogin}! Total: ${getQuickSaleTotal().toFixed(2)}€`);
        clearQuickSaleCart();
        setCustomerLogin('');
      } else {
        alert(`Failed to process sale: ${orderResponse.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing quick sale:', error);
      alert('Error processing sale. Please try again.');
    }
  };

  const enableProductSelection = () => {
    setIsSelectingProducts(true);
    if (onProductSelectionMode) {
      onProductSelectionMode(true);
    }
  };

  const disableProductSelection = () => {
    setIsSelectingProducts(false);
    if (onProductSelectionMode) {
      onProductSelectionMode(false);
    }
  };

  const confirmOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      console.log('Confirming order:', orderId);
      const stocksProjectID = localStorage.getItem("stocksProjectId");
      const response = await postRequest(`order/${stocksProjectID}/${orderId}/confirm`, {}, token);
      
      if (response.success) {
        setOrders(orders.map(order => 
          order.orderId === orderId ? { ...order, status: 1 } : order
        ));
        
        console.log('Order confirmed successfully');
      } else {
        alert(`Failed to confirm order: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error confirming order. Please try again.');
    }
  };

  const markAsDelivered = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const projectId = localStorage.getItem('stocksProjectId');
      const userId = getCurrentUserId();
      
      if (!token || !projectId || !userId) {
        alert('Missing required information. Please reconnect.');
        return;
      }

      console.log('Marking as delivered:', orderId);
      const response = await postRequest(`order/${orderId}/${userId}/delivered`, {}, token);
      
      if (response.success) {
        setOrders(orders.map(order => 
          order.orderId === orderId ? { ...order, status: 2 } : order
        ));
        
        console.log('Order marked as delivered successfully');
      } else {
        alert(`Failed to mark order as delivered: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Error marking order as delivered. Please try again.');
    }
  };

  const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status <= 1).length;

  return (
    <>
      <div className="shop-seller-interface-overlay">
        <div className="shop-seller-interface-sidebar">
          {/* Header */}
          <div className="shop-seller-interface-header">
            <h2>Seller Interface</h2>
            <button
              onClick={onClose}
              className="shop-seller-close-button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="shop-seller-tab-navigation">
            <button
              onClick={() => setActiveTab('quicksale')}
              className={`shop-seller-tab-button ${activeTab === 'quicksale' ? 'active' : ''}`}
            >
              <Plus size={18} />
              Quick Sale
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`shop-seller-tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              Orders ({pendingOrdersCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="shop-seller-tab-content">
            {activeTab === 'quicksale' && (
              <div className="shop-seller-quicksale-tab">
                {/* Customer Input */}
                <div className="shop-seller-customer-input-section">
                  <label className="shop-seller-customer-input-label">
                    Customer Login:
                  </label>
                  <div className="shop-seller-customer-input-container">
                    <div className="shop-seller-customer-input-wrapper">
                      <input
                        type="text"
                        value={customerLogin}
                        onChange={(e) => setCustomerLogin(e.target.value)}
                        placeholder="Enter customer login"
                        className="shop-seller-customer-input"
                      />
                    </div>
                    <button
                      onClick={openUserModal}
                      className="shop-seller-user-select-button"
                      title="Select from user list"
                    >
                      <Users size={16} />
                      Select
                    </button>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="shop-seller-product-selection-section">
                  <h3 className="shop-seller-section-title">Add Products:</h3>
                  
                  {isSelectingProducts ? (
                    <div className="shop-seller-selection-mode">
                      <div className="shop-seller-selection-instructions">
                        <p>🛒 Click on any product in the shop to add it to the quick sale cart</p>
                        <button 
                          onClick={disableProductSelection}
                          className="shop-seller-cancel-selection-button"
                        >
                          Cancel Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={enableProductSelection}
                      className="shop-seller-select-products-button"
                    >
                      <Plus size={16} />
                      Select Products from Shop
                    </button>
                  )}

                  {/* Quantity Selector for Selected Product */}
                  {selectedProduct && (
                    <div className="shop-seller-quantity-selector">
                      <h4 className="shop-seller-quantity-title">
                        Add {selectedProduct.name} - {selectedProduct.price}€
                      </h4>
                      <p className="shop-seller-stock-info">
                        {selectedProduct.stock} available
                      </p>
                      <div className="shop-seller-quantity-buttons">
                        {[1, 2, 3, 5, 10].filter(qty => qty <= selectedProduct.stock).map(qty => (
                          <button
                            key={qty}
                            onClick={() => addToQuickSaleCart(selectedProduct, qty)}
                            className="shop-seller-quantity-button"
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Sale Cart */}
                <div className="shop-seller-cart-section">
                  <h3 className="shop-seller-section-title">Quick Sale Cart:</h3>
                  {quickSaleCart.length === 0 ? (
                    <p className="shop-seller-empty-cart-message">No items in cart</p>
                  ) : (
                    <>
                      <div className="shop-seller-cart-items">
                        {quickSaleCart.map(item => (
                          <div key={item.id} className="shop-seller-cart-item">
                            <div className="shop-seller-cart-item-info">
                              <div className="shop-seller-cart-item-name">{item.name}</div>
                              <div className="shop-seller-cart-item-details">
                                {item.price}€ × {item.quantity} = {item.totalPrice.toFixed(2)}€
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromQuickSaleCart(item.id)}
                              className="shop-seller-remove-item-button"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="shop-seller-cart-total">
                        Total: {getQuickSaleTotal().toFixed(2)}€
                      </div>
                      <div className="shop-seller-cart-actions">
                        <button
                          onClick={clearQuickSaleCart}
                          className="shop-seller-clear-cart-button"
                        >
                          Clear Cart
                        </button>
                        <button
                          onClick={processQuickSale}
                          disabled={quickSaleCart.length === 0 || !customerLogin.trim()}
                          className={`shop-seller-process-sale-button ${quickSaleCart.length === 0 || !customerLogin.trim() ? 'disabled' : ''}`}
                        >
                          Process Sale
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="shop-seller-orders-tab">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="shop-seller-section-title">Pending Orders</h3>
                  <button 
                    onClick={fetchOrders}
                    className="shop-seller-refresh-button"
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? '⏳' : '🔄'} Refresh
                  </button>
                </div>

                {ordersError && (
                  <div className="shop-seller-error-message">
                    <p>❌ Error: {ordersError}</p>
                    <button onClick={fetchOrders} className="shop-seller-retry-button">
                      Try Again
                    </button>
                  </div>
                )}

                {ordersLoading ? (
                  <div className="shop-seller-loading-message">
                    <p>Loading orders...</p>
                  </div>
                ) : pendingOrdersCount === 0 ? (
                  <p className="shop-seller-no-orders-message">No pending orders</p>
                ) : (
                  <div className="shop-seller-orders-list">
                    {orders
                      .filter(order => order.status <= 1)
                      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                      .map(order => {
                        const content = parseOrderContent(order.content);
                        return (
                          <div key={order.orderId} className="shop-seller-order-card">
                            {/* Order Header */}
                            <div className="shop-seller-order-header">
                              <div className="shop-seller-order-info">
                                <div className="shop-seller-order-id">
                                  Order #{order.orderId}
                                </div>
                                <div className="shop-seller-order-issuer">
                                  <User size={12} />
                                  {order.issuer}
                                </div>
                              </div>
                              <div className={`shop-seller-order-status status-${order.status}`}>
                                {order.status === 0 ? <Clock size={12} /> : <Package size={12} />}
                                {getStatusText(order.status)}
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="shop-seller-order-items">
                              {content.items.map((item, index) => (
                                <div key={index} className="shop-seller-order-item">
                                  <span className="shop-seller-item-name">{item.name}</span>
                                  <span className="shop-seller-item-quantity">×{item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Order Time */}
                            <div className="shop-seller-order-time">
                              {formatDate(order.time)}
                            </div>

                            {/* Actions */}
                            <div className="shop-seller-order-actions">
                              {order.status === 0 && (
                                <button
                                  onClick={() => confirmOrder(order.orderId)}
                                  className="shop-seller-confirm-order-button"
                                >
                                  <Check size={14} />
                                  Confirm Order
                                </button>
                              )}
                              {order.status === 1 && (
                                <button
                                  onClick={() => markAsDelivered(order.orderId)}
                                  className="shop-seller-deliver-order-button"
                                >
                                  <Package size={14} />
                                  Mark as Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Selection Modal */}
      {isUserModalOpen && (
        <div className="shop-seller-user-modal-overlay" onClick={closeUserModal}>
          <div className="shop-seller-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shop-seller-user-modal-header">
              <h2 className="shop-seller-user-modal-title">Select Customer</h2>
              <button
                onClick={closeUserModal}
                className="shop-seller-user-modal-close"
              >
                <X size={24} />
              </button>
            </div>

            {usersError && (
              <div className="shop-seller-users-error">
                ❌ Error: {usersError}
              </div>
            )}

            {usersLoading ? (
              <div className="shop-seller-users-loading">
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="shop-seller-no-users">
                <p>No users found</p>
              </div>
            ) : (
              <div className="shop-seller-users-grid">
                {users.map((user, index) => (
                  <div
                    key={`${user.login}-${index}`}
                    onClick={() => selectUser(user.login)}
                    className="shop-seller-user-card"
                  >
                    {user.avatar && user.avatar.trim() !== '' ? (
                      <img
                        src={user.avatar}
                        alt={user.login}
                        className="shop-seller-user-avatar"
                        onError={(e) => {
                          console.log('Failed to load avatar for:', user.login, user.avatar);
                          // En cas d'erreur, cacher l'image et montrer le fallback
                          const target = e.currentTarget;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="shop-seller-user-avatar-fallback"
                      style={{ display: user.avatar && user.avatar.trim() !== '' ? 'none' : 'flex' }}
                    >
                      <User size={32} color="#fdf0d5" />
                    </div>
                    <div className="shop-seller-user-login">
                      {user.displayName || user.login}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};