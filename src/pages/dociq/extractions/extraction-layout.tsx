import { ReactNode } from 'react';
import { ExtractionSessionProvider } from './context/extraction-session-context';

interface ExtractionLayoutProps {
  children: ReactNode;
}

export function ExtractionLayout({ children }: ExtractionLayoutProps) {
  return (
    <ExtractionSessionProvider>
      {children}
    </ExtractionSessionProvider>
  );
} 