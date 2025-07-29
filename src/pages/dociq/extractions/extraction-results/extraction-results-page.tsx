import { Fragment, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Captions } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ExtractionResultsContent } from '.';
import { Steps } from '../steps';
import { SaveResultsModal } from './components/save-results-modal';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionResultsContext } from '../context/extraction-results-context';

export function ExtractionResultsPage() {
  console.log('=== ExtractionResultsPage START ===');
  console.log('ExtractionResultsPage component is rendering...');
  
  // Minimal test - just return a simple div
  console.log('Rendering minimal test component');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>EXTRACTION RESULTS PAGE LOADED!</h1>
      <p>If you can see this, the page is working!</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
} 