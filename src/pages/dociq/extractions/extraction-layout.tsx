import { ReactNode } from 'react';
import { TemplateProvider } from './context/template-context';
import { ProcessingProvider } from './context/processing-context';
import { ExtractionResultsProvider } from './context/extraction-results-context';

interface ExtractionLayoutProps {
  children: ReactNode;
}

export function ExtractionLayout({ children }: ExtractionLayoutProps) {
  return (
    <TemplateProvider>
      <ProcessingProvider>
        <ExtractionResultsProvider>
          {children}
        </ExtractionResultsProvider>
      </ProcessingProvider>
    </TemplateProvider>
  );
} 