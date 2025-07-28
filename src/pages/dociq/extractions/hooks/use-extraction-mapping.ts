import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// API URL configuration following existing pattern
const getApiUrl = (extractionId: string) => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return `/api/dociq/extractions/${extractionId}/map`;
  } else {
    // Use direct API in production
    return `https://api.consolidator-ai.site/api/v1/dociq/extractions/${extractionId}/map`;
  }
};

interface MappingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function useExtractionMapping() {
  const [isMapping, setIsMapping] = useState(false);

  const startMapping = useCallback(async (extractionId: string): Promise<MappingResponse> => {
    if (!extractionId) {
      return {
        success: false,
        error: 'Extraction ID is required'
      };
    }

    setIsMapping(true);

    try {
      const apiUrl = getApiUrl(extractionId);
      console.log('Starting mapping at:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Mapping response status:', response.status);
      console.log('Mapping response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapping API Error Response:', errorText);
        throw new Error(`Failed to start mapping: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Mapping API Response data:', data);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error starting mapping:', error);
      
      let errorMessage = 'Failed to start mapping. Please try again.';
      
      // If it's a CORS error, provide a more specific message
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
      setIsMapping(false);
    }
  }, []);

  return {
    startMapping,
    isMapping
  };
} 