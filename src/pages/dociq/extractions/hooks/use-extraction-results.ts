import { useState } from 'react';
import { toast } from 'sonner';

// API URL configuration following existing pattern
const getApiUrl = (extractionId: string) => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return `/api/dociq/extractions/${extractionId}/results`;
  } else {
    // Use direct API in production
    return `https://api.consolidator-ai.site/api/v1/dociq/extractions/${extractionId}/results`;
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

  // Try to get context if available
  let contextSetResults: ((results: ExtractionResult | null) => void) | null = null;
  try {
    // Dynamic import to avoid circular dependency
    const { useExtractionResultsContext } = require('../context/extraction-results-context');
    const context = useExtractionResultsContext();
    contextSetResults = context.setExtractionResults;
  } catch (error) {
    // Context not available, continue without it
  }

  const fetchResults = async (extractionId: string): Promise<ExtractionResultsResponse> => {
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
      // Also update context if available
      if (contextSetResults) {
        contextSetResults(data);
      }
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
  };

  const pollResults = async (extractionId: string, maxAttempts: number = 30, interval: number = 2000): Promise<ExtractionResultsResponse> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await fetchResults(extractionId);
      
      if (result.success && result.data) {
        return result;
      }
      
      // If it's the last attempt, return the error
      if (attempt === maxAttempts - 1) {
        return result;
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return {
      success: false,
      error: 'Timeout: Extraction results not available after maximum attempts'
    };
  };

  return {
    fetchResults,
    pollResults,
    results,
    isLoading
  };
} 