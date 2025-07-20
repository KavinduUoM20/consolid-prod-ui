import { Extraction } from '../select-template/components/order';
import { ExtractionMappingTable } from './components/extraction-mapping-table';

export function ExtractionResultsContent() {
  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:gap-9">
          <div className="lg:col-span-1">
            <ExtractionMappingTable />
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