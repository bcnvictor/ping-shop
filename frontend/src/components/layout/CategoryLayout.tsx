import React from 'react';
import './CategoryLayout.css';

interface CategoryLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

export const CategoryLayout: React.FC<CategoryLayoutProps> = ({ sidebar, content }) => {
  return (
    <div className="category-layout">
      <div className="category-layout-sidebar">
        {sidebar}
      </div>
      <div className="category-layout-content">
        {content}
      </div>
    </div>
  );
};