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

  // Trigger mapping API call when component mounts
  useEffect(() => {
    // Wait for document details to load from localStorage
    if (documentLoading) {
      return;
    }

    // Prevent multiple calls
    if (hasTriggeredMapping.current) {
      return;
    }

    const triggerMapping = async () => {
      if (!documentDetails?.extraction_id) {
        toast.error('Extraction ID is missing. Please upload a document first.');
        navigate('/dociq/extractions/upload-document');
        return;
      }

      // Mark as triggered to prevent multiple calls
      hasTriggeredMapping.current = true;

      console.log('Starting mapping process for extraction:', documentDetails.extraction_id);
      const result = await startMapping(documentDetails.extraction_id);

      if (result.success) {
        toast.success('Mapping process started successfully!');
        updateStatus('processing');
        
        // Auto-navigate to results after 3 seconds
        setTimeout(() => {
          if (!hasNavigatedToResults.current) {
            hasNavigatedToResults.current = true;
            updateStatus('completed');
            navigate('/dociq/extractions/extraction-results');
          }
        }, 3000);
      } else {
        toast.error(result.error || 'Failed to start mapping process');
        updateStatus('pending');
      }
    };

    triggerMapping();

    // Cleanup function to reset the flags when component unmounts
    return () => {
      hasTriggeredMapping.current = false;
      hasNavigatedToResults.current = false;
    };
  }, [documentDetails?.extraction_id, documentLoading, startMapping, updateStatus, navigate]);

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