import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// API URL configuration following existing pattern
const getApiUrl = (extractionId: string) => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return `/api/dociq/extractions/${extractionId}`;
  } else {
    // Use direct API in production
    return `https://api.consolidator-ai.site/api/v1/dociq/extractions/${extractionId}`;
  }
};

interface ExtractionResult {
  id: string;
  extraction_id: string;
  target_mappings: Array<{
    target_field: string;
    target_value: string;
    target_confidence: number | null;
  }>;
  overall_confidence: number;
  created_at: string;
  updated_at: string;
}

interface ExtractionResultsResponse {
  success: boolean;
  data?: ExtractionResult;
  error?: string;
}

export function useExtractionResults() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ExtractionResult | null>(null);

  // Remove circular dependency - context will be updated from components

  const fetchResults = useCallback(async (extractionId: string): Promise<ExtractionResultsResponse> => {
    if (!extractionId) {
      return {
        success: false,
        error: 'Extraction ID is required'
      };
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiUrl(extractionId);
      console.log('Fetching extraction results from:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Extraction results response status:', response.status);
      console.log('Extraction results response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Extraction Results API Error Response:', errorText);
        throw new Error(`Failed to fetch extraction results: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Extraction Results API Response data:', data);

      setResults(data);
      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error fetching extraction results:', error);
      
      let errorMessage = 'Failed to fetch extraction results. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. This might be due to CORS restrictions or network connectivity issues.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchResults,
    results,
    isLoading
  };
} 