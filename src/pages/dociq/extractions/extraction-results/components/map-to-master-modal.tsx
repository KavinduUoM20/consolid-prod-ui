"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

interface MapToMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  extractionData?: {
    fields: Array<{
      standardField: string;
      documentField: string;
      confidence: number;
    }>;
    extractionId: string;
    extractionDate: string;
    template: string;
    documentType: string;
  };
}

export function MapToMasterModal({
  open,
  onOpenChange,
  trigger,
  extractionData,
}: MapToMasterModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = () => {
    setIsExporting(true);
    
    // Create JSON data for Centric PLM Master mapping
    const masterMappingData = {
      masterMapping: 'Centric PLM Master',
      extractionId: extractionData?.extractionId || 'Unknown',
      extractionDate: extractionData?.extractionDate || new Date().toLocaleDateString(),
      template: extractionData?.template || 'Unknown Template',
      documentType: extractionData?.documentType || 'Unknown',
      timestamp: new Date().toISOString(),
      mappings: extractionData?.fields?.map(field => ({
        field: field.standardField,
        value: field.documentField,
        confidence: field.confidence
      })) || []
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(masterMappingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centric-plm-master-mapping-${extractionData?.extractionId || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Map to Centric PLM Master
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody className="flex-1 overflow-auto">
          <div className="space-y-4">
            {/* Extraction Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Extraction ID</p>
                <p className="text-sm">{extractionData?.extractionId || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Template</p>
                <p className="text-sm">{extractionData?.template || 'Unknown Template'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm">{extractionData?.extractionDate || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Document Type</p>
                <p className="text-sm">{extractionData?.documentType || 'Unknown'}</p>
              </div>
            </div>

            {/* Field-Value Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractionData?.fields?.map((field, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {field.standardField}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {field.documentField}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500">
                        No extraction data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          
          <Button 
            onClick={handleExportJSON}
            disabled={isExporting || !extractionData?.fields?.length}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export JSON
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

