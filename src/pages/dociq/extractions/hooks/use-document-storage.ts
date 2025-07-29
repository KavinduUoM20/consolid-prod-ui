import { useState, useEffect } from 'react';
import { DocumentDetails } from '../types/extraction-types';

const STORAGE_KEY = 'dociq_document_details';

export function useDocumentStorage() {
  console.log('useDocumentStorage called');
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load document details from localStorage on mount
  useEffect(() => {
    console.log('useDocumentStorage useEffect running');
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Stored document details:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed document details:', parsed);
        setDocumentDetails(parsed);
      } catch (error) {
        console.error('Failed to parse stored document details:', error);
      }
    }
    setIsLoading(false);
    console.log('useDocumentStorage useEffect completed');
  }, []);

  console.log('useDocumentStorage returning:', { documentDetails, isLoading });

  // Save document details to localStorage
  const saveDocumentDetails = (details: DocumentDetails | null) => {
    setDocumentDetails(details);
    if (details) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Clear document details
  const clearDocumentDetails = () => {
    setDocumentDetails(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    documentDetails,
    setDocumentDetails: saveDocumentDetails,
    clearDocumentDetails,
    isLoading,
  };
} 