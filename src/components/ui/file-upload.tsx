
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Upload, X, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: File | null;
  currentFileUrl?: string;
  currentFileName?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = "*/*",
  maxSize = 10,
  currentFile,
  currentFileUrl,
  currentFileName,
  placeholder = "Drop files anywhere to upload",
  className,
  disabled = false
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const hasFile = currentFile || currentFileUrl || currentFileName;

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      {hasFile ? (
        <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            {getFileIcon(currentFileName || currentFile?.name || '')}
            <span className="text-sm font-medium text-gray-700">
              {currentFileName || currentFile?.name || 'File uploaded'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-gray-400",
            isDragOver && "border-blue-500 bg-blue-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">{placeholder}</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <Button 
            type="button" 
            variant="outline" 
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Select Files
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Maximum upload file size: {maxSize} MB
          </p>
        </div>
      )}
    </div>
  );
};
