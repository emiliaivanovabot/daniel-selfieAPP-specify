'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface SimpleUploadProps {
  onImageSelect: (file: File) => void;
  onImageValidation: (isValid: boolean, error?: string) => void;
}

export function SimpleUpload({ onImageSelect, onImageValidation }: SimpleUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name, file.type, file.size);

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Bitte nur JPG, PNG oder WebP Dateien hochladen.');
      onImageValidation(false, 'Invalid format');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Datei zu groß. Maximum 10MB.');
      onImageValidation(false, 'File too large');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setError(null);

    // Notify parent
    onImageSelect(file);
    onImageValidation(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input change event triggered');
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    console.log('Opening file dialog, input ref:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/10 backdrop-blur-lg">
        {preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-green-400">✅ Bild erfolgreich hochgeladen!</div>
            <button
              onClick={() => {
                setPreview(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-red-400 hover:text-red-300"
            >
              Entfernen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <h3 className="text-xl font-bold text-white">Foto hochladen</h3>
            <p className="text-white/70">JPG, PNG oder WebP • Max. 10MB</p>

            <button
              onClick={openFileDialog}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              📁 Datei auswählen
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Debug info */}
      <div className="text-xs text-white/50 p-2 bg-black/20 rounded">
        Debug: Click "Datei auswählen" um den Upload zu testen
      </div>
    </div>
  );
}