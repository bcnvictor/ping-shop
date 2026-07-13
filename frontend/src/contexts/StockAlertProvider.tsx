import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { StockAlerts } from '../components/alerts/StockAlerts';
import { useUser } from './UserContext';
import type { ProductWithCategoryName } from '../components/stock/stockService';

interface StockAlertsContextType {
  showAlerts: (products: ProductWithCategoryName[]) => void;
  hideAlerts: () => void;
  isVisible: boolean;
}

const StockAlertsContext = createContext<StockAlertsContextType | undefined>(undefined);

export const useStockAlerts = () => {
  const context = useContext(StockAlertsContext);
  if (!context) {
    throw new Error('useStockAlerts must be used within a StockAlertsProvider');
  }
  return context;
};

interface StockAlertsProviderProps {
  children: ReactNode;
}

export const StockAlertsProvider: React.FC<StockAlertsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<ProductWithCategoryName[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { user, isLoggedIn } = useUser();

  // Vérifier si l'utilisateur peut voir les alertes (seller ou admin)
  const canViewAlerts = isLoggedIn && user && (user.role === 'seller' || user.role === 'admin');

  const showAlerts = (productList: ProductWithCategoryName[]) => {
    if (canViewAlerts) {
      setProducts(productList);
      setIsVisible(true);
    }
  };

  const hideAlerts = () => {
    setIsVisible(false);
  };

  // Masquer les alertes si l'utilisateur se déconnecte ou n'a plus les permissions
  useEffect(() => {
    if (!canViewAlerts) {
      setIsVisible(false);
    }
  }, [canViewAlerts]);

  const value: StockAlertsContextType = {
    showAlerts,
    hideAlerts,
    isVisible
  };

  return (
    <StockAlertsContext.Provider value={value}>
      {children}
      {isVisible && canViewAlerts && (
        <StockAlerts 
          products={products} 
          onClose={hideAlerts}
        />
      )}
    </StockAlertsContext.Provider>
  );
};