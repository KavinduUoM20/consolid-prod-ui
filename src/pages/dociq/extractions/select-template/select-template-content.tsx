import { MoveLeft, MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Info } from './components/info';
import { Extraction } from './components/order';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useTemplateContext } from '../context/template-context';
import { useTemplateProcessing } from '../hooks/use-template-processing';
import { toast } from 'sonner';

export function SelectTemplateContent() {
  const { documentDetails, isLoading: documentLoading } = useDocumentStorage();
  const { selectedTemplate } = useTemplateContext();
  const { processTemplate, isProcessing } = useTemplateProcessing();
  const navigate = useNavigate();

  // Show loading state
  if (documentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading...
          </h3>
        </div>
      </div>
    );
  }

  // Redirect to upload page if no document is uploaded
  if (!documentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Document Uploaded
          </h3>
          <p className="text-muted-foreground mb-4">
            Please upload a document first to proceed with template selection.
          </p>
          <Button asChild>
            <Link to="/dociq/extractions/upload-document">
              <MoveLeft className="text-base mr-2" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleProcessDocument = async () => {
    console.log('Process Document clicked');
    console.log('Selected template:', selectedTemplate);
    console.log('Document details:', documentDetails);
    
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    if (!selectedTemplate.id) {
      console.error('Template ID is missing. Selected template:', selectedTemplate);
      toast.error('Template ID is missing. Please select a valid template.');
      return;
    }

    if (!documentDetails.extraction_id) {
      toast.error('Extraction ID is missing. Please upload a document first.');
      return;
    }

    const result = await processTemplate(documentDetails.extraction_id, selectedTemplate.id);

    if (result.success) {
      // Show success message with the response message
      const message = result.data?.message || 'Template processed successfully!';
      toast.success(message);
      
      // Navigate to process extraction page
      navigate('/dociq/extractions/process-extraction');
    } else {
      // Show error message
      toast.error(result.error || 'Failed to process template');
    }
  };

  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Info />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">
            <MoveLeft className="text-base" />
            <Link to="/dociq/extractions/upload-document">Upload Document</Link>
          </Button>

          <Button 
            onClick={handleProcessDocument}
            disabled={isProcessing || !selectedTemplate}
          >
            {isProcessing ? 'Processing...' : 'Process Document'}
            <MoveRight className="text-base" />
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Extraction step="select-template" />
        </div>
      </div>
    </div>
  );
} 