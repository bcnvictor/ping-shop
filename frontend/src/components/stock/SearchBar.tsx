import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Find an article by name..." 
}) => {
  return (
    <div className="search-bar-wrapper">
      <Search className="search-bar-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-bar-input"
      />
    </div>
  );
};