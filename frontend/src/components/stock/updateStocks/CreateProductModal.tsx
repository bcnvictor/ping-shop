import React, { useState } from 'react';
import { X, Save, XCircle } from 'lucide-react';
import './CreateProductModal.css';

interface NewProduct {
  name: string;
  price: number;
  quantity: number;
  category: number;
  icon: string;
  brand: string;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (product: NewProduct) => Promise<void>;
  existingBrands: string[];
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  existingBrands
}) => {
  const [product, setProduct] = useState<NewProduct>({
    name: '',
    price: 0,
    quantity: 0,
    category: 1, // Default = Drinks
    icon: '',
    brand: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!product.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (product.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (product.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    if (!product.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!product.icon.trim()) {
      newErrors.icon = 'Image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onCreate(product);
      setProduct({
        name: '',
        price: 0,
        quantity: 0,
        category: 1,
        icon: '',
        brand: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProduct({
      name: '',
      price: 0,
      quantity: 0,
      category: 1,
      icon: '',
      brand: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="create-product-content">
          <div className="form-group">
            <label>Product Name:</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Coca Cola Zero"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Brand:</label>
            <input
              type="text"
              value={product.brand}
              onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              className={`form-input ${errors.brand ? 'error' : ''}`}
              placeholder="e.g., Coca-Cola"
              list="brand-suggestions"
            />
            <datalist id="brand-suggestions">
              {existingBrands.map(brand => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
            {errors.brand && <span className="error-message">{errors.brand}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (€):</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Initial Stock:</label>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) || 0 })}
                className={`form-input ${errors.quantity ? 'error' : ''}`}
                placeholder="0"
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: parseInt(e.target.value) })}
              className="form-select"
            >
              <option value={0}>Snacks</option>
              <option value={1}>Drinks</option>
              <option value={2}>Noodles</option>
              <option value={3}>Ice Cream</option>
            </select>
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="text"
              value={product.icon}
              onChange={(e) => setProduct({ ...product, icon: e.target.value })}
              className={`form-input ${errors.icon ? 'error' : ''}`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.icon && <span className="error-message">{errors.icon}</span>}
            {product.icon && !errors.icon && (
              <div className="image-preview">
                <img 
                  src={product.icon} 
                  alt="Product preview" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            <XCircle size={16} />
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};