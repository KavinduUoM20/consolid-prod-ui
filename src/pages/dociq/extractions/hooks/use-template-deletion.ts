import { useState } from 'react';

export interface DeleteTemplateResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

// Use proxy in development, direct API in production
const getApiUrl = (templateId: string) => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return `/api/dociq/templates/${templateId}/`;
  } else {
    // Use direct API in production
    return `https://api.consolidator-ai.site/api/v1/dociq/templates/${templateId}`;
  }
};

export function useTemplateDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTemplate = async (templateId: string): Promise<DeleteTemplateResponse> => {
    if (!templateId) {
      return {
        success: false,
        error: 'Template ID is required'
      };
    }

    setIsDeleting(true);

    try {
      const apiUrl = getApiUrl(templateId);
      console.log('Deleting template at:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
      console.log('Template ID:', templateId);

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete template response status:', response.status);
      console.log('Delete template response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete Template API Error Response:', errorText);
        throw new Error(`Failed to delete template: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Delete Template API Response data:', data);

      return {
        success: true,
        data: {
          message: data.message || 'Template deleted successfully'
        }
      };

    } catch (error) {
      console.error('Error deleting template:', error);
      
      // If it's a CORS error, provide a more specific message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server. This might be due to CORS restrictions or network connectivity issues.'
        };
      }
      
      // If it's a mixed content error
      if (error instanceof TypeError && error.message.includes('Mixed Content')) {
        return {
          success: false,
          error: 'Mixed Content Error: The page is loaded over HTTPS but trying to access an insecure resource. Please ensure the API endpoint uses HTTPS.'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteTemplate,
    isDeleting
  };
} 