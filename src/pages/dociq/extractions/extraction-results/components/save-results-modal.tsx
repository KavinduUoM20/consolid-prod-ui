"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, Send, Save, FileText } from 'lucide-react';
import { useState } from 'react';

const saveResultsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type SaveResultsFormValues = z.infer<typeof saveResultsSchema>;

interface SaveResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  extractionData?: any; // The extraction results data
}

export function SaveResultsModal({
  open,
  onOpenChange,
  trigger,
  extractionData,
}: SaveResultsModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingToPLM, setIsSendingToPLM] = useState(false);

  const form = useForm<SaveResultsFormValues>({
    resolver: zodResolver(saveResultsSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  const handleExportJSON = () => {
    setIsExporting(true);
    
    // Create JSON data
    const jsonData = {
      extractionName: form.getValues('name') || 'Extraction Results',
      timestamp: new Date().toISOString(),
      data: extractionData,
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.getValues('name') || 'extraction-results'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const handleSendToPLM = () => {
    setIsSendingToPLM(true);
    
    // Simulate sending to PLM
    setTimeout(() => {
      console.log('Sending to PLM:', {
        name: form.getValues('name'),
        data: extractionData,
      });
      setIsSendingToPLM(false);
      // You can add success notification here
    }, 2000);
  };

  const handleSaveResults = (data: SaveResultsFormValues) => {
    console.log('Saving results:', {
      name: data.name,
      data: extractionData,
    });
    
    // Here you would typically save to your backend
    // For now, we'll just close the modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Extraction Results</DialogTitle>
          <DialogDescription>
            Choose how you want to save or export your extraction results.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveResults)} className="space-y-6">
              {/* Name Input */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extraction Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter a name for this extraction"
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportJSON}
                  disabled={isExporting}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export as JSON'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSendToPLM}
                  disabled={isSendingToPLM}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingToPLM ? 'Sending...' : 'Send to PLM'}
                </Button>

                <Button
                  type="submit"
                  className="w-full justify-start"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </Button>
              </div>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 