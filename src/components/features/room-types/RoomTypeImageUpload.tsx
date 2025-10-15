'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  Upload,
  X,
  Edit,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { roomTypeService } from '@/services/room-type.service';
import { RoomTypeImage, UploadRoomTypeImageData, UpdateRoomTypeImageData } from '@/types';

interface RoomTypeImageUploadProps {
  roomTypeId: string;
  images: RoomTypeImage[];
  onImagesChange: (images: RoomTypeImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function RoomTypeImageUpload({
  roomTypeId,
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: RoomTypeImageUploadProps) {
  const { success, error } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<RoomTypeImage | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    displayOrder: 1,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        error('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        error('File size must be less than 5MB');
        return;
      }

      // Check if we can add more images
      if (images.length >= maxImages) {
        error(`Maximum of ${maxImages} images allowed`);
        return;
      }

      // If roomTypeId is 'new', we can't upload yet - just add to local state
      if (roomTypeId === 'new') {
        const newImage: RoomTypeImage = {
          id: `temp-${Date.now()}-${Math.random()}`,
          roomTypeId: 'new',
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          description: '',
          displayOrder: images.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onImagesChange([...images, newImage]);
        success('Image added (will be uploaded when room type is saved)');
        return;
      }

      setUploading(true);
      try {
        const uploadData: UploadRoomTypeImageData = {
          description: '',
          displayOrder: images.length + 1,
        };

        const response = await roomTypeService.uploadImage(roomTypeId, file, uploadData);
        onImagesChange([...images, response.data.data!]);
        success('Image uploaded successfully');
      } catch (err) {
        error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    },
    [roomTypeId, images, maxImages, onImagesChange, success, error]
  );

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    // If roomTypeId is 'new', just update local state
    if (roomTypeId === 'new') {
      const updatedImages = images.map(img =>
        img.id === editingImage.id 
          ? { ...img, description: editForm.description, displayOrder: editForm.displayOrder }
          : img
      );
      onImagesChange(updatedImages);
      setEditingImage(null);
      success('Image updated successfully');
      return;
    }

    setUploading(true);
    try {
      const updateData: UpdateRoomTypeImageData = {
        description: editForm.description,
        displayOrder: editForm.displayOrder,
      };

      const response = await roomTypeService.updateImage(
        editingImage.id,
        null, // No new file
        updateData
      );

      const updatedImages = images.map(img =>
        img.id === editingImage.id ? response.data.data! : img
      );
      onImagesChange(updatedImages);
      setEditingImage(null);
      success('Image updated successfully');
    } catch (err) {
      error('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    // If roomTypeId is 'new', just update local state
    if (roomTypeId === 'new') {
      const updatedImages = images.filter(img => img.id !== imageId);
      onImagesChange(updatedImages);
      success('Image deleted successfully');
      return;
    }

    setUploading(true);
    try {
      await roomTypeService.deleteImage(imageId);
      const updatedImages = images.filter(img => img.id !== imageId);
      onImagesChange(updatedImages);
      success('Image deleted successfully');
    } catch (err) {
      error('Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const reorderedImages = items.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));

    // If roomTypeId is 'new', just update local state
    if (roomTypeId === 'new') {
      onImagesChange(reorderedImages);
      success('Images reordered successfully');
      return;
    }

    try {
      const imageIds = reorderedImages.map(img => img.id);
      await roomTypeService.reorderImages(roomTypeId, imageIds);
      onImagesChange(reorderedImages);
      success('Images reordered successfully');
    } catch (err) {
      error('Failed to reorder images');
    }
  };

  const openEditDialog = (image: RoomTypeImage) => {
    setEditingImage(image);
    setEditForm({
      description: image.description || '',
      displayOrder: image.displayOrder,
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled || uploading || images.length >= maxImages}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading || images.length >= maxImages}
              className="mb-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <p className="text-sm text-gray-500">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : `${images.length}/${maxImages} images uploaded`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, WebP up to 5MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Room Images</h4>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {images
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id}
                        index={index}
                        isDragDisabled={disabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'z-50' : ''
                            }`}
                          >
                            <Card className="overflow-hidden">
                              <div className="aspect-square relative">
                                <img
                                  src={image.fileUrl.startsWith('http') ? image.fileUrl : `http://${image.fileUrl}`}
                                  alt={image.description || 'Room image'}
                                  className="w-full h-full object-cover"
                                />
                                
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 left-2 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <GripVertical className="h-3 w-3" />
                                </div>

                                {/* Order Badge */}
                                <Badge
                                  variant="secondary"
                                  className="absolute top-2 right-2 bg-black/50 text-white"
                                >
                                  {image.displayOrder}
                                </Badge>

                                {/* Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => openEditDialog(image)}
                                    disabled={disabled}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={disabled}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this image? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteImage(image.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              
                              {/* Image Info */}
                              <div className="p-2">
                                <p className="text-xs text-gray-600 truncate">
                                  {image.description || 'No description'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Order: {image.displayOrder}
                                </p>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingImage && (
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={editingImage.fileUrl.startsWith('http') ? editingImage.fileUrl : `http://${editingImage.fileUrl}`}
                  alt={editingImage.description || 'Room image'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter image description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                max={maxImages}
                value={editForm.displayOrder}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    displayOrder: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingImage(null)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateImage}
                disabled={uploading}
              >
                {uploading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
