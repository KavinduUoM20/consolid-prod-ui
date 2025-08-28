import { MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { FileUploader } from '../../components/common/file-uploader';
import { Extraction } from '../select-template/components/order';
import { extractDocumentDetails } from './utils/document-utils';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useDocumentUpload } from '../hooks/use-document-upload';
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadDocumentContentProps {
  selectedCluster: string;
  selectedCustomer: string;
  selectedMaterialType: string;
}

export function UploadDocumentContent({ selectedCluster, selectedCustomer, selectedMaterialType }: UploadDocumentContentProps) {
  const { documentDetails, setDocumentDetails } = useDocumentStorage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadDocument, isUploading } = useDocumentUpload();
  const navigate = useNavigate();

  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files);
    const details = extractDocumentDetails(files);
    setDocumentDetails(details);
  };

  const handleSelectTemplate = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select a document to upload');
      return;
    }

    // Check if cluster, customer, and material type are selected
    if (!selectedCluster) {
      toast.error('Please select a cluster');
      return;
    }

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (!selectedMaterialType) {
      toast.error('Please select a material type');
      return;
    }

    // Create headers with selected cluster, customer, and material type
    const headers = {
      'X-Cluster': selectedCluster,
      'X-Customer': selectedCustomer,
      'X-Material-Type': selectedMaterialType,
    };

    console.log('Uploading with headers:', headers);

    const result = await uploadDocument(selectedFiles[0], { headers });

    if (result.success) {
      // Extract extraction_id from the response
      const extractionId = result.data?.extraction_id;
      
      // Update document details with extraction_id
      if (extractionId) {
        const updatedDetails = extractDocumentDetails(selectedFiles, extractionId);
        setDocumentDetails(updatedDetails);
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="col-span-2 space-y-5">
        <div className="grid sm:grid-cols-1 gap-5">
          <FileUploader 
            multiple={true}
            acceptedTypes={['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            onSelectedFilesChange={setSelectedFiles}
          />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">
            <Link to="/dociq/home">Cancel</Link>
          </Button>

          <Button 
            onClick={handleSelectTemplate}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Select Template'}
            <MoveRight className="text-base" />
          </Button>
        </div>
      </div>

      <div className="col-span-1">
        <div className="space-y-5">
          <Extraction step="upload" />
        </div>
      </div>
    </div>
  );
}
