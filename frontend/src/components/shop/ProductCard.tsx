import React, { useState } from 'react';
import type { Product } from '../../types/product.types';
import { ProductQuantitySelector } from './ProductQuantitySelector';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  isSelected?: boolean; 
  onAdd?: (product: Product, quantity: number) => void;
  isQuickSaleMode?: boolean;
  onQuickSaleClick?: (product: Product) => boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isSelected = false,
  onAdd,
  isQuickSaleMode = false,
  onQuickSaleClick
}) => {
  const cart = useCart();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getProductCardClasses = () => {
    let classes = 'product-card';
    if (isSelected) classes += ' selected';
    if (product.stock === 0) classes += ' out-of-stock';
    else if (product.stock <= 3) classes += ' low-stock';
    if (isQuickSaleMode) classes += ' quick-sale-mode';
    return classes;
  };

  const handleProductClick = () => {
    if (product.stock === 0) return;

    if (isQuickSaleMode && onQuickSaleClick) {
      const handled = onQuickSaleClick(product);
      if (handled) return;
    }

    onClick?.(product);
  };

  const handleAdd = (product: Product, quantity: number) => {
    console.log(`Adding ${quantity}x ${product.name} to cart`);
    cart?.addItem?.(product.id, product.name, product.price, quantity, product.category);
    onAdd?.(product, quantity);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#ff4444'; // Rouge
    if (stock <= 5) return '#ff9500'; // Orange
    if (stock <= 10) return '#ffbb00'; // Jaune
    return '#00aa00'; // Vert
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of stock';
    if (stock < 5) return `Only ${stock} left`;
    return `${stock} in stock`;
  };

  return (
    <div className="product-card-container">
      <div 
        className={getProductCardClasses()}
        onClick={handleProductClick}
      >
        {/* Quick Sale Mode Indicator */}
        {isQuickSaleMode && (
          <div className="quick-sale-indicator">
            🛒 Quick Sale
          </div>
        )}

        <div className="product-image">
          {!imageError && product.icon /*&& product.icon.startsWith('http') */ ? (
            <>
              {imageLoading && (
                <div className="image-placeholder">
                  <div className="loading-spinner">⏳</div>
                </div>
              )}
              <img 
                src={product.icon} 
                alt={product.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </>
          ) : (
            <div className="emoji-fallback">
              {product.icon && !product.icon.startsWith('http') ? product.icon : '📦'}
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{product.price.toFixed(2)} €</p>
          <p 
            className="product-stock" 
            style={{ 
              color: getStockColor(product.stock),
              fontSize: '0.75rem',
              fontWeight: '500',
              margin: '4px 0 0 0'
            }}
          >
            {getStockText(product.stock)}
          </p>
        </div>
      </div>

      {isSelected && product.stock > 0 && !isQuickSaleMode && (
        <ProductQuantitySelector
          product={product}
          onAdd={handleAdd}
          onClose={() => onClick?.(product)}
        />
      )}
    </div>
  );
};