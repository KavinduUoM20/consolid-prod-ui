'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileSelect?: (files: File[]) => void;
  multiple?: boolean;
  acceptedTypes?: string[];
  selectedFiles?: File[];
  onSelectedFilesChange?: (files: File[]) => void;
}

export function FileUploader({ 
  onFileSelect, 
  multiple = false, 
  acceptedTypes = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  selectedFiles: externalSelectedFiles,
  onSelectedFilesChange
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<File[]>([]);
  
  // Use external state if provided, otherwise use internal state
  const selectedFiles = externalSelectedFiles !== undefined ? externalSelectedFiles : internalSelectedFiles;
  const setSelectedFiles = onSelectedFilesChange || setInternalSelectedFiles;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...files] : files;
      setSelectedFiles(newFiles);
      onFileSelect?.(newFiles);
    }
  }, [multiple, onFileSelect, selectedFiles, setSelectedFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...files] : files;
      setSelectedFiles(newFiles);
      onFileSelect?.(newFiles);
    }
  }, [multiple, onFileSelect, selectedFiles, setSelectedFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect?.(newFiles);
  }, [onFileSelect, selectedFiles, setSelectedFiles]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card className={`transition-all duration-200 ${isDragOver ? 'ring-2 ring-primary ring-opacity-50 bg-accent/30' : ''}`}>
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-accent/50 rounded-full">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Drag & drop files here
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse your files
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {acceptedTypes.map((type) => (
                  <Badge key={type} variant="secondary" appearance="outline" className="text-xs">
                    {type.toUpperCase()}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                className="mt-4"
              >
                <File className="w-4 h-4 mr-2" />
                Choose Files
              </Button>

              <input
                id="file-input"
                type="file"
                multiple={multiple}
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getFileIcon(file.name)}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 