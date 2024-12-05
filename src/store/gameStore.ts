import { create } from 'zustand';
import { GameState, GameImage, MaskPosition, GameMode } from '../types/game';
import { loadImagesFromStorage, saveImagesToStorage } from '../services/gameData';
import initialData from '../data/initialGameData.json';

const getInitialImages = (): GameImage[] => {
  const storedImages = loadImagesFromStorage();
  return storedImages.length > 0 ? storedImages : initialData.images;
};

const initialImages = getInitialImages();

export const useGameStore = create<GameState>((set) => ({
  images: initialImages,
  currentImageIndex: 0,
  isAdmin: false,
  isMenuOpen: false,
  showAnswer: false,
  selectedImageId: null,
  gameMode: 'mask',
  
  currentImage: initialImages[0] || initialData.images[0],
  
  setCurrentImageIndex: (index: number) => 
    set((state) => ({
      currentImageIndex: index,
      currentImage: state.images[index],
      showAnswer: false
    })),
    
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  toggleAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
  toggleAnswer: () => set((state) => ({ showAnswer: !state.showAnswer })),
  setGameMode: (mode: GameMode) => set(() => ({ gameMode: mode })),
  
  updateMaskPosition: (position: MaskPosition) => set((state) => {
    const newImages = state.images.map((img, idx) =>
      idx === state.currentImageIndex
        ? { ...img, maskPosition: position }
        : img
    );
    saveImagesToStorage(newImages);
    return {
      images: newImages,
      currentImage: {
        ...state.currentImage,
        maskPosition: position
      }
    };
  }),
  
  addImage: (image: GameImage) => set((state) => {
    const newImages = [...state.images, { ...image, showMask: true }];
    saveImagesToStorage(newImages);
    return { images: newImages };
  }),

  updateImage: (id: string, updates: Partial<GameImage>) => set((state) => {
    const newImages = state.images.map(img =>
      img.id === id ? { ...img, ...updates } : img
    );
    saveImagesToStorage(newImages);
    return {
      images: newImages,
      currentImage: state.currentImage.id === id 
        ? { ...state.currentImage, ...updates }
        : state.currentImage,
      selectedImageId: null
    };
  }),

  deleteImage: (id: string) => set((state) => {
    const newImages = state.images.filter(img => img.id !== id);
    saveImagesToStorage(newImages);
    return {
      images: newImages,
      currentImageIndex: 0,
      currentImage: newImages[0] || initialData.images[0],
      selectedImageId: null
    };
  }),

  importImages: (newImages: GameImage[]) => set(() => {
    const imagesWithMask = newImages.map(img => ({ ...img, showMask: true }));
    saveImagesToStorage(imagesWithMask);
    return {
      images: imagesWithMask,
      currentImageIndex: 0,
      currentImage: imagesWithMask[0]
    };
  }),

  setSelectedImageId: (id: string | null) => set(() => ({
    selectedImageId: id
  })),

  toggleMask: (id: string) => set((state) => {
    const newImages = state.images.map(img =>
      img.id === id ? { ...img, showMask: !img.showMask } : img
    );
    saveImagesToStorage(newImages);
    return {
      images: newImages,
      currentImage: state.currentImage.id === id
        ? { ...state.currentImage, showMask: !state.currentImage.showMask }
        : state.currentImage
    };
  })
}));