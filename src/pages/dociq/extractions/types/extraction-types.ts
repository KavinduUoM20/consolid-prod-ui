export interface IExtractionItem {
  label: string;
  status: string;
}

export type IExtractionItems = Array<IExtractionItem>;

export interface DocumentDetails {
  type: string;
  pages: string;
  processing: string;
  fileName?: string;
  fileSize?: string;
  extraction_id?: string;
} 