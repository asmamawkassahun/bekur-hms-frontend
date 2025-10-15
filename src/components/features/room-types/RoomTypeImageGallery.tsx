'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { RoomTypeImage } from '@/types';

interface RoomTypeImageGalleryProps {
  images: RoomTypeImage[];
  roomTypeName?: string;
  showOrder?: boolean;
  maxPreview?: number;
  className?: string;
}

export function RoomTypeImageGallery({
  images,
  roomTypeName = 'Room',
  showOrder = true,
  maxPreview = 5,
  className = '',
}: RoomTypeImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<RoomTypeImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const sortedImages = images.sort((a, b) => a.displayOrder - b.displayOrder);
  const previewImages = sortedImages.slice(0, maxPreview);
  const hasMoreImages = images.length > maxPreview;

  const openLightbox = (image: RoomTypeImage) => {
    setSelectedImage(image);
    setCurrentIndex(sortedImages.findIndex(img => img.id === image.id));
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => 
        prev === 0 ? sortedImages.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex(prev => 
        prev === sortedImages.length - 1 ? 0 : prev + 1
      );
    }
    setSelectedImage(sortedImages[currentIndex]);
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {/* Main Image */}
        <div className="relative group">
          <div
            className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(sortedImages[0])}
          >
            <img
              src={sortedImages[0].fileUrl.startsWith('http') ? sortedImages[0].fileUrl : `http://${sortedImages[0].fileUrl}`}
              alt={sortedImages[0].description || `${roomTypeName} image`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          {showOrder && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/50 text-white"
            >
              {sortedImages[0].displayOrder}
            </Badge>
          )}
        </div>

        {/* Thumbnail Grid */}
        {previewImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {previewImages.slice(1).map((image, index) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => openLightbox(image)}
              >
                <div className="aspect-square bg-gray-100 rounded overflow-hidden hover:opacity-90 transition-opacity">
                  <img
                    src={image.fileUrl.startsWith('http') ? image.fileUrl : `http://${image.fileUrl}`}
                    alt={image.description || `${roomTypeName} image`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {showOrder && (
                  <Badge
                    variant="secondary"
                    className="absolute top-1 right-1 text-xs bg-black/50 text-white"
                  >
                    {image.displayOrder}
                  </Badge>
                )}
                {index === previewImages.length - 2 && hasMoreImages && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{images.length - maxPreview + 1}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Count */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {images.length} image{images.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>
                {roomTypeName} Images ({currentIndex + 1} of {sortedImages.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 relative px-6 pb-6">
            {/* Main Image Display */}
            <div className="relative h-full">
              <img
                src={sortedImages[currentIndex]?.fileUrl.startsWith('http') ? sortedImages[currentIndex]?.fileUrl : `http://${sortedImages[currentIndex]?.fileUrl}`}
                alt={sortedImages[currentIndex]?.description || `${roomTypeName} image`}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation Buttons */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Image Description */}
            {sortedImages[currentIndex]?.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {sortedImages[currentIndex].description}
                </p>
              </div>
            )}

            {/* Thumbnail Strip */}
            {sortedImages.length > 1 && (
              <div className="mt-4">
                <Carousel className="w-full">
                  <CarouselContent>
                    {sortedImages.map((image, index) => (
                      <CarouselItem key={image.id} className="basis-1/6">
                        <div
                          className={`aspect-square rounded overflow-hidden cursor-pointer border-2 transition-colors ${
                            index === currentIndex
                              ? 'border-blue-500'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setCurrentIndex(index);
                            setSelectedImage(image);
                          }}
                        >
                          <img
                            src={image.fileUrl.startsWith('http') ? image.fileUrl : `http://${image.fileUrl}`}
                            alt={image.description || `${roomTypeName} image`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
