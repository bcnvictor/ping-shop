import React from 'react';
import { type ProductWithCategoryName } from './stockService';
import { CreateProductCard } from './updateStocks/CreateProductCard';
import { useUser } from '../../contexts/UserContext';
import './ProductGrid.css';

interface ProductGridProps {
  products?: ProductWithCategoryName[];
  loading?: boolean;
  onProductClick?: (product: ProductWithCategoryName) => void;
  onCreateClick?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [], 
  loading = false,
  onProductClick,
  onCreateClick
}) => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="product-grid">
          {[...Array(12)].map((_, index) => (
            <div key={`placeholder-${index}`} className="product-card-placeholder">
              <div className="placeholder-image"></div>
              <div className="placeholder-text"></div>
              <div className="placeholder-text-small"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && products.length === 0 && !isAdmin) {
    return (
      <div className="product-grid-container">
        <div className="no-products-message">
          No products found matching your filters.
        </div>
      </div>
    );
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'Unavailable', className: 'stock-unavailable' };
    }
    return { text: stock.toString(), className: 'stock-available' };
  };

  return (
    <div className="product-grid-container">
      <div className="product-grid">
        {isAdmin && onCreateClick && (
          <CreateProductCard onClick={onCreateClick} />
        )}
        
        {products.map(product => {
          const stockStatus = getStockStatus(product.stock);
          
          return (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => onProductClick?.(product)}
            >
              <div className="product-image-container">
                <img 
                  src={product.icon} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23334155"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className={`stock-badge ${stockStatus.className}`}>
                  {stockStatus.text}
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-price">{product.price.toFixed(2)} €</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};