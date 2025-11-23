// CsvImporter Component - CSV file upload with drag-and-drop
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button, Alert } from '@sendle/sds-ui';
import { apiService } from '../../services/api';
import './CsvImporter.scss';

interface CsvImporterProps {
  onImportComplete?: () => void;
}

interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
  total: number;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file extension
    if (!file.name.endsWith('.csv')) {
      return 'Please select a CSV file';
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.importCSV(selectedFile);
      setResult(response);
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImportComplete?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to import CSV';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearResult = () => {
    setResult(null);
  };

  return (
    <div className="csv-importer">
      <div
        className={`csv-importer__dropzone ${isDragging ? 'csv-importer__dropzone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          aria-label="CSV file input"
        />

        <div className="csv-importer__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="48"
            height="48"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
          </svg>
        </div>

        <p className="csv-importer__text">
          Click or drag CSV file here to upload
        </p>

        <p className="csv-importer__hint">
          CSV must contain required fields: trace_id, flow_session, turn_number, user_message, ai_response
        </p>
      </div>

      {error && (
        <Alert variant="risk" className="csv-importer__alert" onClose={clearError}>
          {error}
        </Alert>
      )}

      {selectedFile && (
        <div className="csv-importer__file-info">
          <p><strong>Selected file:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploading}
            className="csv-importer__upload-button"
          >
            {uploading ? 'Importing...' : `Import ${selectedFile.name}`}
          </Button>
        </div>
      )}

      {result && (
        <Alert variant="success" className="csv-importer__alert" onClose={clearResult}>
          <strong>Import Complete!</strong>
          <br />
          {result.message}
          <br />
          Imported: {result.imported} | Skipped: {result.skipped} | Total: {result.total}
        </Alert>
      )}
    </div>
  );
};

export default CsvImporter;
