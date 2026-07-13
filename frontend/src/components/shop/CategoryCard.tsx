import React from "react";
import type { Category } from "../../types/shop.types";
import './CategoryCard.css';

interface CategoryCardProps{
    category: Category;
    onClick?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({category, onClick}) => {
    return (
        <div
            className="category-card"
            onClick={() => onClick?.(category)} // Pas sur ici, enlever si necessaire
        >
            <div className='card-image'>
                {category.image}
            </div>
            <div className='card-title'>
                {category.title}
            </div>
        </div>
    );
};