import React from 'react';
import { ShoppingCart } from 'lucide-react';
import './ShopHeader.css';

interface ShopHeaderProps {
  onSellerInterfaceToggle: () => void;
  isSellerInterfaceOpen: boolean;
  showSellerInterface: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ 
  onSellerInterfaceToggle, 
  isSellerInterfaceOpen,
  showSellerInterface 
}) => {
  if (!showSellerInterface) {
    return null;
  }

  return (
    <div className="shop-seller-header">
      <div className="shop-seller-header-content">
        <div className="shop-seller-title">
          <h1>Shop</h1>
        </div>
        <div className="shop-seller-actions">
          <button
            onClick={onSellerInterfaceToggle}
            className={`shop-seller-interface-toggle ${isSellerInterfaceOpen ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            Seller Interface
          </button>
        </div>
      </div>
    </div>
  );
};