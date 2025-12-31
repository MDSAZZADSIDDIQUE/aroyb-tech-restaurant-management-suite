'use client';

import { useEffect, useState } from 'react';
import { getImages, addImage, saveImages } from '@/lib/storage';
import { generateId } from '@/lib/formatting';
import type { ImageAsset } from '@/types';

export default function ImagesPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setImages(getImages());
    setLoading(false);
  }, []);
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const newImage: ImageAsset = {
        id: generateId('img-'),
        name: file.name,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      addImage(newImage);
      setImages([...images, newImage]);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Delete this image?')) {
      const updated = images.filter(i => i.id !== id);
      saveImages(updated);
      setImages(updated);
    }
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🖼️ Image Library</h1>
        <label className="btn btn-primary cursor-pointer">
          📤 Upload Image
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      
      <p className="text-neutral-400 mb-6">Upload images for menu items. In this demo, images are stored as data URLs in localStorage.</p>
      
      {images.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl mb-4 block">🖼️</span>
          <h2 className="text-xl font-bold">No Images Yet</h2>
          <p className="text-neutral-400 mt-2">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="card p-2 relative group">
              <img src={img.dataUrl} alt={img.name} className="w-full h-32 object-cover rounded-lg" />
              <div className="mt-2">
                <p className="text-sm font-medium truncate">{img.name}</p>
                <p className="text-xs text-neutral-500">{new Date(img.uploadedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
