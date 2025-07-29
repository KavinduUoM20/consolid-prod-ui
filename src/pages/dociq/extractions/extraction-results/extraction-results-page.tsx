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
  console.log('ExtractionResultsPage component is rendering...');
  
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const { documentDetails } = useDocumentStorage();
  const { extractionResults } = useExtractionResultsContext();

  console.log('ExtractionResultsPage - documentDetails:', documentDetails);
  console.log('ExtractionResultsPage - extractionResults:', extractionResults);

  // Transform API results to modal data with error handling
  const extractionData = (() => {
    try {
      if (extractionResults) {
        return {
          extractionId: documentDetails?.extraction_id || 'Unknown',
          extractionDate: new Date(extractionResults.created_at).toLocaleDateString(),
          template: 'Invoice Processing Template', // This could come from template context
          documentType: documentDetails?.type || 'PDF',
          fields: extractionResults.target_mappings.map((mapping: any) => ({
            standardField: mapping.target_field,
            documentField: mapping.target_value || 'Not found',
            confidence: mapping.target_confidence || 0,
          }))
        };
      } else {
        return {
          extractionId: 'Unknown',
          extractionDate: 'Unknown',
          template: 'Unknown',
          documentType: 'Unknown',
          fields: []
        };
      }
    } catch (error) {
      console.error('Error creating extraction data:', error);
      return {
        extractionId: 'Error',
        extractionDate: 'Error',
        template: 'Error',
        documentType: 'Error',
        fields: []
      };
    }
  })();

  console.log('ExtractionResultsPage - extractionData:', extractionData);

  try {
    // Simple test render first
    console.log('Attempting to render ExtractionResultsPage...');
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Extraction Results Page</h1>
        <p className="mb-4">This is a test render to see if the page loads.</p>
        <div className="mb-4">
          <strong>Document Details:</strong> {JSON.stringify(documentDetails)}
        </div>
        <div className="mb-4">
          <strong>Extraction Results:</strong> {JSON.stringify(extractionResults)}
        </div>
        <Button asChild>
          <Link to="/dociq/extractions/upload-document">
            Back to Upload
          </Link>
        </Button>
      </div>
    );
    
    // Original render (commented out for testing)
    /*
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
    */
  } catch (error) {
    console.error('Error rendering ExtractionResultsPage:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Results Page
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the extraction results page.
          </p>
          <Button asChild>
            <Link to="/dociq/extractions/upload-document">
              Start New Extraction
            </Link>
          </Button>
        </div>
      </div>
    );
  }
} 