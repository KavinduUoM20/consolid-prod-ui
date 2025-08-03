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

export function Extraction() {
  const items: IExtractionItems = [
    { label: 'Document Type', status: 'PDF' },
    { label: 'Pages', status: '3' },
    { label: 'Processing', status: 'Ready' },
  ];

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

        {items.map((item, index) => {
          return renderItem(item, index);
        })}
      </CardContent>

      <CardFooter className="flex justify-between items-center px-5">
        <span className="text-sm font-normal text-secondary-foreground">
          Extraction Status
        </span>
        <span className="text-base font-semibold text-mono">File Uploaded</span>
      </CardFooter>
    </Card>
  );
}
