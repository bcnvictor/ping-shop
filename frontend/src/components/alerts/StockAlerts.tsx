import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ProductWithCategoryName } from '../../components/stock/stockService';
import './StockAlerts.css';

interface StockAlertsProps {
  products: ProductWithCategoryName[];
  onClose: () => void;
}

interface AlertItem {
  id: number;
  name: string;
  stock: number;
  type: 'low' | 'out';
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ products, onClose }) => {
  // Filtrer les produits qui nécessitent une alerte
  const alerts: AlertItem[] = products
    .filter(product => product.stock <= 5)
    .map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      type: (product.stock === 0 ? 'out' : 'low') as 'low' | 'out'
    }))
    .sort((a, b) => {
      // Priorité : rupture de stock d'abord, puis stock faible
      if (a.type === 'out' && b.type === 'low') return -1;
      if (a.type === 'low' && b.type === 'out') return 1;
      return a.stock - b.stock;
    });

  if (alerts.length === 0) return null;

  return (
    <div className="stock-alerts-container">
      <div className="stock-alerts-header">
        <div className="alerts-title">
          <AlertTriangle size={20} />
          <span>Stock Alerts ({alerts.length})</span>
        </div>
        <button className="close-alerts" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      <div className="alerts-list">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`alert-item ${alert.type}`}
          >
            <div className="alert-icon">
              <AlertTriangle size={16} />
            </div>
            <div className="alert-content">
              <div className="alert-product-name">{alert.name}</div>
              <div className="alert-message">
                {alert.type === 'out' 
                  ? 'Out of stock!' 
                  : `Low stock: ${alert.stock} remaining`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};