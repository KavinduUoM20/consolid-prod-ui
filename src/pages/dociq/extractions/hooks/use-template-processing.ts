import { useState } from 'react';
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

interface ProcessTemplateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function useTemplateProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processTemplate = async (extractionId: string, templateId: string): Promise<ProcessTemplateResponse> => {
    if (!extractionId || !templateId) {
      return {
        success: false,
        error: 'Extraction ID and Template ID are required'
      };
    }

    setIsProcessing(true);

    try {
      const apiUrl = getApiUrl(extractionId);
      console.log('Processing template at:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
      console.log('Template ID:', templateId);

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        body: JSON.stringify({
          template_id: templateId
        }),
      });

      console.log('Process template response status:', response.status);
      console.log('Process template response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Process Template API Error Response:', errorText);
        throw new Error(`Failed to process template: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Process Template API Response data:', data);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error processing template:', error);
      
      let errorMessage = 'Failed to process template. Please try again.';
      
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
      setIsProcessing(false);
    }
  };

  return {
    processTemplate,
    isProcessing
  };
} 