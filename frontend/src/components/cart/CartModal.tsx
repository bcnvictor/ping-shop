import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useUser } from '../../contexts/UserContext';
import { orderService } from '../shop/orderService';
import Swal from 'sweetalert2';
import './CartModal.css';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, decreaseQuantity, clearCart, getTotalPrice } = useCart();
  const { user, isLoggedIn } = useUser();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const handleValidateOrder = async () => {
    try {
      // Vérification préalable
      const token = localStorage.getItem('token');
      const orderCheck = orderService.canPlaceOrder();
      
      onClose();
      if (!orderCheck.canOrder) {
        await Swal.fire({
          icon: 'error',
          title: 'Cannot Place Order',
          text: orderCheck.reason,
          background: "#fdf0d5",
          color: "#003049",
        });
        return;
      }

      // Fermer la modal immédiatement après validation

      
      // Traitement de la commande
      setIsProcessingOrder(true);
      
      // Affichage du loader
      Swal.fire({
        title: 'Processing Your Order...',
        text: 'Please wait while we process your order',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "#fdf0d5",
        color: "#003049",
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Traitement de la commande
      const orderResponse = await orderService.processPartialOrder(items, token!);

      if (orderResponse.success) {
        // Succès - vider le panier et afficher confirmation
        clearCart();
        
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully! 🎉',
          html: `
            <p>Your order has been processed and stocks have been updated.</p>
            <p><strong>Thank you for your purchase!</strong></p>
            <div style="margin-top: 15px; font-size: 2rem;">🛍️✨</div>
          `,
          background: "#fdf0d5",
          color: "#003049",
          timer: 3000,
          timerProgressBar: true,
        });

        // Optionnel: Rafraîchir la page pour mettre à jour les stocks
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
        
      } else {
        // Erreur lors du traitement
        await Swal.fire({
          icon: 'error',
          title: 'Order Failed',
          text: orderResponse.error || 'An error occurred while processing your order. Please try again.',
          background: "#fdf0d5",
          color: "#003049",
        });
      }

    } catch (error) {
      console.error('Error during order processing:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred. Please try again later.',
        background: "#fdf0d5",
        color: "#003049",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCart size={24} />
            <h2>My Cart</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <p>You should buy something !</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-details">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="item-actions">
                      <span className="item-total">${item.totalPrice.toFixed(2)}</span>
                      <div className="action-buttons">
                        <button 
                          className="decrease-button"
                          onClick={() => decreaseQuantity(item.id)}
                          title="Reduce quantity"
                          disabled={isProcessingOrder}
                        >
                          <Minus size={16} />
                        </button>
                        <button 
                          className="remove-button"
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                          disabled={isProcessingOrder}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="total-price">
                  <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
                </div>
                <div className="cart-actions">
                  <button 
                    className="clear-cart-button" 
                    onClick={clearCart}
                    disabled={isProcessingOrder}
                  >
                    Empty Cart
                  </button>
                  <button 
                    className="validate-button" 
                    onClick={handleValidateOrder}
                    disabled={isProcessingOrder || !isLoggedIn}
                  >
                    {isProcessingOrder ? 'Processing...' : 
                     !isLoggedIn ? 'Login Required' : 
                     'Let\'s go Scrooge !'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};