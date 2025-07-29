import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DocumentDetails } from '../types/extraction-types';
import { TemplateDetails } from './template-context';

interface ExtractionResult {
  id: string;
  target_mappings: Array<{
    target_field: string;
    target_value: string;
    target_confidence: number | null;
  }>;
  overall_confidence: number;
  created_at: string;
  updated_at: string;
}

interface ExtractionSession {
  sessionId: string;
  documentDetails: DocumentDetails | null;
  selectedTemplate: TemplateDetails | null;
  extractionResults: ExtractionResult | null;
  currentStep: 'upload' | 'select-template' | 'process' | 'results';
  isActive: boolean;
  createdAt?: string;
  processingState?: {
    progress: number;
    timeElapsed: number;
    estimatedTime: number;
    stepsCompleted: number;
    totalSteps: number;
    status: 'pending' | 'processing' | 'completed';
  };
}

interface ExtractionSessionContextType {
  session: ExtractionSession | null;
  startNewSession: () => void;
  updateDocumentDetails: (details: DocumentDetails) => void;
  updateSelectedTemplate: (template: TemplateDetails) => void;
  updateExtractionResults: (results: ExtractionResult) => void;
  updateCurrentStep: (step: ExtractionSession['currentStep']) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const ExtractionSessionContext = createContext<ExtractionSessionContextType | undefined>(undefined);

interface ExtractionSessionProviderProps {
  children: ReactNode;
}

const SESSION_STORAGE_KEY = 'dociq_current_session';

export function ExtractionSessionProvider({ children }: ExtractionSessionProviderProps) {
  const [session, setSession] = useState<ExtractionSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        // Only restore session if it's from today (prevent old sessions)
        const sessionDate = new Date(parsedSession.createdAt || 0);
        const today = new Date();
        const isToday = sessionDate.toDateString() === today.toDateString();
        
        if (isToday && parsedSession.isActive) {
          setSession(parsedSession);
        } else {
          // Clear old session
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        ...session,
        createdAt: session.createdAt || new Date().toISOString()
      }));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  const startNewSession = () => {
    const newSession: ExtractionSession = {
      sessionId: `session_${Date.now()}`,
      documentDetails: null,
      selectedTemplate: null,
      extractionResults: null,
      currentStep: 'upload',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setSession(newSession);
  };

  const updateDocumentDetails = (details: DocumentDetails) => {
    if (session) {
      setSession({
        ...session,
        documentDetails: details,
        currentStep: 'select-template'
      });
    }
  };

  const updateSelectedTemplate = (template: TemplateDetails) => {
    if (session) {
      setSession({
        ...session,
        selectedTemplate: template,
        currentStep: 'process'
      });
    }
  };

  const updateExtractionResults = (results: ExtractionResult) => {
    if (session) {
      setSession({
        ...session,
        extractionResults: results,
        currentStep: 'results'
      });
    }
  };

  const updateCurrentStep = (step: ExtractionSession['currentStep']) => {
    if (session) {
      setSession({
        ...session,
        currentStep: step
      });
    }
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <ExtractionSessionContext.Provider
      value={{
        session,
        startNewSession,
        updateDocumentDetails,
        updateSelectedTemplate,
        updateExtractionResults,
        updateCurrentStep,
        clearSession,
        isLoading
      }}
    >
      {children}
    </ExtractionSessionContext.Provider>
  );
}

export function useExtractionSession() {
  const context = useContext(ExtractionSessionContext);
  if (context === undefined) {
    throw new Error('useExtractionSession must be used within an ExtractionSessionProvider');
  }
  return context;
} 