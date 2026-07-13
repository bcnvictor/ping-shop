import React from 'react';
import MultiSelectDropdown from './MultiSelect';
import './StockFilters.css';

interface StockFiltersProps {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  onCategoriesChange: (categories: string[]) => void;
  onBrandsChange: (brands: string[]) => void;
  activeFilters?: Array<{ label: string; value: string; type: string }>;
  onRemoveFilter?: (filter: { type: string; value: string }) => void;
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  onCategoriesChange,
  onBrandsChange,
  activeFilters = [],
  onRemoveFilter
}) => {
  return (
    <div className="stock-filters-wrapper">
      <MultiSelectDropdown
        label="Category"
        options={categories}
        selectedValues={selectedCategories}
        onChange={onCategoriesChange}
      />

      <MultiSelectDropdown
        label="Brand"
        options={brands}
        selectedValues={selectedBrands}
        onChange={onBrandsChange}
      />

      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter, index) => (
            <button
              key={`${filter.type}-${filter.value}-${index}`}
              className="filter-tag"
              onClick={() => onRemoveFilter?.({ type: filter.type, value: filter.value })}
            >
              {filter.label} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
};