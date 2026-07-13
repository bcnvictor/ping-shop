import React, { useState, useEffect } from "react";
import { CategorySidebar } from "../components/shop/CategorySideBar";
import { ProductGrid } from "../components/shop/ProductGridWhite";
import { stockService, type ProductWithCategoryName } from "../components/stock/stockService";
import type { Category } from "../types/shop.types";
import type { Product } from "../types/product.types";
import './CategoryPage.css';

const categories: Category[] = [
    { id: 0, image: '🍭', title: 'Snacks' }, 
    { id: 1, image: '🥤', title: 'Drinks' }, 
    { id: 2, image: '🍜', title: 'Noodles' }, 
    { id: 3, image: '🍦', title: 'Ice Cream' }, 
];

interface CategoryPageProps {
    initialCategoryId?: number;
    onBackToShop: () => void;
    isProductSelectionMode?: boolean;
    onProductClickForQuickSale?: (product: Product) => boolean;
    products?: ProductWithCategoryName[];
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ 
    initialCategoryId = 0, 
    onBackToShop,
    isProductSelectionMode = false,
    onProductClickForQuickSale
}) => {
    const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
    const [products, setProducts] = useState<ProductWithCategoryName[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Produit de démo pour tester l'affichage
    const getBackUpProducts = (): ProductWithCategoryName[] => {
        return [
            {
                id: 999,
                name: 'Coca-Cola Original',
                price: 2.50,
                brand: 'Coca-Cola',
                stock: 15,
                category: 1,
                icon: 'https://boutique.aux-delices-sanilhacois.fr/images/produits/24/1617361210-Coca-cola.jpg',
                last_sell: '2025-06-26T19:00:00Z',
                last_sell_quantity: 2,
                metro_name: 'Coca-Cola Original 33cl',
                categoryName: 'Drinks'
            },
            {
                id: 998,
                name: 'Lipton Ice Tea',
                price: 2.20,
                brand: 'PesciCo',
                stock: 3,
                category: 1,
                icon: 'https://toptanmarket.fr/wp-content/uploads/2020/11/24-x-33cl-Lipton-Peche-1.png',
                last_sell: '2025-06-26T15:45:00Z',
                last_sell_quantity: 1,
                metro_name: 'Lipton Ice Tea pêche 33cl',
                categoryName: 'Drinks'
            },
            {
                id: 997,
                name: 'Pepsi Cola',
                price: 2.30,
                brand: 'PepsiCo',
                stock: 0,
                category: 1,
                icon: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop&crop=center',
                last_sell: '2025-06-25T17:20:00Z',
                last_sell_quantity: 2,
                metro_name: 'Pepsi Cola 33cl',
                categoryName: 'Drinks'
            },
            {
                id: 996,
                name: 'Chips Lay\'s',
                price: 1.50,
                brand: 'Lay\'s',
                stock: 25,
                category: 0,
                icon: 'https://www.valgourmand.com/36714-superlarge_default/chips-barbecue-lays-145g.jpg',
                last_sell: '2025-06-26T14:30:00Z',
                last_sell_quantity: 3,
                metro_name: 'Chips Salées Original',
                categoryName: 'Snacks'
            }
        ];
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('token');
            
            if (token) {
                const response = await stockService.getStockAutomatic(token);
                
                if (response.success && response.data && response.data.length > 0) {
                    setProducts(response.data);
                    setLoading(false);
                    return;
                }
            }
            
            console.log('Using fallback products for demonstration');
            setProducts(getBackUpProducts());
            setUsingFallback(true);
            
        } catch (error) {
            console.error('Error fetching products, using fallback:', error);
            setProducts(getBackUpProducts());
            setUsingFallback(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: Category) => {
        setActiveCategoryId(category.id);
    };

    const activeCategory = categories.find(cat => cat.id === activeCategoryId);
    
    const categoryProducts = products.filter(product => 
        product.category === activeCategoryId
    );

    if (loading) {
        return (
            <main className="category-page">
                <button className="back-button" onClick={onBackToShop}>
                    ← Back to Shop
                </button>
                <div className="category-page-content">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '400px',
                        fontSize: '1.2rem',
                        color: '#666'
                    }}>
                        Loading products...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="category-page">  
            {usingFallback && (
                <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeeba', 
                    color: '#856404',   
                    padding: '10px 15px',
                    borderRadius: '5px',
                    margin: '10px 0',
                    fontSize: '0.9rem'
                }}>
                    On est juste entrain de tester calmez-vous
                </div>
            )}
            
            <div className="category-page-content">
                <CategorySidebar
                    categories={categories}
                    activeCategory={activeCategoryId}
                    onCategoryClick={handleCategoryClick}
                />
                <ProductGrid
                    products={categoryProducts}
                    categoryTitle={activeCategory?.title || 'Products'}
                    isProductSelectionMode={isProductSelectionMode}
                    onProductClickForQuickSale={onProductClickForQuickSale}
                />
            </div>
        </main>
    );
};