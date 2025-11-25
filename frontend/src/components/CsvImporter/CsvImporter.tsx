// CsvImporter Component - CSV file upload with SDS FileUpload
import React, { useState } from 'react';
import { FileUpload, Alert, Button } from '@sendle/sds-ui';
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

interface FileItem {
  id: number;
  file: File;
  name: string;
  size: number;
  status: string;
  progress: number;
  error?: string;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ onImportComplete }) => {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFilesChange = (files: FileItem[]) => {
    // Get the most recent file (if any)
    if (files.length > 0) {
      const latestFile = files[files.length - 1];

      // Validate file extension
      if (!latestFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(latestFile.file);
      setError(null);
      setResult(null);
    } else {
      setSelectedFile(null);
    }
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
      <FileUpload
        accept=".csv"
        multiple={false}
        maxFiles={1}
        maxFileSize={10 * 1024 * 1024}
        title="Upload CSV"
        dragText="Drag and drop your CSV file here, or"
        browseText="browse files"
        hint="CSV must contain: trace_id, flow_session, turn_number, user_message, ai_response"
        onFilesChange={handleFilesChange}
        className="csv-importer__upload"
      />

      {error && (
        <Alert variant="risk" className="csv-importer__alert" onClose={clearError}>
          {error}
        </Alert>
      )}

      {selectedFile && !uploading && (
        <div className="csv-importer__actions">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            Import {selectedFile.name}
          </Button>
        </div>
      )}

      {uploading && (
        <div className="csv-importer__uploading">
          <p>Importing...</p>
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
