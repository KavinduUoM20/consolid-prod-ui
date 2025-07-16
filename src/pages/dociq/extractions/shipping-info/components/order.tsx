'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IExtractionItem, IExtractionItems } from '../../upload-document/components/order';

export function Extraction() {
  const items: IExtractionItems = [
    { label: 'Document Type', status: 'PDF' },
    { label: 'Pages', status: '3' },
    { label: 'Processing', status: 'Ready' },
  ];

  const renderItem = (item: IExtractionItem, index: number) => (
    <div key={index} className="flex justify-between items-center px-5">
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

      <CardContent className="px-0 py-5 space-y-2">
        <div className="flex flex-col px-5">
          <span className="text-sm font-medium text-mono mb-1.5">
            Document Processing
          </span>

          <div className="flex flex-col gap-1 text-xs font-normal text-secondary-foreground">
            <span>Invoice Document</span>
            <span>3 Pages</span>
            <span>PDF Format</span>
            <span>Ready for Extraction</span>
          </div>
        </div>

        <div className="border-b border-border mb-4 mt-5"></div>
        <span className="text-sm font-medium block text-mono mb-3.5 px-5">
          Document Details
        </span>

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
