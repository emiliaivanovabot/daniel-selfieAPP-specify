'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

interface GenerationResult {
  success: boolean;
  imageUrl: string;
  processingTime: number;
  dimensions: { width: number; height: number };
  downloadFilename: string;
  falaiRequestId: string;
  userTier: 'free' | 'premium';
  generationsRemaining?: number;
  retentionDays: number;
}

interface ResultDisplayProps {
  result: GenerationResult;
  onNewGeneration: () => void;
  onClose?: () => void;
  className?: string;
}

export function ResultDisplay({
  result,
  onNewGeneration,
  onClose,
  className = ''
}: ResultDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Downloaded: ${result.downloadFilename}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsDownloading(false);
    }
  }, [result.imageUrl, result.downloadFilename]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: 'Mein AI-Selfie mit Emilia',
          text: 'Schau dir mein cooles AI-Selfie an! ✨',
          url: result.imageUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(result.imageUrl);
        alert('Link wurde in die Zwischenablage kopiert!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback: try to download
      handleDownload();
    } finally {
      setIsSharing(false);
    }
  }, [result.imageUrl, handleDownload]);

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatRetentionDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/30 mb-4">
          <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          🎉 Perfekt für Instagram!
        </h2>
        <p className="text-white/70">
          Dein AI-Selfie mit Emilia ist bereit zum Teilen
        </p>
      </div>

      {/* Generated Image */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
        <div className="relative mx-auto" style={{ maxWidth: '400px', aspectRatio: '1024/1365' }}>
          <Image
            src={result.imageUrl}
            alt="Generated selfie with Emilia"
            fill
            className="object-cover rounded-lg shadow-2xl"
            quality={95}
            priority
          />

          {/* Overlay with generation info */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-xs text-white/90">
              {result.dimensions.width}×{result.dimensions.height}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex justify-center space-x-6 text-sm text-white/60">
          <div className="text-center">
            <div className="text-white font-medium">{formatProcessingTime(result.processingTime)}</div>
            <div>Generierungszeit</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{result.userTier === 'free' ? 'Free' : 'Premium'}</div>
            <div>Plan</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{formatRetentionDate(result.retentionDays)}</div>
            <div>Bis zum</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Lädt herunter...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            {isSharing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Teilt...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Teilen
              </>
            )}
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onNewGeneration}
            className="flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Neues Selfie
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Details
          </button>
        </div>
      </div>

      {/* Generation Details */}
      {showDetails && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generierungsdetails</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Verarbeitungszeit:</span>
              <span className="text-white">{formatProcessingTime(result.processingTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Auflösung:</span>
              <span className="text-white">{result.dimensions.width}×{result.dimensions.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Request ID:</span>
              <span className="text-white font-mono text-xs">{result.falaiRequestId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Dateiname:</span>
              <span className="text-white">{result.downloadFilename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Speicherung bis:</span>
              <span className="text-white">{formatRetentionDate(result.retentionDays)}</span>
            </div>
            {result.userTier === 'free' && typeof result.generationsRemaining === 'number' && (
              <div className="flex justify-between">
                <span className="text-white/60">Verbleibende Generierungen heute:</span>
                <span className="text-white">{result.generationsRemaining}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quota Information */}
      {result.userTier === 'free' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-400 mb-1">Free Plan</h4>
              <p className="text-xs text-white/70">
                {typeof result.generationsRemaining === 'number'
                  ? `Du hast noch ${result.generationsRemaining} Generierungen heute übrig.`
                  : 'Tägliches Limit erreicht.'
                }
                {result.generationsRemaining === 0 && ' Upgrade zu Premium für unbegrenzte Generierungen!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  );
}