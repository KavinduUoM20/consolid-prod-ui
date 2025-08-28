import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useExtractionResultsContext } from '../../context/extraction-results-context';

interface ExtractionMapping {
  id: string;
  standardField: string;
  documentField: string;
  confidence: number;
}

// ExtractionResult interface moved to context file

interface ExtractionMappingTableProps {
  // No longer need extractionResults prop as we'll get it from context
}

const mockData: ExtractionMapping[] = [
  {
    id: '1',
    standardField: 'Invoice Number',
    documentField: 'INV-2025-001',
    confidence: 98.5
  },
  {
    id: '2',
    standardField: 'Invoice Date',
    documentField: '2025-01-15',
    confidence: 95.2
  },
  {
    id: '3',
    standardField: 'Due Date',
    documentField: '2025-02-15',
    confidence: 92.8
  },
  {
    id: '4',
    standardField: 'Vendor Name',
    documentField: 'Tech Solutions Inc.',
    confidence: 87.3
  },
  {
    id: '5',
    standardField: 'Vendor Address',
    documentField: '123 Business St, Suite 100, New York, NY 10001',
    confidence: 78.9
  },
  {
    id: '6',
    standardField: 'Line Item Description',
    documentField: 'Software Development Services',
    confidence: 82.1
  },
  {
    id: '7',
    standardField: 'Quantity',
    documentField: '1',
    confidence: 99.1
  },
  {
    id: '8',
    standardField: 'Unit Price',
    documentField: '$450.00',
    confidence: 94.7
  },
  {
    id: '9',
    standardField: 'Total Amount',
    documentField: '$450.00',
    confidence: 96.3
  },
  {
    id: '10',
    standardField: 'Tax Amount',
    documentField: '$36.00',
    confidence: 89.5
  },
  {
    id: '11',
    standardField: 'Currency',
    documentField: 'USD',
    confidence: 99.8
  },
  {
    id: '12',
    standardField: 'Payment Terms',
    documentField: 'Net 30',
    confidence: 75.2
  }
];

export function ExtractionMappingTable({}: ExtractionMappingTableProps) {
  const { editedMappings, extractionResults, updateMappingField } = useExtractionResultsContext();
  const [data, setData] = useState<ExtractionMapping[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Transform edited mappings to table data
  const transformMappingsToTableData = (mappings: typeof editedMappings): ExtractionMapping[] => {
    return mappings.map((mapping, index) => ({
      id: `${index + 1}`,
      standardField: mapping.target_field,
      documentField: mapping.target_value || 'Not found',
      confidence: mapping.target_confidence || 0,
    }));
  };

  // Update data when edited mappings change
  useEffect(() => {
    if (editedMappings.length > 0) {
      const transformedData = transformMappingsToTableData(editedMappings);
      setData(transformedData);
    } else if (extractionResults) {
      // Fallback to original extraction results if no edited mappings yet
      const transformedData = extractionResults.target_mappings.map((mapping, index) => ({
        id: `${index + 1}`,
        standardField: mapping.target_field,
        documentField: mapping.target_value || 'Not found',
        confidence: mapping.target_confidence || 0,
      }));
      setData(transformedData);
    } else {
      setData(mockData); // Fallback to mock data if no results
    }
  }, [editedMappings, extractionResults]);

  const handleEdit = (item: ExtractionMapping) => {
    setEditingId(item.id);
    setEditValue(item.documentField);
  };

  const handleSave = (id: string) => {
    // Find the item being edited
    const item = data.find(item => item.id === id);
    if (item) {
      // Update the context with the new value
      updateMappingField(item.standardField, editValue);
    }
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