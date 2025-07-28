import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface ExtractionMapping {
  id: string;
  standardField: string;
  targetField: string;
  documentField: string;
  confidence: number;
}

interface ExtractionResult {
  id: string;
  target_mappings: Array<{
    target_field: string;
    target_value: string;
    target_confidence: number | null;
  }>;
  overall_confidence: number;
  created_at: string;
  updated_at: string;
}

interface ExtractionMappingTableProps {
  extractionResults?: ExtractionResult | null;
}

const mockData: ExtractionMapping[] = [
  {
    id: '1',
    standardField: 'Invoice Number',
    targetField: 'Invoice #, Inv Number, Invoice ID (e.g., INV-2025-001, 2025-001, INV001)',
    documentField: 'INV-2025-001',
    confidence: 98.5
  },
  {
    id: '2',
    standardField: 'Invoice Date',
    targetField: 'Date, Invoice Date, Issue Date (e.g., 2025-01-15, 01/15/2025, Jan 15, 2025)',
    documentField: '2025-01-15',
    confidence: 95.2
  },
  {
    id: '3',
    standardField: 'Due Date',
    targetField: 'Due Date, Payment Due, Due (e.g., 2025-02-15, 02/15/2025, Feb 15, 2025)',
    documentField: '2025-02-15',
    confidence: 92.8
  },
  {
    id: '4',
    standardField: 'Vendor Name',
    targetField: 'Vendor, Supplier, Company Name (e.g., Tech Solutions Inc., ABC Corp, XYZ Ltd)',
    documentField: 'Tech Solutions Inc.',
    confidence: 87.3
  },
  {
    id: '5',
    standardField: 'Vendor Address',
    targetField: 'Address, Vendor Address, Billing Address (e.g., 123 Business St, Suite 100, New York, NY 10001)',
    documentField: '123 Business St, Suite 100, New York, NY 10001',
    confidence: 78.9
  },
  {
    id: '6',
    standardField: 'Line Item Description',
    targetField: 'Description, Item Description, Product (e.g., Software Development Services, Consulting Hours, Product Name)',
    documentField: 'Software Development Services',
    confidence: 82.1
  },
  {
    id: '7',
    standardField: 'Quantity',
    targetField: 'Qty, Amount, Count (e.g., 1, 5, 10, 100)',
    documentField: '1',
    confidence: 99.1
  },
  {
    id: '8',
    standardField: 'Unit Price',
    targetField: 'Price, Unit Cost, Rate (e.g., $450.00, 450.00, $450, 450)',
    documentField: '$450.00',
    confidence: 94.7
  },
  {
    id: '9',
    standardField: 'Total Amount',
    targetField: 'Total, Grand Total, Amount (e.g., $450.00, 450.00, $450, 450)',
    documentField: '$450.00',
    confidence: 96.3
  },
  {
    id: '10',
    standardField: 'Tax Amount',
    targetField: 'Tax, Tax Amount, VAT (e.g., $36.00, 36.00, $36, 36)',
    documentField: '$36.00',
    confidence: 89.5
  },
  {
    id: '11',
    standardField: 'Currency',
    targetField: 'Currency, Currency Code, Curr (e.g., USD, EUR, GBP, $, €)',
    documentField: 'USD',
    confidence: 99.8
  },
  {
    id: '12',
    standardField: 'Payment Terms',
    targetField: 'Terms, Payment Terms, Net Terms (e.g., Net 30, 30 days, Due in 30 days)',
    documentField: 'Net 30',
    confidence: 75.2
  }
];

export function ExtractionMappingTable({ extractionResults }: ExtractionMappingTableProps) {
  const [data, setData] = useState<ExtractionMapping[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Transform API results to table data
  const transformResultsToTableData = (results: ExtractionResult): ExtractionMapping[] => {
    return results.target_mappings.map((mapping, index) => ({
      id: `${index + 1}`,
      standardField: mapping.target_field,
      targetField: mapping.target_field,
      documentField: mapping.target_value || 'Not found',
      confidence: mapping.target_confidence || 0,
    }));
  };

  // Update data when extraction results change
  useEffect(() => {
    if (extractionResults) {
      const transformedData = transformResultsToTableData(extractionResults);
      setData(transformedData);
    } else {
      setData(mockData); // Fallback to mock data if no results
    }
  }, [extractionResults]);

  const handleEdit = (item: ExtractionMapping) => {
    setEditingId(item.id);
    setEditValue(item.documentField);
  };

  const handleSave = (id: string) => {
    setData(prevData => 
      prevData.map(item => 
        item.id === id 
          ? { ...item, documentField: editValue }
          : item
      )
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card>
      <CardContent className="p-5 lg:p-7.5">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Standard Field</TableHead>
                <TableHead className="w-[200px]">Target Field</TableHead>
                <TableHead>Document Field</TableHead>
                <TableHead className="w-[120px] text-center">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.standardField}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.targetField}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          onBlur={() => handleSave(item.id)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => handleEdit(item)}
                        title="Click to edit"
                      >
                        {item.documentField}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={item.confidence >= 90 ? 'success' : item.confidence >= 80 ? 'warning' : 'destructive'}
                      appearance="outline"
                    >
                      {item.confidence}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
} 