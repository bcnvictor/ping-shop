import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, CartContextType } from '../types/cart.types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (productId: number, productName: string, price: number, quantity: number, category: number) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === productId);
      
      if (existingItemIndex !== -1) {
        // Si le produit existe déjà, on met à jour sa quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          totalPrice: (updatedItems[existingItemIndex].quantity + quantity) * price
        };
        return updatedItems;
      } else {
        // Si c'est un nouveau produit, on l'ajoute
        const newItem: CartItem = { 
          id: productId,
          name: productName,
          price,
          quantity,
          totalPrice: price * quantity,
          category
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const decreaseQuantity = (productId: number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity - 1;
          if (newQuantity <= 0) {
            // Si la quantité atteint 0, on supprime l'article
            return null;
          }
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.price
          };
        }
        return item;
      }).filter(item => item !== null) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};