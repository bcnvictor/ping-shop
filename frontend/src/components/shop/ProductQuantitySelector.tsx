import React, { useState } from 'react';
import type { Product } from '../../types/product.types';
import { useUser } from '../../contexts/UserContext';
import { showLogPrompt } from '../../utils/login';
import './ProductQuantitySelector.css';

interface ProductQuantitySelectorProps {
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
  onClose: () => void;
}

export const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({
  product,
  onAdd
}) => {
  const [quantity, setQuantity] = useState(1);
  const { isLoggedIn, login } = useUser();

  const maxQuantity = Math.min(9, product.stock);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      const userInfo = await showLogPrompt();
      if (userInfo) {
        login(userInfo.user, userInfo.token);
        // Après connexion réussie, on ajoute le produit
        onAdd(product, quantity);
        setQuantity(1);
      }
      // Si l'utilisateur annule la connexion, on ne fait rien
      return;
    }
    
    onAdd(product, quantity);
    setQuantity(1);
  };

  const handleSelectorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="product-quantity-selector" onClick={handleSelectorClick}>
      <div className="quantity-controls">
        <button 
          className="quantity-btn decrease"
          onClick={decrementQuantity}
          disabled={quantity <= 1}
        >
          −
        </button>
        
        <input
          type="number"
          className="quantity-input"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
          max="9"
        />
        
        <button 
          className="quantity-btn increase"
          onClick={incrementQuantity}
          disabled={quantity >= maxQuantity}
        >
          +
        </button>
      </div>
      
      <button className="add-to-cart-btn" onClick={handleAdd}>
        ADD 🛒
      </button>
    </div>
  );
};