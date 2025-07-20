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

export function ExtractionResultsPage() {
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Mock extraction data - in a real app, this would come from your extraction results
  const extractionData = {
    extractionId: 'X319330-S24',
    extractionDate: '2025-01-26',
    template: 'Invoice Processing Template',
    documentType: 'PDF',
    fields: [
      { standardField: 'Invoice Number', documentField: 'INV-2025-001', confidence: 98.5 },
      { standardField: 'Invoice Date', documentField: '2025-01-15', confidence: 95.2 },
      { standardField: 'Due Date', documentField: '2025-02-15', confidence: 92.8 },
      { standardField: 'Vendor Name', documentField: 'Tech Solutions Inc.', confidence: 87.3 },
      { standardField: 'Total Amount', documentField: '$450.00', confidence: 96.3 },
    ]
  };

  return (
    <Fragment>
      <Steps currentStep={3} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Extraction results are ready
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <SaveResultsModal
              open={saveModalOpen}
              onOpenChange={setSaveModalOpen}
              extractionData={extractionData}
              trigger={
                <Button variant="outline">
                  <Captions />
                  Save Results
                </Button>
              }
            />
            <Button>
              <Captions />
              <Link to="/dociq/extractions/upload-document">New Extraction</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ExtractionResultsContent />
      </Container>
    </Fragment>
  );
} 