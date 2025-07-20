import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DocumentDetails } from '../types/extraction-types';

interface DocumentContextType {
  documentDetails: DocumentDetails | null;
  setDocumentDetails: (details: DocumentDetails | null) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  clearDocumentData: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'dociq_document_details';

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Load document details from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDocumentDetails(parsed);
      } catch (error) {
        console.error('Failed to parse stored document details:', error);
      }
    }
  }, []);

  // Save document details to localStorage whenever it changes
  const setDocumentDetailsWithStorage = (details: DocumentDetails | null) => {
    setDocumentDetails(details);
    if (details) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearDocumentData = () => {
    setDocumentDetails(null);
    setUploadedFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DocumentContext.Provider
      value={{
        documentDetails,
        setDocumentDetails: setDocumentDetailsWithStorage,
        uploadedFiles,
        setUploadedFiles,
        clearDocumentData,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
} 