import React, { useEffect, useState } from "react";
import type { Category } from "../types/shop.types"; 
import type { Product } from "../types/product.types";
import { CategoryGrid } from "../components/shop/CategoryGrid";
import { CategoryPage } from "./CategoryPage";
import { SellerInterface } from "../components/shop/seller/SellerInterface";
import { ShopHeader } from "../components/shop/ShopHeader";
import { useStockAlerts } from "../contexts/StockAlertProvider";
import { useUser } from "../contexts/UserContext";
import { stockService, type ProductWithCategoryName } from "../components/stock/stockService";

const categories: Category[] = [
    {
      id: 0,
      image: '🍭',
      title: 'Snacks',
    },
    {
      id: 1,
      image: '🥤',
      title: 'Drinks',
    },
    {
      id: 2,
      image: '🍜',
      title: 'Noodles',
    },
    {
      id: 3,
      image: '🍦',
      title: 'Ice Cream',
    }
];


const mockProducts: ProductWithCategoryName[] = [
    {
        id: 1,
        name: 'Chips',
        price: 1.50,
        stock: 2, // Stock faible
        category: 0,
        icon: '🍟',
        brand: 'Lay\'s',
        last_sell: '2025-06-26T14:30:00Z',
        last_sell_quantity: 2,
        metro_name: 'Chips Salées',
        categoryName: 'Snacks'
    },
    {
        id: 2,
        name: 'Snickers',
        price: 2.00,
        stock: 0, // Rupture de stock
        category: 0,
        icon: '🍫',
        brand: 'Mars',
        last_sell: '2025-06-26T16:45:00Z',
        last_sell_quantity: 1,
        metro_name: 'Barre Chocolatée Snickers',
        categoryName: 'Snacks'
    },
    {
        id: 3,
        name: 'Cookies',
        price: 1.75,
        stock: 15, // Stock normal
        category: 0,
        icon: '🍪',
        brand: 'Oreo',
        last_sell: '2025-06-25T11:20:00Z',
        last_sell_quantity: 3,
        metro_name: 'Biscuits Aux Pépites',
        categoryName: 'Snacks'
    },
    {
        id: 4,
        name: 'Kinder Bueno',
        price: 1.50,
        stock: 4,
        category: 0,
        icon: '🍫',
        brand: 'Kinder',
        last_sell: '2025-06-26T18:15:00Z',
        last_sell_quantity: 2,
        metro_name: 'Kinder Bueno Original',
        categoryName: 'Snacks'
    },
    {
        id: 6,
        name: 'Coca Cola',
        price: 2.50,
        stock: 40,
        category: 1,
        icon: '🥤',
        brand: 'Coca-Cola',
        last_sell: '2025-06-26T19:00:00Z',
        last_sell_quantity: 1,
        metro_name: 'Coca-Cola Original 33cl',
        categoryName: 'Drinks'
    },
    {
        id: 10,
        name: 'Monster Mango Loco',
        price: 3.50,
        stock: 0,
        category: 1,
        icon: '🥤',
        brand: 'Monster',
        last_sell: '2025-06-25T20:30:00Z',
        last_sell_quantity: 1,
        metro_name: 'Monster Energy Mango Loco',
        categoryName: 'Drinks'
    },
    {
        id: 12,
        name: 'Ramen',
        price: 4.50,
        stock: 1,
        category: 2,
        icon: '🍜',
        brand: 'Nissin',
        last_sell: '2025-06-25T19:15:00Z',
        last_sell_quantity: 1,
        metro_name: 'Ramen Japonais Traditionnel',
        categoryName: 'Noodles'
    }
];

let shopResetCallback: (() => void) | null = null;

export const resetShopToMain = () => {
  if (shopResetCallback) {
    shopResetCallback();
  }
};

interface ShopProps {
  alertsHaveBeenShown: boolean;
  setAlertsHaveBeenShown: (value: boolean) => void;
}

export const Shop: React.FC<ShopProps> = ({ alertsHaveBeenShown, setAlertsHaveBeenShown }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSellerInterfaceOpen, setIsSellerInterfaceOpen] = useState(false);
  const [isProductSelectionMode, setIsProductSelectionMode] = useState(false);
  const [selectedProductForQuickSale, setSelectedProductForQuickSale] = useState<Product | null>(null);
  const [products, setProducts] = useState<ProductWithCategoryName[]>([]);
  const { user, isLoggedIn } = useUser();
  const { showAlerts, hideAlerts } = useStockAlerts();

  useEffect(() => {
    shopResetCallback = () => {
      setSelectedCategoryId(null);
      setSelectedProductForQuickSale(null);
      setIsProductSelectionMode(false);
      setIsSellerInterfaceOpen(false);
    };

    return () => {
      shopResetCallback = null;
    };
  }, [products]);


  const fetchProducts = async () => {
    if (isLoggedIn && user && (user.role === 'seller' || user.role === 'admin')) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await stockService.getStockAutomatic(token);
          if (response.success && response.data && Array.isArray(response.data)) {
            if (!alertsHaveBeenShown) {
              showAlerts(response.data);
              setAlertsHaveBeenShown(true);
            }
          } else {
            console.warn('No products found or invalid response format, using mock data');
            if (!alertsHaveBeenShown) {
                showAlerts(mockProducts);
                setAlertsHaveBeenShown(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching products for alerts:', error);
           if (!alertsHaveBeenShown) {
                showAlerts(mockProducts);
                setAlertsHaveBeenShown(true);
            }
      }
    }
  };

  useEffect(() => {
    
    if (isLoggedIn && user && (user.role === 'seller' || user.role === 'admin')) {
      // Petit délai pour laisser l'interface se charger
      setTimeout(fetchProducts, 0);
    }
  }, [isLoggedIn, user]);

  const categoryClick = (category: Category) => {
      setSelectedCategoryId(category.id);
      hideAlerts();
  };

  const handleBackToShop = () => {
      setSelectedCategoryId(null);
      setSelectedProductForQuickSale(null);
      setIsProductSelectionMode(false);
  };

  const toggleSellerInterface = () => {
      setIsSellerInterfaceOpen(!isSellerInterfaceOpen);
  };

  const closeSellerInterface = () => {
      setIsSellerInterfaceOpen(false);
      // Clear product selection when closing seller interface
      setSelectedProductForQuickSale(null);
      setIsProductSelectionMode(false);
  };

  const handleProductSelectionMode = (enabled: boolean) => {
      setIsProductSelectionMode(enabled);
      if (!enabled) {
          setSelectedProductForQuickSale(null);
      }
  };

  const handleProductClickForQuickSale = (product: Product) => {
      if (isProductSelectionMode) {
          setSelectedProductForQuickSale(product);
          return true; 
      }
      return false;
  };

  const handleProductAddedToQuickSale = () => {
      setSelectedProductForQuickSale(null);
  };

  const hasSellerPermissions = user?.role && ['seller', 'admin'].includes(user.role);

  if (selectedCategoryId !== null) {
      return (
          <>
              <ShopHeader 
                  onSellerInterfaceToggle={toggleSellerInterface}
                  isSellerInterfaceOpen={isSellerInterfaceOpen}
                  showSellerInterface={!!hasSellerPermissions}

              />
              <CategoryPage 
                  initialCategoryId={selectedCategoryId}
                  onBackToShop={handleBackToShop}
                  // Pass product selection props to CategoryPage
                  isProductSelectionMode={isProductSelectionMode}
                  onProductClickForQuickSale={handleProductClickForQuickSale}
              />
              {hasSellerPermissions && (
                  <SellerInterface 
                      isOpen={isSellerInterfaceOpen}
                      onClose={closeSellerInterface}
                      userRole={user.role}
                      onProductSelectionMode={handleProductSelectionMode}
                      selectedProduct={selectedProductForQuickSale}
                      onProductAddedToCart={handleProductAddedToQuickSale}
                  />
              )}
          </>
      );
  }

  return (
      <>
          <ShopHeader 
              onSellerInterfaceToggle={toggleSellerInterface}
              isSellerInterfaceOpen={isSellerInterfaceOpen}
              showSellerInterface={!!hasSellerPermissions}
          />
          <main>
              <CategoryGrid
                  categories={categories}
                  onCategoryClick={categoryClick}
              />
              {isProductSelectionMode && (
                  <div className="product-selection-overlay">
                      <div className="selection-instructions">
                          <p>🛒 Navigate to a category and click on products to add them to the quick sale cart</p>
                      </div>
                  </div>
              )}
          </main>
          {hasSellerPermissions && (
              <SellerInterface 
                  isOpen={isSellerInterfaceOpen}
                  onClose={closeSellerInterface}
                  userRole={user.role}
                  onProductSelectionMode={handleProductSelectionMode}
                  selectedProduct={selectedProductForQuickSale}
                  onProductAddedToCart={handleProductAddedToQuickSale}
              />
          )}
      </>
  );
};