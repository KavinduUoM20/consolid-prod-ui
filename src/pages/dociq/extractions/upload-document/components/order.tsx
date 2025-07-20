import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface IExtractionItem {
  label: string;
  status: string;
}
export type IExtractionItems = Array<IExtractionItem>;

export interface DocumentDetails {
  type: string;
  pages: string;
  processing: string;
  fileName?: string;
  fileSize?: string;
}

interface ExtractionProps {
  documentDetails?: DocumentDetails | null;
}

export function Extraction({ documentDetails }: ExtractionProps) {
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
    <div key={index} className="flex justify-between items-center">
      <span className="text-sm font-normal text-secondary-foreground">
        {item.label}
      </span>
      <span className="text-sm font-medium text-mono">{item.status}</span>
    </div>
  );

  return (
    <Card className="bg-accent/50">
      <CardHeader className="px-5">
        <CardTitle>Extraction Summary</CardTitle>
      </CardHeader>

      <CardContent className="px-5 py-4 space-y-2">
        <h4 className="text-sm font-medium text-mono mb-3.5">Document Details</h4>

        {uploadedItems.map((item, index) => {
          return renderItem(item, index);
        })}

        {documentDetails?.fileName && (
          <div className="pt-2 border-t border-border">
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
      </CardContent>

      <CardFooter className="flex justify-between items-center px-5">
        <span className="text-sm font-normal text-secondary-foreground">
          Extraction Status
        </span>
        <span className="text-base font-semibold text-mono">
          {documentDetails ? 'File Uploaded' : 'No File'}
        </span>
      </CardFooter>
    </Card>
  );
}
