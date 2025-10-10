'use client';

import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentUploadProps {
  value: {
    front: File | null;
    back: File | null;
  };
  onChange: (value: { front: File | null; back: File | null }) => void;
  errors?: {
    front?: string;
    back?: string;
  };
  disabled?: boolean;
  existingDocuments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    description: string;
  }>;
}

export function DocumentUpload({
  value,
  onChange,
  errors,
  disabled = false,
  existingDocuments = [],
}: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState<'front' | 'back' | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const validateFile = (file: File): string | null => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit';
    }

    // Check file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed';
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      return 'Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .pdf files are allowed';
    }

    return null;
  };

  const handleFileSelect = (
    file: File,
    type: 'front' | 'back',
  ): void => {
    const validationError = validateFile(file);
    if (validationError) {
      // You could show a toast notification here
      console.error(validationError);
      return;
    }

    onChange({
      ...value,
      [type]: file,
    });
  };

  const handleDrop = (
    e: React.DragEvent,
    type: 'front' | 'back',
  ): void => {
    e.preventDefault();
    setDragOver(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back',
  ): void => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const removeFile = (type: 'front' | 'back'): void => {
    onChange({
      ...value,
      [type]: null,
    });
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(prev).add(url));
  };

  const createUploadZone = (
    type: 'front' | 'back',
    label: string,
    error?: string,
  ) => {
    const file = value[type];
    const isDragOverThis = dragOver === type;
    
    // Find existing document for this type
    const existingDoc = existingDocuments.find(doc => 
      doc.description?.toLowerCase().includes(type)
    );

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragOverThis
              ? 'border-primary bg-primary/5'
              : error
                ? 'border-destructive'
                : 'border-muted-foreground/25 hover:border-primary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(type);
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, type)}
        >
          {file ? (
            <div className="space-y-3">
              <div className="relative group">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`${label} preview`}
                    className="w-full h-32 object-cover rounded-md border mx-auto"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        PDF
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {file.name}
                      </div>
                    </div>
                  </div>
                )}
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(type)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
          ) : existingDoc ? (
            <div 
              className="space-y-3 cursor-pointer"
              onClick={() => document.getElementById(`upload-${type}`)?.click()}
            >
              <div className="relative group">
                {imageErrors.has(existingDoc.fileUrl) ? (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center border hover:bg-muted/80 transition-colors">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground mb-2">
                        📄
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Document Available
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {existingDoc.fileName}
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={existingDoc.fileUrl.startsWith('http') ? existingDoc.fileUrl : `http://${existingDoc.fileUrl}`}
                    alt={`${label} preview`}
                    className="w-full h-32 object-cover rounded-md border mx-auto hover:opacity-80 transition-opacity"
                    onError={() => handleImageError(existingDoc.fileUrl)}
                  />
                )}
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Current
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {existingDoc.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your {label.toLowerCase()}, or click to browse
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileInputChange(e, type)}
                className="hidden"
                disabled={disabled}
                id={`upload-${type}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById(`upload-${type}`)?.click()
                }
                disabled={disabled}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Identity Documents (Required)</h3>
        <p className="text-sm text-muted-foreground">
          Please upload both front and back of your ID card. Maximum file size:
          10MB. Supported formats: JPEG, PNG, GIF, PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {createUploadZone('front', 'ID Card Front', errors?.front)}
        {createUploadZone('back', 'ID Card Back', errors?.back)}
      </div>
    </div>
  );
}
