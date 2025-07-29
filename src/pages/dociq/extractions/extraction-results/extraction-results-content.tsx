import { Extraction } from '../select-template/components/order';
import { ExtractionMappingTable } from './components/extraction-mapping-table';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useExtractionResultsContext } from '../context/extraction-results-context';
import { useEffect } from 'react';

export function ExtractionResultsContent() {
  const { documentDetails } = useDocumentStorage();
  const { extractionResults } = useExtractionResultsContext();

  // Debug logging
  useEffect(() => {
    console.log('ExtractionResultsContent mounted');
    console.log('documentDetails:', documentDetails);
    console.log('extractionResults from context:', extractionResults);
    
    // Check localStorage directly
    const storedResults = localStorage.getItem('dociq_extraction_results');
    console.log('Stored results from localStorage:', storedResults);
    
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        console.log('Parsed localStorage results:', parsed);
      } catch (error) {
        console.error('Error parsing localStorage results:', error);
      }
    }
  }, [documentDetails, extractionResults]);

  // Show error if no document details
  if (!documentDetails?.extraction_id) {
    console.log('No document details found, showing error message');
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
    console.log('No extraction results found, showing loading message');
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

  console.log('Rendering extraction results table with data:', extractionResults);

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