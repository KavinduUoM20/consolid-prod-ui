import { useState } from 'react';
import { toast } from 'sonner';

export interface CreateTemplateData {
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
}

export interface CreateTemplateResponse {
  success: boolean;
  data?: {
    id: string;
    message: string;
  };
  error?: string;
}

// Use proxy in development, direct API in production
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return '/api/dociq/templates/';
  } else {
    // Use direct API in production
    return 'https://api.consolidator-ai.site/api/v1/dociq/templates';
  }
};

export function useTemplateCreation() {
  const [isCreating, setIsCreating] = useState(false);

  const createTemplate = async (templateData: CreateTemplateData): Promise<CreateTemplateResponse> => {
    if (!templateData.title || !templateData.department) {
      return {
        success: false,
        error: 'Template title and department are required'
      };
    }

    setIsCreating(true);

    try {
      const apiUrl = getApiUrl();
      console.log('Creating template at:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
      console.log('Template data:', templateData);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateData.title,
          type: 'extraction',
          category: templateData.department,
          description: templateData.description,
          status: templateData.status,
          field_mappings: [], // Empty field mappings for new template
          header_row: null,
          sheetname: null,
          fields: templateData.fields,
        }),
      });

      console.log('Create template response status:', response.status);
      console.log('Create template response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create Template API Error Response:', errorText);
        throw new Error(`Failed to create template: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Create Template API Response data:', data);

      return {
        success: true,
        data: {
          id: data.id || `template-${Date.now()}`,
          message: data.message || 'Template created successfully'
        }
      };

    } catch (error) {
      console.error('Error creating template:', error);
      
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
        error: error instanceof Error ? error.message : 'Failed to create template'
      };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTemplate,
    isCreating
  };
} 