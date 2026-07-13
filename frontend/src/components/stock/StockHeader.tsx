import React from 'react';
import { SearchBar } from './SearchBar';
import { StockFilters } from './StockFilters';
import { CSVControls } from './updateStocks/CsvControls';
import { useUser } from '../../contexts/UserContext';
import './StockHeader.css';

interface StockHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  onCategoriesChange: (categories: string[]) => void;
  onBrandsChange: (brands: string[]) => void;
  activeFilters?: Array<{ label: string; value: string; type: string }>;
  onRemoveFilter?: (filter: { type: string; value: string }) => void;
  onImportCSV: (file: File) => Promise<void>;
  onExportCSV: () => Promise<void>;
}

export const StockHeader: React.FC<StockHeaderProps> = (props) => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="stock-header">
      <div className="stock-header-container">
        <div className="stock-header-row">
          <SearchBar 
            searchTerm={props.searchTerm}
            onSearchChange={props.onSearchChange}
          />
          {isAdmin && (
            <CSVControls
              onImport={props.onImportCSV}
              onExport={props.onExportCSV}
            />
          )}
        </div>
        <StockFilters 
          categories={props.categories}
          brands={props.brands}
          selectedCategories={props.selectedCategories}
          selectedBrands={props.selectedBrands}
          onCategoriesChange={props.onCategoriesChange}
          onBrandsChange={props.onBrandsChange}
          activeFilters={props.activeFilters}
          onRemoveFilter={props.onRemoveFilter}
        />
      </div>
    </div>
  );
};