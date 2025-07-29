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
  isLoading: boolean;
}

const ExtractionResultsContext = createContext<ExtractionResultsContextType | undefined>(undefined);

interface ExtractionResultsProviderProps {
  children: ReactNode;
}

export function ExtractionResultsProvider({ children }: ExtractionResultsProviderProps) {
  const [extractionResults, setExtractionResults] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load extraction results from localStorage on mount
  useEffect(() => {
    console.log('ExtractionResultsProvider: Loading from localStorage...');
    const storedResults = localStorage.getItem('dociq_extraction_results');
    console.log('ExtractionResultsProvider: Raw stored results:', storedResults);
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        console.log('ExtractionResultsProvider: Parsed results:', parsedResults);
        setExtractionResults(parsedResults);
        console.log('ExtractionResultsProvider: Set extraction results in state');
      } catch (error) {
        console.error('ExtractionResultsProvider: Failed to parse stored extraction results:', error);
        localStorage.removeItem('dociq_extraction_results');
      }
    } else {
      console.log('ExtractionResultsProvider: No stored results found in localStorage');
    }
    setIsLoading(false); // Set loading to false after data is loaded
  }, []);

  const clearExtractionResults = () => {
    console.log('ExtractionResultsProvider: Clearing extraction results');
    setExtractionResults(null);
    localStorage.removeItem('dociq_extraction_results');
  };

  console.log('ExtractionResultsProvider: Current extractionResults state:', extractionResults);

  return (
    <ExtractionResultsContext.Provider
      value={{
        extractionResults,
        setExtractionResults,
        clearExtractionResults,
        isLoading, // Pass loading state to context
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