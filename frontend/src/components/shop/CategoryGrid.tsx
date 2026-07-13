import React from "react";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "../../types/shop.types";
import './CategoryGrid.css';

interface CategoriesGridProps {
    categories: Category[];
    onCategoryClick?: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoriesGridProps> = ({categories, onCategoryClick}) => {
    return (
        <div className="categories-grid">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={onCategoryClick}
                />     
            ))}
        </div>
    );
};