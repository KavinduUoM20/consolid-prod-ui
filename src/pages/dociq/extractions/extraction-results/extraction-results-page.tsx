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
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const { documentDetails } = useDocumentStorage();
  const { extractionResults } = useExtractionResultsContext();

  // Transform API results to modal data
  const extractionData = extractionResults ? {
    extractionId: documentDetails?.extraction_id || 'Unknown',
    extractionDate: new Date(extractionResults.created_at).toLocaleDateString(),
    template: 'Invoice Processing Template', // This could come from template context
    documentType: documentDetails?.type || 'PDF',
    fields: extractionResults.target_mappings.map((mapping: any) => ({
      standardField: mapping.target_field,
      documentField: mapping.target_value || 'Not found',
      confidence: mapping.target_confidence || 0,
    }))
  } : {
    extractionId: 'Unknown',
    extractionDate: 'Unknown',
    template: 'Unknown',
    documentType: 'Unknown',
    fields: []
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
              <Link to="/dociq/extractions/upload-document">Enhance Mapping</Link>
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