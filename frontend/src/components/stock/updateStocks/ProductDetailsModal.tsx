import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Edit2, Save, XCircle } from 'lucide-react';
import { type ProductWithCategoryName } from '../stockService';
import './ProductDetailsModal.css';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithCategoryName | null;
  onUpdate: (productId: number, updates: Partial<ProductWithCategoryName>) => Promise<void>;
  isAdmin: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate,
  isAdmin
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<ProductWithCategoryName | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setEditedProduct({ ...product });
      setStockAdjustment(0);
      setIsEditing(false);
    }
  }, [product]);

  if (!isOpen || !product || !editedProduct) return null;

  const handleStockAdjustment = (amount: number) => {
    const newAdjustment = stockAdjustment + amount;
    const newTotal = product.stock + newAdjustment;
    
    if (newTotal >= 0) {
      setStockAdjustment(newAdjustment);
    }
  };

  const handleSave = async () => {
    if (!editedProduct) return;
    
    setLoading(true);
    try {
      const updates: Partial<ProductWithCategoryName> = {
        price: editedProduct.price,
        stock: product.stock + stockAdjustment,
        brand: editedProduct.brand,
        category: editedProduct.category,
        icon: editedProduct.icon
      };
      
      await onUpdate(product.id, updates);
      setIsEditing(false);
      setStockAdjustment(0);
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProduct({ ...product });
    setStockAdjustment(0);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="product-details-content">
          <div className="product-details-image">
            <img src={editedProduct.icon} alt={product.name} />
          </div>

          <div className="product-details-info">
            <div className="detail-row">
              <label>Brand:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProduct.brand}
                  onChange={(e) => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                  className="detail-input"
                />
              ) : (
                <span>{editedProduct.brand}</span>
              )}
            </div>

            <div className="detail-row">
              <label>Price:</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedProduct.price}
                  onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) || 0 })}
                  className="detail-input"
                />
              ) : (
                <span>{editedProduct.price.toFixed(2)} €</span>
              )}
            </div>

            <div className="detail-row">
              <label>Category:</label>
              {isEditing ? (
                <select
                  value={editedProduct.category}
                  onChange={(e) => setEditedProduct({ ...editedProduct, category: parseInt(e.target.value) })}
                  className="detail-select"
                >
                  <option value={0}>Snacks</option>
                  <option value={1}>Drinks</option>
                  <option value={2}>Noodles</option>
                  <option value={3}>Ice Cream</option>
                </select>
              ) : (
                <span>{editedProduct.categoryName}</span>
              )}
            </div>

            <div className="detail-row stock-row">
              <label>Stock:</label>
              <div className="stock-controls">
                <span className="current-stock">{product.stock}</span>
                {isEditing && (
                  <>
                    <div className="stock-adjustment">
                      <button 
                        className="stock-btn"
                        onClick={() => handleStockAdjustment(-1)}
                        disabled={product.stock + stockAdjustment <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="adjustment-value">
                        {stockAdjustment > 0 ? '+' : ''}{stockAdjustment}
                      </span>
                      <button 
                        className="stock-btn"
                        onClick={() => handleStockAdjustment(1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="new-total">
                      New total: {product.stock + stockAdjustment}
                    </span>
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="detail-row">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={editedProduct.icon}
                  onChange={(e) => setEditedProduct({ ...editedProduct, icon: e.target.value })}
                  className="detail-input"
                />
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="modal-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Edit Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};