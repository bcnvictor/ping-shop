import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import './CsvControls.css';

interface CSVControlsProps {
  onImport: (file: File) => Promise<void>;
  onExport: () => Promise<void>;
  disabled?: boolean;
}

export const CSVControls: React.FC<CSVControlsProps> = ({ onImport, onExport, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    await onImport(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="csv-controls">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <button
        className="csv-button csv-import"
        onClick={handleImportClick}
        disabled={disabled}
        title="Import products from CSV"
      >
        <Upload size={16} />
        <span>Import CSV</span>
      </button>
      
      <button
        className="csv-button csv-export"
        onClick={onExport}
        disabled={disabled}
        title="Export products to CSV"
      >
        <Download size={16} />
        <span>Export CSV</span>
      </button>
    </div>
  );
};