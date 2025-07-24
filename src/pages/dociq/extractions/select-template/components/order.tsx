'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IExtractionItem, IExtractionItems } from '../../types/extraction-types';
import { useDocumentStorage } from '../../hooks/use-document-storage';
import { useTemplateContext } from '../../context/template-context';
import { useProcessingContext } from '../../context/processing-context';

type ExtractionStep = 'upload' | 'select-template' | 'process-extraction' | 'extraction-results';

interface ExtractionProps {
  step?: ExtractionStep;
}

export function Extraction({ step = 'select-template' }: ExtractionProps) {
  const { documentDetails, isLoading: documentLoading } = useDocumentStorage();
  const { selectedTemplate } = useTemplateContext();
  const { processingState } = useProcessingContext();
  const { progress, timeElapsed, estimatedTime, stepsCompleted, totalSteps, status } = processingState;

  // Show loading state
  if (documentLoading) {
    return (
      <Card className="bg-accent/50">
        <CardHeader className="px-5">
          <CardTitle>Extraction Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <div className="text-center text-muted-foreground">
            Loading document details...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default items when no document is uploaded
  const defaultItems: IExtractionItems = [
    { label: 'Document Type', status: 'No file selected' },
    { label: 'Pages', status: '-' },
    { label: 'Processing', status: 'Ready' },
  ];

  // Items when document is uploaded
  const uploadedItems: IExtractionItems = documentDetails ? [
    { label: 'Document Type', status: documentDetails.type },
    { label: 'Pages', status: documentDetails.pages },
    { label: 'Processing', status: documentDetails.processing },
  ] : defaultItems;

  const renderItem = (item: IExtractionItem, index: number) => (
    <div key={index} className="flex justify-between items-center px-5">
      <span className="text-sm font-normal text-secondary-foreground">
        {item.label}
      </span>
      <span className="text-sm font-medium text-mono">{item.status}</span>
    </div>
  );

  const renderExtractionDetails = () => (
    <>
      <span className="text-sm font-medium block text-mono mb-3.5 px-5">
        Extraction Details
      </span>

      <div className="flex flex-col px-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-secondary-foreground">
            Extraction ID
          </span>
          <span className="text-sm font-medium text-mono">
            {documentDetails?.extraction_id || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-secondary-foreground">
            Extraction Date
          </span>
          <span className="text-sm font-medium text-mono">
            26 June, 2025
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-secondary-foreground">
            Total Fields
          </span>
          <span className="text-sm font-medium text-mono">
            12
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-secondary-foreground">
            Extracted For
          </span>
          <span className="text-sm font-medium text-mono">
            Jeroen van Dijk
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-normal text-secondary-foreground">
            Average Confidence
          </span>
          <span className="text-sm font-medium text-mono">
            91%
          </span>
        </div>
      </div>
    </>
  );

  const renderProcessingStatistics = () => (
    <>
      <div className="border-b border-border mb-4 mt-5"></div>
      <div className="flex flex-col px-5">
        <span className="text-sm font-medium text-mono mb-1.5">
          Processing Statistics
        </span>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              Progress
            </span>
            <span className="text-sm font-medium text-mono">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              Time Elapsed
            </span>
            <span className="text-sm font-medium text-mono">
              {timeElapsed}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              Estimated Time
            </span>
            <span className="text-sm font-medium text-mono">
              {progress < 100 ? `${estimatedTime}s` : 'Complete'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              Steps Completed
            </span>
            <span className="text-sm font-medium text-mono">
              {stepsCompleted} / {totalSteps}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              Status
            </span>
            <span className="text-sm font-medium text-mono">
              {status === 'completed' ? 'Completed' : 'Processing'}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const renderTemplateDetails = () => (
    <>
      <div className="border-b border-border mb-4 mt-5"></div>
      <span className="text-sm font-medium block text-mono mb-3.5 px-5">
        Template Details
      </span>

      <div className="flex flex-col px-5">
        {selectedTemplate ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Template Name
              </span>
              <span className="text-sm font-medium text-mono truncate max-w-32">
                {selectedTemplate.title}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Department
              </span>
              <span className="text-sm font-medium text-mono">
                {selectedTemplate.department}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Fields Count
              </span>
              <span className="text-sm font-medium text-mono">
                {selectedTemplate.fields}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Status
              </span>
              <span className="text-sm font-medium text-mono">
                {selectedTemplate.status}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Template Name
              </span>
              <span className="text-sm font-medium text-mono">
                No template selected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Department
              </span>
              <span className="text-sm font-medium text-mono">
                -
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Fields Count
              </span>
              <span className="text-sm font-medium text-mono">
                -
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                Status
              </span>
              <span className="text-sm font-medium text-mono">
                -
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderDocumentDetails = () => (
    <>
      <div className="border-b border-border mb-4 mt-5"></div>
      <span className="text-sm font-medium block text-mono mb-3.5 px-5">
        Document Details
      </span>

      {uploadedItems.map((item, index) => {
        return renderItem(item, index);
      })}

      {documentDetails?.fileName && (
        <div className="pt-2 border-t border-border px-5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-normal text-secondary-foreground">
              File Name
            </span>
            <span className="text-sm font-medium text-mono truncate max-w-32">
              {documentDetails.fileName}
            </span>
          </div>
          {documentDetails.fileSize && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-secondary-foreground">
                File Size
              </span>
              <span className="text-sm font-medium text-mono">
                {documentDetails.fileSize}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );

  const getFooterStatus = () => {
    switch (step) {
      case 'upload':
        return { label: 'Extraction Status', value: documentDetails ? 'Document Uploaded' : 'No File' };
      case 'select-template':
        return { label: 'Extraction Status', value: selectedTemplate ? 'Template Selected' : 'No Template' };
      case 'process-extraction':
        return { label: 'Extraction Status', value: status === 'completed' ? 'Processed Extraction' : 'Processing' };
      case 'extraction-results':
        return { label: 'Extraction Status', value: 'Results' };
      default:
        return { label: 'Status', value: 'Ready' };
    }
  };

  const footerStatus = getFooterStatus();

  return (
    <Card className="bg-accent/50">
      <CardHeader className="px-5">
        <CardTitle>Extraction Summary</CardTitle>
      </CardHeader>

      <CardContent className="px-0 py-5 space-y-2">
        {/* Extraction Details - Show only in extraction-results step (newest) */}
        {step === 'extraction-results' && renderExtractionDetails()}

        {/* Processing Statistics - Show in process-extraction and extraction-results steps */}
        {(step === 'process-extraction' || step === 'extraction-results') && renderProcessingStatistics()}

        {/* Template Details - Show from select-template step onwards */}
        {(step === 'select-template' || step === 'process-extraction' || step === 'extraction-results') && 
          renderTemplateDetails()
        }

        {/* Document Details - Show in all steps (oldest) */}
        {renderDocumentDetails()}
      </CardContent>

      <CardFooter className="flex justify-between items-center px-5">
        <span className="text-sm font-normal text-secondary-foreground">
          {footerStatus.label}
        </span>
        <span className="text-base font-semibold text-mono">
          {footerStatus.value}
        </span>
      </CardFooter>
    </Card>
  );
}
