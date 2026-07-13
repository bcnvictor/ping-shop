export interface Product {
  id: number;
  name: string;
  price: number;
  brand:string;
  stock: number;
  category: number;
  icon: string;
  last_sell: string;
  last_sell_quantity: number;
  metro_name: string;
}

export interface ProductWithCategoryName extends Product {
  categoryName: string;
}