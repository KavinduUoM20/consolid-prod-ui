import { Fragment, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Captions, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ExtractionResultsContent } from '.';
import { Steps } from '../steps';
import { SaveResultsModal } from './components/save-results-modal';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionResultsContext } from '../context/extraction-results-context';

export function ExtractionResultsPage() {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { documentDetails } = useDocumentStorage();
  const { getUpdatedExtractionData, refreshWithNewResults } = useExtractionResultsContext();

  // Get the updated extraction data with any edits
  const updatedExtractionResults = getUpdatedExtractionData();

  // Handle enhance mapping API call
  const handleEnhanceMapping = async () => {
    if (!updatedExtractionResults) {
      console.error('No extraction results available');
      return;
    }

    // Get extraction ID from the extraction results or fallback to documentDetails
    const extractionId = updatedExtractionResults.id || documentDetails?.extraction_id;
    
    if (!extractionId) {
      console.error('Missing extraction ID in both extraction results and document details');
      return;
    }

    console.log('Enhancing extraction with ID:', extractionId);
    console.log('Full extraction data being sent:', updatedExtractionResults);
    console.log('Payload structure:', {
      id: updatedExtractionResults.id,
      target_mappings: updatedExtractionResults.target_mappings,
      overall_confidence: updatedExtractionResults.overall_confidence,
      created_at: updatedExtractionResults.created_at,
      updated_at: updatedExtractionResults.updated_at
    });
    console.log('Target mappings count:', updatedExtractionResults.target_mappings.length);
    console.log('Sample target mapping:', updatedExtractionResults.target_mappings[0]);

    setIsEnhancing(true);
    
    try {
      // Create a clean payload that matches backend expectations
      const enhancePayload = {
        data: {
          extraction_id: extractionId,
          target_mappings: updatedExtractionResults.target_mappings,
          overall_confidence: updatedExtractionResults.overall_confidence
        }
      };
      
      console.log('Sending enhance payload:', enhancePayload);
      
      // API URL configuration following existing pattern
      const getEnhanceApiUrl = (extractionId: string) => {
        if (import.meta.env.DEV) {
          // Use proxy in development to avoid CORS
          return `/api/dociq/extractions/${extractionId}/enhance`;
        } else {
          // Use direct API in production
          return `https://api.consolidator-ai.site/api/v1/dociq/extractions/${extractionId}/enhance`;
        }
      };

      const enhanceApiUrl = getEnhanceApiUrl(extractionId);
      console.log('Calling enhance API at:', enhanceApiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');

      const response = await fetch(enhanceApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancePayload),
      });

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          errorDetails = response.statusText;
        }
        throw new Error(`API call failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
      }

      const enhancedResults = await response.json();
      
      console.log('Raw API response:', enhancedResults);
      console.log('Response structure:', Object.keys(enhancedResults));
      console.log('Has target_mappings?', 'target_mappings' in enhancedResults);
      
      // Check if the response has the expected structure
      if (!enhancedResults.target_mappings) {
        console.error('API response missing target_mappings:', enhancedResults);
        throw new Error('Invalid API response: missing target_mappings field');
      }
      
      // Refresh with enhanced results (this will update both extraction results and reset edited mappings)
      refreshWithNewResults(enhancedResults);
      
      console.log('Extraction enhanced successfully:', enhancedResults);
      
    } catch (error) {
      console.error('Failed to enhance extraction:', error);
      // You can add toast notification here for better UX
    } finally {
      setIsEnhancing(false);
    }
  };

  // Transform updated results to modal data
  const extractionData = updatedExtractionResults ? {
    extractionId: documentDetails?.extraction_id || 'Unknown',
    extractionDate: new Date(updatedExtractionResults.created_at).toLocaleDateString(),
    template: 'Invoice Processing Template', // This could come from template context
    documentType: documentDetails?.type || 'PDF',
    fields: updatedExtractionResults.target_mappings.map((mapping: any) => ({
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
            <Button 
              onClick={handleEnhanceMapping}
              disabled={isEnhancing || !updatedExtractionResults || !(updatedExtractionResults.id || documentDetails?.extraction_id)}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Captions />
                  Enhance Mapping
                </>
              )}
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