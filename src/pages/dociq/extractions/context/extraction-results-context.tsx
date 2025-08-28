import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ExtractionResult {
  id: string;
  target_mappings: Array<{
    target_field: string;
    target_value: string;
    target_confidence: number | null;
  }>;
  overall_confidence: number;
  created_at: string;
  updated_at: string;
}

interface EditedMapping {
  target_field: string;
  target_value: string;
  target_confidence: number | null;
}

interface ExtractionResultsContextType {
  extractionResults: ExtractionResult | null;
  setExtractionResults: (results: ExtractionResult | null) => void;
  clearExtractionResults: () => void;
  isLoading: boolean;
  editedMappings: EditedMapping[];
  updateMappingField: (targetField: string, newValue: string) => void;
  getUpdatedExtractionData: () => ExtractionResult | null;
  refreshWithNewResults: (results: ExtractionResult) => void;
}

const ExtractionResultsContext = createContext<ExtractionResultsContextType | undefined>(undefined);

interface ExtractionResultsProviderProps {
  children: ReactNode;
}

export function ExtractionResultsProvider({ children }: ExtractionResultsProviderProps) {
  const [extractionResults, setExtractionResults] = useState<ExtractionResult | null>(null);
  const [editedMappings, setEditedMappings] = useState<EditedMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load extraction results from localStorage on mount
  useEffect(() => {
    const storedResults = localStorage.getItem('dociq_extraction_results');
    const storedEditedMappings = localStorage.getItem('dociq_edited_mappings');
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setExtractionResults(parsedResults);
      } catch (error) {
        console.error('ExtractionResultsProvider: Failed to parse stored extraction results:', error);
        localStorage.removeItem('dociq_extraction_results');
      }
    }

    if (storedEditedMappings) {
      try {
        const parsedEditedMappings = JSON.parse(storedEditedMappings);
        setEditedMappings(parsedEditedMappings);
      } catch (error) {
        console.error('ExtractionResultsProvider: Failed to parse stored edited mappings:', error);
        localStorage.removeItem('dociq_edited_mappings');
      }
    }
    
    setIsLoading(false); // Set loading to false after data is loaded
  }, []);

  // Initialize edited mappings when extraction results are set
  useEffect(() => {
    if (extractionResults && editedMappings.length === 0) {
      const initialEditedMappings = extractionResults.target_mappings.map(mapping => ({
        target_field: mapping.target_field,
        target_value: mapping.target_value,
        target_confidence: mapping.target_confidence,
      }));
      setEditedMappings(initialEditedMappings);
      localStorage.setItem('dociq_edited_mappings', JSON.stringify(initialEditedMappings));
    }
  }, [extractionResults, editedMappings.length]);

  const updateMappingField = (targetField: string, newValue: string) => {
    const updatedMappings = editedMappings.map(mapping =>
      mapping.target_field === targetField
        ? { ...mapping, target_value: newValue }
        : mapping
    );
    setEditedMappings(updatedMappings);
    localStorage.setItem('dociq_edited_mappings', JSON.stringify(updatedMappings));
  };

  const getUpdatedExtractionData = (): ExtractionResult | null => {
    if (!extractionResults) return null;

    return {
      ...extractionResults,
      target_mappings: editedMappings,
      updated_at: new Date().toISOString(), // Update timestamp to reflect edits
    };
  };

  const refreshWithNewResults = (results: ExtractionResult) => {
    console.log('refreshWithNewResults called with:', results);
    
    // Set new extraction results
    setExtractionResults(results);
    localStorage.setItem('dociq_extraction_results', JSON.stringify(results));
    
    // Reset edited mappings to match new results - with defensive programming
    if (results.target_mappings && Array.isArray(results.target_mappings)) {
      const newEditedMappings = results.target_mappings.map(mapping => ({
        target_field: mapping.target_field,
        target_value: mapping.target_value,
        target_confidence: mapping.target_confidence,
      }));
      setEditedMappings(newEditedMappings);
      localStorage.setItem('dociq_edited_mappings', JSON.stringify(newEditedMappings));
    } else {
      console.error('target_mappings is not an array or is undefined:', results.target_mappings);
      setEditedMappings([]);
      localStorage.setItem('dociq_edited_mappings', JSON.stringify([]));
    }
  };

  const clearExtractionResults = () => {
    setExtractionResults(null);
    setEditedMappings([]);
    localStorage.removeItem('dociq_extraction_results');
    localStorage.removeItem('dociq_edited_mappings');
  };

  return (
    <ExtractionResultsContext.Provider
      value={{
        extractionResults,
        setExtractionResults,
        clearExtractionResults,
        isLoading, // Pass loading state to context
        editedMappings,
        updateMappingField,
        getUpdatedExtractionData,
        refreshWithNewResults,
      }}
    >
      {children}
    </ExtractionResultsContext.Provider>
  );
}

export function useExtractionResultsContext() {
  const context = useContext(ExtractionResultsContext);
  if (context === undefined) {
    throw new Error('useExtractionResultsContext must be used within an ExtractionResultsProvider');
  }
  return context;
} 