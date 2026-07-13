import React, { useState, useEffect } from "react";
import type { Product } from "../../types/product.types";
import { ProductCard } from "./ProductCard";
import './ProductGridWhite.css';

interface ProductGridProps {
    products: Product[];
    categoryTitle: string;
    isProductSelectionMode?: boolean;
    onProductClickForQuickSale?: (product: Product) => boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
    products, 
    isProductSelectionMode = false,
    onProductClickForQuickSale
}) => {
    const [selectedProductKey, setSelectedProductKey] = useState<string | null>(null);

    useEffect(() => {
        setSelectedProductKey(null);
    }, [products]);

    useEffect(() => {
        if (isProductSelectionMode) {
            setSelectedProductKey(null);
        }
    }, [isProductSelectionMode]);

    // Génère une clé unique basée sur l'ID et la catégorie
    const getProductKey = (product: Product) => `${product.category}-${product.id}`;

    const handleProductClick = (product: Product) => {
        const productKey = getProductKey(product);
        // Si déjà sélectionné, on désélectionne
        setSelectedProductKey(selectedProductKey === productKey ? null : productKey);
    };

    const handleAddToCart = (product: Product, quantity: number) => {
        console.log(`Added ${quantity}x ${product.name} to cart`);
        setSelectedProductKey(null);
    };

    const handleQuickSaleClick = (product: Product) => {
        if (onProductClickForQuickSale) {
            return onProductClickForQuickSale(product);
        }
        return false;
    };

    return (
        <div className="product-grid-container">
            {isProductSelectionMode && (
                <div className="quick-sale-mode-banner">
                    <p>🛒 <strong>Quick Sale Mode:</strong> Click on any product to add it to the seller cart</p>
                </div>
            )}
            
            <div className="product-grid-white">
                {products.length === 0 ? (
                    <div className="no-products-message">
                        <p>No products available in this category yet.</p>
                    </div>
                ) : (
                    products.map((product) => {
                        const productKey = getProductKey(product);
                        return (
                            <ProductCard
                                key={productKey}
                                product={product}
                                isSelected={selectedProductKey === productKey}
                                onClick={handleProductClick}
                                onAdd={handleAddToCart}
                                isQuickSaleMode={isProductSelectionMode}
                                onQuickSaleClick={handleQuickSaleClick}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};