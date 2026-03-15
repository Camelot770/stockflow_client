import React, { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const valid = Array.from(fileList).filter((f) => f.size <= maxSize);
      setFiles(valid);
      onFileSelect(valid);
    },
    [maxSize, onFileSelect],
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFileSelect(updated);
  };

  return (
    <div className={className}>
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Перетащите файл или <span className="text-primary">выберите</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Максимум {Math.round(maxSize / 1024 / 1024)} МБ
        </p>
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} КБ
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
