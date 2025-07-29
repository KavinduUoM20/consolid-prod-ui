import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

interface ExtractionResultsContextType {
  extractionResults: ExtractionResult | null;
  setExtractionResults: (results: ExtractionResult | null) => void;
  clearExtractionResults: () => void;
}

const ExtractionResultsContext = createContext<ExtractionResultsContextType | undefined>(undefined);

interface ExtractionResultsProviderProps {
  children: ReactNode;
}

export function ExtractionResultsProvider({ children }: ExtractionResultsProviderProps) {
  const [extractionResults, setExtractionResults] = useState<ExtractionResult | null>(null);

  // Load extraction results from localStorage on mount
  useEffect(() => {
    const storedResults = localStorage.getItem('dociq_extraction_results');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setExtractionResults(parsedResults);
      } catch (error) {
        console.error('Failed to parse stored extraction results:', error);
        localStorage.removeItem('dociq_extraction_results');
      }
    }
  }, []);

  const clearExtractionResults = () => {
    setExtractionResults(null);
    localStorage.removeItem('dociq_extraction_results');
  };

  return (
    <ExtractionResultsContext.Provider
      value={{
        extractionResults,
        setExtractionResults,
        clearExtractionResults,
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