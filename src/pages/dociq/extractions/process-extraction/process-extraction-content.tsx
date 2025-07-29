import { MoveLeft, SquareMousePointer } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Extraction } from '../select-template/components/order';
import { DocumentProcessor } from './components/document-processor';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionMapping } from '../hooks/use-extraction-mapping';
import { useProcessingContext } from '../context/processing-context';
import { useExtractionResultsContext } from '../context/extraction-results-context';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function ProcessExtractionContent() {
  const { documentDetails, isLoading: documentLoading } = useDocumentStorage();
  const { startMapping, isMapping } = useExtractionMapping();
  const { updateStatus, processingState } = useProcessingContext();
  const { setExtractionResults } = useExtractionResultsContext();
  const navigate = useNavigate();
  const hasTriggeredMapping = useRef(false);
  const hasNavigatedToResults = useRef(false);
  const mappingInProgress = useRef(false);
  const isMounted = useRef(true);

  // Set up cleanup for component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Trigger mapping API call when component mounts - only once
  useEffect(() => {
    // Wait for document details to load from localStorage
    if (documentLoading) {
      return;
    }

    // Prevent multiple calls
    if (hasTriggeredMapping.current || mappingInProgress.current) {
      return;
    }

    // Only proceed if we have an extraction ID
    if (!documentDetails?.extraction_id) {
      toast.error('Extraction ID is missing. Please upload a document first.');
      navigate('/dociq/extractions/upload-document');
      return;
    }

    const triggerMapping = async () => {
      // Mark as triggered to prevent multiple calls
      hasTriggeredMapping.current = true;
      mappingInProgress.current = true;

      console.log('Starting mapping process for extraction:', documentDetails.extraction_id);
      
      try {
        const result = await startMapping(documentDetails.extraction_id!);

        console.log('Mapping result:', result);
        console.log('Result success:', result.success);
        console.log('Result data:', result.data);

        if (result.success) {
          console.log('Mapping successful, proceeding with navigation...');
          
          // Store the results data from the mapping response
          if (result.data?.result) {
            console.log('Setting extraction results:', result.data.result);
            setExtractionResults(result.data.result);
          }
          
          // Show success message with the response message
          const message = result.data?.message || 'Mapping process completed successfully!';
          console.log('Showing success message:', message);
          toast.success(message);
          updateStatus('completed');
          
          // Navigate to results page immediately since we have the data
          console.log('Navigating to extraction results page immediately...');
          console.log('Component mounted:', isMounted.current);
          if (isMounted.current) {
            hasNavigatedToResults.current = true;
            navigate('/dociq/extractions/extraction-results');
          } else {
            console.log('Component unmounted, cannot navigate');
          }
        } else {
          console.log('Mapping failed:', result.error);
          toast.error(result.error || 'Failed to start mapping process');
          updateStatus('pending');
        }
      } catch (error) {
        console.error('Error in triggerMapping:', error);
        toast.error('An unexpected error occurred during mapping');
        updateStatus('pending');
      } finally {
        // Reset the progress flag
        mappingInProgress.current = false;
      }
    };

    triggerMapping();

    // Cleanup function to reset the flags when component unmounts
    return () => {
      hasTriggeredMapping.current = false;
      hasNavigatedToResults.current = false;
      mappingInProgress.current = false;
    };
  }, [documentDetails?.extraction_id, documentLoading]); // Only depend on these stable values

  // Show loading state while document details are being loaded
  if (documentLoading) {
    return (
      <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Loading...
              </h3>
              <p className="text-muted-foreground">
                Loading extraction details...
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-5">
            <Extraction step="process-extraction" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="lg:col-span-2 space-y-5">
        <DocumentProcessor />
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">
            <MoveLeft className="text-base" />
            <Link to="/dociq/extractions/select-template">Select Template</Link>
          </Button>

          <Button 
            onClick={() => {
              if (documentDetails?.extraction_id) {
                console.log('Manual navigation test - navigating to extraction results');
                navigate('/dociq/extractions/extraction-results');
              } else {
                toast.error('No extraction data available');
              }
            }}
            disabled={isMapping || processingState.status === 'processing'}
          >
            {isMapping || processingState.status === 'processing' ? 'Processing...' : 'Complete Extraction'}
            <SquareMousePointer className="text-base" />
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Extraction step="process-extraction" />
        </div>
      </div>
    </div>
  );
} 