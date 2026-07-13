export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  category: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (productId: number, productName: string, price: number, quantity: number, category: number) => void;
  removeItem: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}