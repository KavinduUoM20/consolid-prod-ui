import { MoveRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { FileUploader } from '../../components/common/file-uploader';
import { Extraction } from '../select-template/components/order';
import { extractDocumentDetails } from './utils/document-utils';
import { useDocumentStorage } from '../hooks/use-document-storage';
import { useEffect, useState } from 'react';

export function UploadDocumentContent() {
  const { documentDetails, setDocumentDetails } = useDocumentStorage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files);
    const details = extractDocumentDetails(files);
    setDocumentDetails(details);
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

          <Button>
            <Link to="/dociq/extractions/select-template">Select Template</Link>
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
