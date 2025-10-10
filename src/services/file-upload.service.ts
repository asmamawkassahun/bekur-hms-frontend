import { apiClient } from '@/lib/api/axios-instance';

export const fileUploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data.url;
  },
  
  uploadMultipleImages: async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => fileUploadService.uploadImage(file));
    return Promise.all(uploadPromises);
  },
};
