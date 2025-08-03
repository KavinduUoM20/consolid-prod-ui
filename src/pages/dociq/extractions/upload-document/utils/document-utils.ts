import { DocumentDetails } from '../../types/extraction-types';

export const getDocumentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'PDF';
    case 'xlsx':
    case 'xls':
      return 'Excel';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'jpg':
    case 'jpeg':
      return 'Image (JPG)';
    case 'png':
      return 'Image (PNG)';
    case 'txt':
      return 'Text';
    default:
      return extension?.toUpperCase() || 'Unknown';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to estimate pages based on file type and size
// This is a rough estimation - in a real app, you'd use a PDF parser or similar
export const estimatePages = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      // For PDFs, use a more accurate estimation based on size
      // 1MB ≈ 1-2 pages for typical PDFs, but can vary greatly
      const pdfPages = Math.max(1, Math.round(file.size / (800 * 1024))); // 800KB per page average
      return pdfPages.toString();
    case 'xlsx':
    case 'xls':
      // Excel files typically have multiple sheets
      return 'Multiple Sheets';
    case 'doc':
    case 'docx':
      // Word documents: rough estimation
      const wordPages = Math.max(1, Math.round(file.size / (50 * 1024))); // 50KB per page
      return wordPages.toString();
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '1'; // Images are typically single page
    case 'txt':
      // Text files: rough estimation based on size
      const textPages = Math.max(1, Math.round(file.size / (2000))); // ~2000 chars per page
      return textPages.toString();
    default:
      return 'Unknown';
  }
};

export const extractDocumentDetails = (files: File[], extraction_id?: string): DocumentDetails | null => {
  if (files.length === 0) return null;
  
  // For now, we'll use the first file
  // In a real app, you might want to handle multiple files differently
  const file = files[0];
  
  return {
    type: getDocumentType(file.name),
    pages: estimatePages(file),
    processing: 'Ready',
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    extraction_id,
  };
}; 