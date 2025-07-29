import { MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { FileUploader } from '../../components/common/file-uploader';
import { Extraction } from '../select-template/components/order';
import { extractDocumentDetails } from './utils/document-utils';
import { useExtractionSession } from '../context/extraction-session-context';
import { useDocumentUpload } from '../hooks/use-document-upload';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function UploadDocumentContent() {
  const { session, startNewSession, updateDocumentDetails, isLoading } = useExtractionSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadDocument, isUploading } = useDocumentUpload();
  const navigate = useNavigate();

  // Start a new session when component mounts
  useEffect(() => {
    if (!session) {
      startNewSession();
    }
  }, [session, startNewSession]);

  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
  };

  const handleSelectTemplate = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select a document to upload');
      return;
    }

    const result = await uploadDocument(selectedFiles[0]);

    if (result.success) {
      // Extract extraction_id from the response
      const extractionId = result.data?.extraction_id;
      
      // Update session with document details
      if (extractionId) {
        const documentDetails = extractDocumentDetails(selectedFiles, extractionId);
        if (documentDetails) {
          updateDocumentDetails(documentDetails);
        }
      }
      
      // Show success message
      toast.success('Document uploaded successfully!');
      
      // Navigate to select template page
      navigate('/dociq/extractions/select-template');
    } else {
      // Show error message
      toast.error(result.error || 'Failed to upload document');
    }
  };

  // Show loading state
  if (isLoading) {
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

  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button 
            onClick={handleSelectTemplate}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Select Template'}
            <MoveRight className="text-base" />
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Extraction step="upload" />
        </div>
      </div>
    </div>
  );
}
