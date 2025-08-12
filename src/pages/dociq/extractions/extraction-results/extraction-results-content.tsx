import { Extraction } from '../select-template/components/order';
import { ExtractionMappingTable } from './components/extraction-mapping-table';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionResultsContext } from '../context/extraction-results-context';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { FileText } from 'lucide-react';

export function ExtractionResultsContent() {
  const { documentDetails } = useDocumentStorage();
  const { extractionResults, isLoading } = useExtractionResultsContext();

  // Show loading state while context is loading data
  if (isLoading) {
    return (
      <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Loading Results...
              </h3>
              <p className="text-muted-foreground">
                Loading extraction results from storage...
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-5">
            <Extraction step="extraction-results" />
          </div>
        </div>
      </div>
    );
  }

  // Show error if no document details
  if (!documentDetails?.extraction_id) {
    return (
      <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Extraction Data
              </h3>
              <p className="text-muted-foreground">
                Please start a new extraction to view results.
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-5">
            <Extraction step="extraction-results" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if no results available
  if (!extractionResults) {
    return (
      <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Extraction Results
              </h3>
              <p className="text-muted-foreground">
                Please complete an extraction to view results.
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-5">
            <Extraction step="extraction-results" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:gap-9">
          <div className="lg:col-span-1">
            <ExtractionMappingTable extractionResults={extractionResults} />
          </div>
        </div>
        
                                   {/* Map to Master Button */}
          <div className="flex justify-end pt-4">
            <Button size="lg" className="px-6">
              <Link className="flex items-center gap-2" to="#">
                <FileText className="h-5 w-5" />
                Map to Master
              </Link>
            </Button>
          </div>
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Extraction step="extraction-results" />
        </div>
      </div>
    </div>
  );
} 