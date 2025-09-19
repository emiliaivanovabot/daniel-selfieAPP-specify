'use client';

import React, { useState, useCallback } from 'react';
import { SimpleUpload } from '../../components/simple-upload';
import { ResultDisplay } from '../../components/result-display';

// Scene options with German names
const SCENES = [
  { id: 'candlelight', category: 'romantic', name: 'Candlelight Dinner', description: 'Romantisches Dinner bei Kerzenschein', preview: '🕯️' },
  { id: 'beach-sunset', category: 'romantic', name: 'Beach Sunset', description: 'Romantischer Sonnenuntergang am Strand', preview: '🌅' },
  { id: 'nightclub', category: 'party', name: 'Nightclub', description: 'Aufregende Partynacht im Club', preview: '🌃' },
  { id: 'festival', category: 'party', name: 'Festival', description: 'Fröhliche Festivalstimmung', preview: '🎪' },
  { id: 'wedding', category: 'party', name: 'Wedding Party', description: 'Elegante Hochzeitsfeier', preview: '💒' },
  { id: 'coffee-shop', category: 'casual', name: 'Coffee Shop', description: 'Gemütliches Café-Ambiente', preview: '☕' },
  { id: 'park-picnic', category: 'casual', name: 'Park Picnic', description: 'Entspanntes Picknick im Park', preview: '🌳' },
  { id: 'rooftop', category: 'urban', name: 'Rooftop City View', description: 'Urbaner Blick über die Stadt', preview: '🏙️' },
];

// Interaction options with German names
const INTERACTIONS = [
  { id: 'kiss-cheek', category: 'romantic', name: 'Kiss on Cheek', description: 'Zärtlicher Kuss auf die Wange', emoji: '😘' },
  { id: 'holding-hands', category: 'romantic', name: 'Holding Hands', description: 'Romantisches Händchen halten', emoji: '🤝' },
  { id: 'hugging', category: 'friendly', name: 'Hugging', description: 'Freundschaftliche Umarmung', emoji: '🫂' },
  { id: 'smiling', category: 'friendly', name: 'Smiling Together', description: 'Gemeinsam lächeln', emoji: '😊' },
  { id: 'clinking-glasses', category: 'party', name: 'Clinking Glasses', description: 'Anstoßen mit Gläsern', emoji: '🥂' },
  { id: 'laughing', category: 'party', name: 'Laughing Together', description: 'Gemeinsam lachen', emoji: '😄' },
  { id: 'selfie-pose', category: 'social', name: 'Selfie Pose', description: 'Perfekte Selfie-Pose', emoji: '🤳' },
];

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

interface GenerationError {
  success: false;
  error: string;
  code: string;
  retryAfter?: number;
  dailyQuota?: any;
  requiresCaptcha?: boolean;
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<GenerationError | null>(null);
  const [progress, setProgress] = useState(0);

  const resetToStart = useCallback(() => {
    setCurrentStep(1);
    setSelectedFile(null);
    setSelectedScene(null);
    setSelectedInteraction(null);
    setIsGenerating(false);
    setGenerationResult(null);
    setGenerationError(null);
    setProgress(0);
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleImageValidation = useCallback((isValid: boolean) => {
    if (isValid && selectedFile) {
      setProgress(25);
    }
  }, [selectedFile]);

  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedScene(sceneId);
    setProgress(50);
  }, []);

  const handleInteractionSelect = useCallback((interactionId: string) => {
    setSelectedInteraction(interactionId);
    setProgress(75);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedFile || !selectedScene || !selectedInteraction) return;

    setIsGenerating(true);
    setGenerationError(null);
    setCurrentStep(4);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scene', selectedScene);
      formData.append('interaction', selectedInteraction);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setGenerationResult(result);
        setProgress(100);
      } else {
        setGenerationError(result);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationError({
        success: false,
        error: 'Netzwerkfehler. Bitte versuche es erneut.',
        code: 'NETWORK_ERROR'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedFile, selectedScene, selectedInteraction]);

  const canProceedToStep2 = selectedFile !== null;
  const canProceedToStep3 = canProceedToStep2 && selectedScene !== null;
  const canGenerate = canProceedToStep3 && selectedInteraction !== null;

  if (generationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
        <ResultDisplay
          result={generationResult}
          onNewGeneration={resetToStart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          AI-Selfie mit Emilia ✨
        </h1>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto px-4">
          3 einfache Schritte zum perfekten Selfie
        </p>

        {/* Progress Bar */}
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white/10 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span className={currentStep >= 1 ? 'text-white' : ''}>Upload</span>
            <span className={currentStep >= 2 ? 'text-white' : ''}>Szene</span>
            <span className={currentStep >= 3 ? 'text-white' : ''}>Interaktion</span>
            <span className={currentStep >= 4 ? 'text-white' : ''}>Fertig</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Schritt 1: Dein Foto hochladen
              </h2>
              <p className="text-white/70">
                Lade ein klares Foto von dir hoch, damit Emilia dich erkennen kann
              </p>
            </div>

            <SimpleUpload
              onImageSelect={handleImageSelect}
              onImageValidation={handleImageValidation}
            />

            {canProceedToStep2 && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
                >
                  Weiter zur Szenen-Auswahl
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scene Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Schritt 2: Szene auswählen
              </h2>
              <p className="text-white/70">
                Wähle den perfekten Hintergrund für euer Selfie
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSelect(scene.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-center
                    ${selectedScene === scene.id
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                    } backdrop-blur-sm
                  `}
                >
                  <div className="text-3xl mb-2">{scene.preview}</div>
                  <div className="text-white font-medium text-sm">{scene.name}</div>
                  <div className="text-white/60 text-xs">{scene.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück
              </button>

              {canProceedToStep3 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
                >
                  Weiter zur Interaktion
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Interaction Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Schritt 3: Interaktion wählen
              </h2>
              <p className="text-white/70">
                Wie möchtet ihr zusammen posieren?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERACTIONS.map((interaction) => (
                <button
                  key={interaction.id}
                  onClick={() => handleInteractionSelect(interaction.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-center
                    ${selectedInteraction === interaction.id
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                    } backdrop-blur-sm
                  `}
                >
                  <div className="text-3xl mb-2">{interaction.emoji}</div>
                  <div className="text-white font-medium text-sm">{interaction.name}</div>
                  <div className="text-white/60 text-xs">{interaction.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück
              </button>

              {canGenerate && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Emilia arbeitet ihre Magie...
                    </>
                  ) : (
                    <>
                      ✨ Bereit für die Magie!
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Generation Progress */}
        {currentStep === 4 && isGenerating && (
          <div className="text-center space-y-6">
            <div className="text-2xl font-bold text-white mb-4">
              ✨ Emilia arbeitet ihre Magie...
            </div>

            <div className="max-w-md mx-auto">
              <div className="animate-pulse bg-white/10 rounded-xl border border-white/20 p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-white/80">
                  Dein personalisiertes Selfie wird erstellt...
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Das dauert normalerweise 15-20 Sekunden
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generation Error */}
        {generationError && (
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto bg-red-500/20 border border-red-500/30 rounded-xl p-6">
              <div className="text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Generierung fehlgeschlagen
              </h3>
              <p className="text-white/80 mb-4">
                {generationError.error}
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={resetToStart}
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20"
                >
                  Von vorne beginnen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}