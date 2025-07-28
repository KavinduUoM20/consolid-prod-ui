import { MoveLeft, SquareMousePointer } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Extraction } from '../select-template/components/order';
import { DocumentProcessor } from './components/document-processor';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionMapping } from '../hooks/use-extraction-mapping';
import { useExtractionResults } from '../hooks/use-extraction-results';
import { useProcessingContext } from '../context/processing-context';
import { useExtractionResultsContext } from '../context/extraction-results-context';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function ProcessExtractionContent() {
  const { documentDetails } = useDocumentStorage();
  const { startMapping, isMapping } = useExtractionMapping();
  const { pollResults } = useExtractionResults();
  const { updateStatus } = useProcessingContext();
  const { setExtractionResults } = useExtractionResultsContext();
  const navigate = useNavigate();

  // Trigger mapping API call when component mounts
  useEffect(() => {
    const triggerMapping = async () => {
      if (!documentDetails?.extraction_id) {
        toast.error('Extraction ID is missing. Please upload a document first.');
        navigate('/dociq/extractions/upload-document');
        return;
      }

      const result = await startMapping(documentDetails.extraction_id);

      if (result.success) {
        toast.success('Mapping process started successfully!');
        
        // Start polling for results after mapping is initiated
        setTimeout(async () => {
          const resultsResult = await pollResults(documentDetails.extraction_id!);
          
          if (resultsResult.success && resultsResult.data) {
            updateStatus('completed');
            setExtractionResults(resultsResult.data);
            toast.success('Extraction completed successfully!');
            // Navigate to results page after a short delay
            setTimeout(() => {
              navigate('/dociq/extractions/extraction-results');
            }, 1000);
          } else {
            updateStatus('completed'); // Still mark as completed even if results fetch fails
            toast.warning('Mapping completed but results are not yet available. You can check results manually.');
          }
        }, 3000); // Wait 3 seconds before starting to poll
      } else {
        toast.error(result.error || 'Failed to start mapping process');
        updateStatus('pending');
      }
    };

    triggerMapping();
  }, [documentDetails?.extraction_id, startMapping, pollResults, updateStatus, navigate]);

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
            onClick={() => navigate('/dociq/extractions/extraction-results')}
            disabled={isMapping}
          >
            {isMapping ? 'Processing...' : 'Complete Extraction'}
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