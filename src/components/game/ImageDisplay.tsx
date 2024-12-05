import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { scaleMaskPosition, getImageDimensions } from '../../utils/maskScaling';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ImageDisplay: React.FC = () => {
  const { currentImage, showAnswer, gameMode } = useGameStore();
  const [maskLoaded, setMaskLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setImageLoaded(false);
    if (gameMode === 'mask') {
      setMaskLoaded(false);
    }
  }, [currentImage.id, gameMode]);

  useEffect(() => {
    const loadOriginalDimensions = async () => {
      try {
        const dimensions = await getImageDimensions(currentImage.imageUrl);
        setOriginalDimensions(dimensions);
      } catch (error) {
        console.error('Error loading image dimensions:', error);
      }
    };
    loadOriginalDimensions();
  }, [currentImage.imageUrl]);

  useEffect(() => {
    const updateDisplayDimensions = () => {
      if (imageRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        
        setDisplayDimensions({
          width: imageRect.width,
          height: imageRect.height
        });
      }
    };

    if (imageLoaded) {
      updateDisplayDimensions();
      window.addEventListener('resize', updateDisplayDimensions);
      return () => window.removeEventListener('resize', updateDisplayDimensions);
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (imageLoaded && (gameMode === 'effects' || maskLoaded)) {
      setIsLoading(false);
    }
  }, [imageLoaded, maskLoaded, gameMode]);

  const scaledMaskPosition = originalDimensions && displayDimensions
    ? scaleMaskPosition(
        currentImage.maskPosition,
        originalDimensions,
        displayDimensions
      )
    : currentImage.maskPosition;

  const getImageStyle = () => {
    if (gameMode === 'effects' && !showAnswer) {
      return {
        filter: 'invert(1)',
        transform: 'scaleX(-1)',
        transition: 'all 0.3s ease-in-out'
      };
    }
    return {
      transition: 'all 0.3s ease-in-out'
    };
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMaskLoad = () => {
    setMaskLoaded(true);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center">
      <div 
        ref={containerRef}
        className="relative w-full"
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      >
        <div className="relative max-h-[80vh] flex items-center justify-center bg-gray-900">
          <img
            ref={imageRef}
            src={currentImage.imageUrl}
            alt="Person"
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
            style={getImageStyle()}
            onLoad={handleImageLoad}
          />
          
          {gameMode === 'mask' && !showAnswer && (
            <img
              src="/santa-mask.png"
              alt="Santa Mask"
              className="absolute pointer-events-none"
              style={{
                left: `${scaledMaskPosition.x}%`,
                top: `${scaledMaskPosition.y}%`,
                transform: `
                  translate(-50%, -50%)
                  scale(${scaledMaskPosition.scale})
                  rotate(${scaledMaskPosition.rotation}deg)
                `,
                width: '150px',
                height: 'auto',
              }}
              onLoad={handleMaskLoad}
            />
          )}
        </div>
      </div>
      
      {isLoading && <LoadingSpinner />}
    </div>
  );
};