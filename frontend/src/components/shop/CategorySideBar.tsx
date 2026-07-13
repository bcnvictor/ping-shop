import React from "react";
import type { Category } from "../../types/shop.types";
import './CategorySideBar.css';

interface CategorySidebarProps {
    categories: Category[];
    activeCategory: number;
    onCategoryClick: (category: Category) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    activeCategory,
    onCategoryClick
}) => {
    return (
        <aside className="category-sidebar">
            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`sidebar-category-item ${
                        activeCategory === category.id ? 'active' : ''
                    }`}
                    onClick={() => onCategoryClick(category)}
                >
                    <div className="sidebar-category-image">
                        {category.image}
                    </div>
                    <div className="sidebar-category-title">
                        {category.title}
                    </div>
                </button>
            ))}
        </aside>
    );
};