import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './MultiSelect.css';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionToggle = (option: string) => {
    if (option === 'all') {
      onChange([]);
    } else {
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange(newValues);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return 'All';
    } else if (selectedValues.length === 1) {
      return selectedValues[0];
    } else {
      return `${selectedValues.length} selected`;
    }
  };

  const isAllSelected = selectedValues.length === 0;

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <label className="multi-select-label">{label}:</label>
      <div className="multi-select-wrapper">
        <button
          type="button"
          className="multi-select-trigger"
          onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="multi-select-value">{getDisplayText()}</span>
          <ChevronDown className={`multi-select-icon ${isOpen ? 'open' : ''}`} />
        </button>

        {isOpen && (
          <div className="multi-select-dropdown-menu">
            <label className="multi-select-option">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => handleOptionToggle('all')}
                className="multi-select-checkbox"
              />
              <span className="multi-select-option-text">All</span>
            </label>

            <div className="multi-select-divider"></div>

            {options.filter(opt => opt !== 'all').map(option => (
              <label key={option} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleOptionToggle(option)}
                  className="multi-select-checkbox"
                />
                <span className="multi-select-option-text">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;