import { Extraction } from '../select-template/components/order';
import { ExtractionMappingTable } from './components/extraction-mapping-table';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionResultsContext } from '../context/extraction-results-context';

export function ExtractionResultsContent() {
  const { documentDetails } = useDocumentStorage();
  const { extractionResults } = useExtractionResultsContext();

  console.log('ExtractionResultsContent - documentDetails:', documentDetails);
  console.log('ExtractionResultsContent - extractionResults:', extractionResults);

  // Show error if no document details
  if (!documentDetails?.extraction_id) {
    console.log('No document details found, showing error state');
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
    console.log('No extraction results found, showing loading state');
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

  console.log('Rendering extraction results with data:', extractionResults);
  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:gap-9">
          <div className="lg:col-span-1">
            <ExtractionMappingTable extractionResults={extractionResults} />
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