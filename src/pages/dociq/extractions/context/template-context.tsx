import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TemplateDetails {
  id?: string;
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
  isDefault: boolean;
}

interface TemplateContextType {
  selectedTemplate: TemplateDetails | null;
  setSelectedTemplate: (template: TemplateDetails | null) => void;
  clearSelectedTemplate: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);

  const clearSelectedTemplate = () => {
    setSelectedTemplate(null);
  };

  return (
    <TemplateContext.Provider
      value={{
        selectedTemplate,
        setSelectedTemplate,
        clearSelectedTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
} 