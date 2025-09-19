import { fal } from '@fal-ai/client';

export interface GenerationRequest {
  imageUrl: string;
  scene: string;
  interaction: string;
}

export interface GenerationResult {
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

export interface GenerationError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
}

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export class FalAiClient {
  private static readonly MODEL = 'fal-ai/nano-banana/edit';
  private static readonly REFERENCE_IMAGE_URL = process.env.REFERENCE_IMAGE_URL!;

  static async generateSelfie(
    request: GenerationRequest
  ): Promise<GenerationResult | GenerationError> {
    const startTime = Date.now();

    try {
      // Convert scene and interaction to natural language prompt
      const prompt = this.generatePrompt(request.scene, request.interaction);
      console.log(`[FAL.ai] Starting generation with prompt: ${prompt}`);

      const result = await fal.subscribe(this.MODEL, {
        input: {
          prompt,
          image_urls: [request.imageUrl, this.REFERENCE_IMAGE_URL],
          num_images: 1,
          output_format: "jpeg"
        },
        onQueueUpdate: (update) => {
          console.log(`[FAL.ai] Queue update:`, update);
        },
      });

      const processingTime = Date.now() - startTime;

      console.log(`[FAL.ai] Result structure:`, JSON.stringify(result, null, 2));

      // Handle the actual FAL.ai response structure
      const images = (result as any).data?.images || (result as any).images;
      if (!images || images.length === 0) {
        console.log(`[FAL.ai] No images found in result. Available keys:`, Object.keys(result));
        return {
          success: false,
          error: 'No image generated',
          code: 'NO_IMAGE_GENERATED',
        };
      }

      const generatedImage = images[0];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const downloadFilename = `emilia-selfie-${timestamp}.jpg`;

      console.log(`[FAL.ai] Generation completed in ${processingTime}ms`);

      return {
        success: true,
        imageUrl: generatedImage.url,
        processingTime,
        dimensions: { width: 1024, height: 1365 },
        downloadFilename,
        falaiRequestId: (result as any).request_id || (result as any).requestId || 'unknown',
        userTier: 'free', // Will be determined by tier service
        retentionDays: 7, // Will be determined by tier service
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      console.error(`[FAL.ai] Generation failed after ${processingTime}ms:`, error);

      if (error instanceof Error) {
        // Handle specific FAL.ai errors
        if (error.message.includes('quota')) {
          return {
            success: false,
            error: 'Daily generation quota exceeded. Please try again tomorrow or upgrade to Premium.',
            code: 'QUOTA_EXCEEDED',
          };
        }

        if (error.message.includes('rate limit')) {
          return {
            success: false,
            error: 'Too many requests. Please wait a moment before trying again.',
            code: 'RATE_LIMITED',
          };
        }

        if (error.message.includes('face')) {
          return {
            success: false,
            error: 'No clear face detected in the uploaded image. Please upload a photo with a visible face.',
            code: 'FACE_NOT_DETECTED',
          };
        }
      }

      return {
        success: false,
        error: 'Image generation failed. Please try again.',
        code: 'GENERATION_FAILED',
        details: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
        },
      };
    }
  }

  static generatePrompt(scene: string, interaction: string): string {
    const sceneDesc = (SCENE_DESCRIPTIONS as any)[scene] || 'in a beautiful setting';
    const interactionDesc = (INTERACTION_DESCRIPTIONS as any)[interaction] || 'posing together';

    return `Create a photo showing the person from the first image and the woman from the second image ${interactionDesc} ${sceneDesc}. Make it look natural and realistic, preserving the identity and facial features of both people.`;
  }

  static async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - verify credentials are valid
      const result = await fal.subscribe(this.MODEL, {
        input: {
          prompt: "test prompt",
          image_urls: [this.REFERENCE_IMAGE_URL],
          num_images: 1
        },
        pollInterval: 1000,
        timeout: 5000,
      });
      return true;
    } catch (error) {
      console.error('[FAL.ai] Health check failed:', error);
      return false;
    }
  }
}

// Scene descriptions for natural language prompts
export const SCENE_DESCRIPTIONS = {
  'candlelight': 'at an intimate candlelight dinner with warm lighting and romantic atmosphere',
  'beach-sunset': 'on a beautiful beach during golden hour sunset with warm colors',
  'nightclub': 'in a vibrant nightclub with colorful party lights and energetic atmosphere',
  'festival': 'at a lively music festival with stage lights and crowd energy',
  'wedding': 'at an elegant wedding celebration with beautiful decorations',
  'coffee-shop': 'in a cozy coffee shop with warm lighting and relaxed atmosphere',
  'park-picnic': 'having a picnic in a beautiful park with natural green surroundings',
  'rooftop': 'on a stylish rooftop with city skyline views and urban ambiance',
} as const;

// Interaction descriptions for natural language prompts
export const INTERACTION_DESCRIPTIONS = {
  'kiss-cheek': 'sharing a tender kiss on the cheek',
  'holding-hands': 'holding hands romantically',
  'hugging': 'in a warm, friendly embrace',
  'smiling': 'smiling warmly together',
  'clinking-glasses': 'toasting and clinking glasses together',
  'laughing': 'laughing joyfully together',
  'selfie-pose': 'taking a selfie pose together',
} as const;

// Keep legacy mappings for backward compatibility in route validation
export const SCENE_MAPPINGS = SCENE_DESCRIPTIONS;
export const INTERACTION_MAPPINGS = INTERACTION_DESCRIPTIONS;