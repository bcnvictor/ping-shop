import React from 'react';
import { Plus } from 'lucide-react';
import './CreateProductCard.css';

interface CreateProductCardProps {
  onClick: () => void;
}

export const CreateProductCard: React.FC<CreateProductCardProps> = ({ onClick }) => {
  return (
    <div className="create-product-card" onClick={onClick}>
      <div className="create-product-image-container">
        <Plus className="create-product-icon" size={48} />
      </div>
      <div className="create-product-info">
        <span className="create-product-text">Add New Product</span>
      </div>
    </div>
  );
};