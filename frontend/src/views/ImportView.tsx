// ImportView - CSV import page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CsvImporter from '../components/CsvImporter';

export const ImportView: React.FC = () => {
  const navigate = useNavigate();

  const handleImportComplete = () => {
    // Navigate to traces list after successful import
    setTimeout(() => {
      navigate('/traces');
    }, 2000);
  };

  return (
    <div className="import-view" style={{ padding: '2rem' }}>
      <CsvImporter onImportComplete={handleImportComplete} />
    </div>
  );
};

export default ImportView;
