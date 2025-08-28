import { useState } from 'react';
import { toast } from 'sonner';

// API URL configuration following existing pattern
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Use proxy in development to avoid CORS
    return '/api/dociq/extractions/';
  } else {
    // Use direct API in production
    return 'https://api.consolidator-ai.site/api/v1/dociq/extractions/';
  }
};

interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface UploadOptions {
  headers?: Record<string, string>;
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (file: File, options?: UploadOptions): Promise<UploadResponse> => {
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      };
    }

    setIsUploading(true);

    try {
      const apiUrl = getApiUrl();
      console.log('Uploading document to:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
      console.log('File being uploaded:', file.name, file.size, file.type);
      console.log('Upload headers:', options?.headers);

      // Create FormData with the file
      const formData = new FormData();
      formData.append('file', file);

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: 'POST',
        body: formData,
      };

      // Add headers if provided
      if (options?.headers) {
        fetchOptions.headers = options.headers;
      }

      const response = await fetch(apiUrl, fetchOptions);

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload API Error Response:', errorText);
        throw new Error(`Failed to upload document: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload API Response data:', data);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error uploading document:', error);
      
      let errorMessage = 'Failed to upload document. Please try again.';
      
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
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading
  };
} 