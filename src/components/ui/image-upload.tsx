'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { fileUploadService } from '@/services/file-upload.service';
import { useNotification } from '@/hooks/useNotification';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { success, error } = useNotification();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + value.length > maxImages) {
      error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const urls = await fileUploadService.uploadMultipleImages(files);
      onChange([...value, ...urls]);
      success(`${files.length} image(s) uploaded successfully`);
    } catch {
      error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative group">
            <Image
              src={url}
              alt={`Upload ${index + 1}`}
              width={200}
              height={128}
              className="w-full h-32 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <label className="border-2 border-dashed border-muted-foreground/25 rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Upload Image
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {value.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}
