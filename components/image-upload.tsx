'use client';

import React, { useCallback, useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageValidation: (isValid: boolean, error?: string) => void;
  disabled?: boolean;
  className?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function ImageUpload({
  onImageSelect,
  onImageValidation,
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = useCallback(async (file: File): Promise<ValidationResult> => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Bitte laden Sie eine JPG, PNG oder WebP Datei hoch.'
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Die Datei ist zu groß. Maximum: 10MB.'
      };
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          resolve({
            isValid: false,
            error: 'Das Bild ist zu klein. Mindestens 200x200 Pixel erforderlich.'
          });
        } else {
          resolve({ isValid: true });
        }
      };
      img.onerror = () => {
        resolve({
          isValid: false,
          error: 'Das Bild konnte nicht geladen werden.'
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (disabled) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const validation = await validateImage(file);

      if (validation.isValid) {
        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Notify parent components
        onImageSelect(file);
        onImageValidation(true);
        setValidationError(null);
      } else {
        setPreview(null);
        setValidationError(validation.error || 'Ungültiges Bild');
        onImageValidation(false, validation.error);
      }
    } catch (error) {
      console.error('Image validation error:', error);
      setValidationError('Fehler beim Validieren des Bildes');
      onImageValidation(false, 'Validation error');
    } finally {
      setIsValidating(false);
    }
  }, [disabled, validateImage, onImageSelect, onImageValidation]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input change triggered, files:', e.target.files);
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('File selected:', files[0].name, files[0].type, files[0].size);
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    console.log('Click handler triggered, fileInputRef:', fileInputRef.current);
    fileInputRef.current?.click();
  }, [disabled]);

  const handleRemoveImage = useCallback(() => {
    if (disabled) return;

    setPreview(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageValidation(false);
  }, [disabled, onImageValidation]);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${dragActive ? 'border-pink-400 bg-pink-500/10' : 'border-white/20'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-400 hover:bg-white/5'}
          ${preview ? 'border-solid border-white/30' : ''}
          bg-white/10 backdrop-blur-lg
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {isValidating ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-pink-500 border-t-transparent"></div>
            <p className="text-white/80">Bild wird validiert...</p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Uploaded preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-green-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Bild validiert
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
                disabled={disabled}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Icon */}
            <div className="mx-auto w-16 h-16 text-white/60">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {/* Upload Text */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                Foto hierher ziehen oder klicken
              </p>
              <p className="text-sm text-white/60">
                JPG, PNG oder WebP • Max. 10MB • Min. 200x200px
              </p>
              <p className="text-xs text-white/40">
                Stelle sicher, dass dein Gesicht klar zu sehen ist
              </p>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(e);
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 backdrop-blur-sm"
              disabled={disabled}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Foto auswählen
            </button>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
          <div className="flex items-center text-red-400">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{validationError}</span>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">💡 Tipps für das beste Ergebnis:</h4>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• Verwende ein Foto mit klarer Sicht auf dein Gesicht</li>
          <li>• Gute Beleuchtung sorgt für bessere Ergebnisse</li>
          <li>• Vermeide Sonnenbrillen oder Objekte vor dem Gesicht</li>
          <li>• Frontalansicht funktioniert am besten</li>
        </ul>
      </div>
    </div>
  );
}