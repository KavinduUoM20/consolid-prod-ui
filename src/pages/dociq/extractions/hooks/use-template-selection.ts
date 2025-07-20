import { useState, useEffect } from 'react';

export interface TemplateDetails {
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
  isDefault: boolean;
}

const STORAGE_KEY = 'dociq_selected_template';
const STORAGE_EVENT = 'dociq_template_updated';

export function useTemplateSelection() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected template from localStorage
  const loadTemplateFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedTemplate(parsed);
      } catch (error) {
        console.error('Failed to parse stored template details:', error);
      }
    } else {
      setSelectedTemplate(null);
    }
  };

  // Load selected template from localStorage on mount
  useEffect(() => {
    loadTemplateFromStorage();
    setIsLoading(false);
  }, []);

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadTemplateFromStorage();
      }
    };

    const handleCustomEvent = () => {
      loadTemplateFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STORAGE_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STORAGE_EVENT, handleCustomEvent);
    };
  }, []);

  // Save selected template to localStorage and notify other components
  const saveSelectedTemplate = (template: TemplateDetails | null) => {
    setSelectedTemplate(template);
    if (template) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  };

  // Clear selected template
  const clearSelectedTemplate = () => {
    setSelectedTemplate(null);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  };

  return {
    selectedTemplate,
    setSelectedTemplate: saveSelectedTemplate,
    clearSelectedTemplate,
    isLoading,
  };
} 