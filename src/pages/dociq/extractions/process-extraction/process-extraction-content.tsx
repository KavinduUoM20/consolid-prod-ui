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

  // Add a check to prevent mapping if user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      isMounted.current = false;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const triggerMapping = async () => {
      // Mark as triggered to prevent multiple calls
      hasTriggeredMapping.current = true;
      mappingInProgress.current = true;

      // Set status to processing to start the progress simulation
      updateStatus('processing');
      
      // Add a timeout to prevent indefinite blocking
      timeoutId = setTimeout(() => {
        if (!isCancelled) {
          mappingInProgress.current = false;
          updateStatus('pending');
        }
      }, 30000); // 30 second timeout
      
      try {
        const result = await startMapping(documentDetails.extraction_id!);
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        // Check if component was unmounted during the API call
        if (isCancelled || !isMounted.current) {
          return;
        }

        if (result.success) {
          // Store the results data from the mapping response
          if (result.data?.result) {
            setExtractionResults(result.data.result);
            
            // Also store in localStorage to ensure persistence across navigation
            localStorage.setItem('dociq_extraction_results', JSON.stringify(result.data.result));
          }
          
          // Show success message with the response message
          const message = result.data?.message || 'Mapping process completed successfully!';
          toast.success(message);
          updateStatus('completed');
          
          // Navigate to results page immediately since we have the data
          // Add a small delay to ensure state updates are processed
          setTimeout(() => {
            if (isMounted.current && !isCancelled && !hasNavigatedToResults.current) {
              hasNavigatedToResults.current = true;
              // Navigate immediately to prevent cleanup from interfering
              navigate('/dociq/extractions/extraction-results');
            }
          }, 100);
        } else {
          toast.error(result.error || 'Failed to start mapping process');
          updateStatus('pending');
        }
      } catch (error) {
        console.error('Error in triggerMapping:', error);
        if (!isCancelled) {
          toast.error('An unexpected error occurred during mapping');
          updateStatus('pending');
        }
      } finally {
        // Reset the progress flag only if not cancelled
        if (!isCancelled) {
          mappingInProgress.current = false;
        }
      }
    };

    triggerMapping();

    // Cleanup function to reset the flags when component unmounts
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
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