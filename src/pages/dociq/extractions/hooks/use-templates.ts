import { useQuery } from '@tanstack/react-query';

export interface ApiTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  status: string;
  field_mappings: Array<{
    target_field: string;
    sample_field_names: string[];
    value_patterns: string[];
    description: string;
    required: boolean;
  }>;
  header_row: string | null;
  sheetname: string | null;
  created_at: string;
  updated_at: string;
  fields: number;
}

export interface TemplateItem {
  default: boolean;
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
  badge?: boolean;
  id?: string;
  type?: string;
  category?: string;
  field_mappings?: ApiTemplate['field_mappings'];
  created_at?: string;
  updated_at?: string;
}

// Use proxy in development, direct API in production
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return '/api/dociq/templates/';
  } else {
    // Use direct API in production (same pattern as extraction endpoint)
    return 'https://api.consolidator-ai.site/api/v1/dociq/templates/';
  }
};

async function fetchTemplates(): Promise<ApiTemplate[]> {
  try {
    const apiUrl = getApiUrl();
    console.log('Fetching templates from:', apiUrl);
    console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      // Don't set explicit headers - let the browser handle them like the working upload endpoint
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error('Templates endpoint not found. Please check if the API endpoint is available.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please check your authentication.');
      } else {
        throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    
    // If it's a CORS error, provide a more specific message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. This might be due to CORS restrictions or network connectivity issues.');
    }
    
    // If it's a mixed content error
    if (error instanceof TypeError && error.message.includes('Mixed Content')) {
      throw new Error('Mixed Content Error: The page is loaded over HTTPS but trying to access an insecure resource. Please ensure the API endpoint uses HTTPS.');
    }
    
    throw error;
  }
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Helper function to transform API template to component template
export function transformApiTemplateToItem(apiTemplate: ApiTemplate, isDefault: boolean = false): TemplateItem {
  return {
    default: isDefault,
    title: apiTemplate.name,
    department: apiTemplate.category || 'General',
    fields: apiTemplate.fields,
    description: apiTemplate.description,
    lastUsed: 'Recently', // API doesn't provide this, so we use a default
    status: apiTemplate.status,
    badge: isDefault,
    id: apiTemplate.id,
    type: apiTemplate.type,
    category: apiTemplate.category,
    field_mappings: apiTemplate.field_mappings,
    created_at: apiTemplate.created_at,
    updated_at: apiTemplate.updated_at,
  };
} 