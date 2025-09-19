import { NextRequest, NextResponse } from 'next/server';
import { FalAiClient, SCENE_DESCRIPTIONS, INTERACTION_DESCRIPTIONS } from '../../../../lib/integrations/fal/client';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number; lastRequest: number }>();
const dailyQuotaMap = new Map<string, { count: number; resetTime: number }>();

interface GenerateRequestBody {
  image: File;
  scene: string;
  interaction: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const scene = formData.get('scene') as string;
    const interaction = formData.get('interaction') as string;

    // Validate required fields
    if (!image || !scene || !interaction) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: image, scene, and interaction are required',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image format. Please upload JPG, PNG, or WebP.',
        code: 'INVALID_IMAGE_FORMAT',
        details: {
          field: 'image',
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
        }
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'Image file too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE',
        details: {
          maxSize: maxSize,
          actualSize: image.size
        }
      }, { status: 400 });
    }

    // Validate scene and interaction
    if (!SCENE_DESCRIPTIONS[scene as keyof typeof SCENE_DESCRIPTIONS]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid scene selection',
        code: 'INVALID_SCENE'
      }, { status: 400 });
    }

    if (!INTERACTION_DESCRIPTIONS[interaction as keyof typeof INTERACTION_DESCRIPTIONS]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid interaction selection',
        code: 'INVALID_INTERACTION'
      }, { status: 400 });
    }

    // Apply rate limiting (1 request per 10 seconds)
    const rateLimitKey = `rate_${clientIp}`;
    const now = Date.now();
    const rateLimit = rateLimitMap.get(rateLimitKey);

    if (rateLimit && (now - rateLimit.lastRequest) < 10000) {
      const retryAfter = Math.ceil((10000 - (now - rateLimit.lastRequest)) / 1000);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please wait before making another request.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
        dailyQuota: getDailyQuotaInfo(clientIp)
      }, { status: 429 });
    }

    // Apply daily quota (Free: 3/day, Premium: unlimited)
    const quotaKey = `quota_${clientIp}`;
    const quota = dailyQuotaMap.get(quotaKey);
    const resetTime = new Date().setHours(24, 0, 0, 0); // Reset at midnight

    let dailyCount = 0;
    if (quota && quota.resetTime > now) {
      dailyCount = quota.count;
    }

    // For now, treat all users as Free tier (3 generations per day)
    const dailyLimit = 3;
    if (dailyCount >= dailyLimit) {
      return NextResponse.json({
        success: false,
        error: 'Daily generation limit reached. Please try again tomorrow or upgrade to Premium.',
        code: 'DAILY_QUOTA_EXCEEDED',
        retryAfter: Math.ceil((resetTime - now) / 1000),
        dailyQuota: {
          used: dailyCount,
          limit: dailyLimit,
          resetTime: new Date(resetTime).toISOString()
        },
        requiresCaptcha: dailyCount > 10
      }, { status: 429 });
    }

    // Convert image to blob URL for processing
    const imageBuffer = await image.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: image.type });

    // In production, upload to temporary storage and get URL
    // For now, we'll use a data URL (not recommended for production)
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:${image.type};base64,${base64}`;

    // Generate selfie using FAL.ai
    const result = await FalAiClient.generateSelfie({
      imageUrl,
      scene,
      interaction
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Update rate limiting counters
    rateLimitMap.set(rateLimitKey, {
      count: (rateLimit?.count || 0) + 1,
      resetTime: now + 10000,
      lastRequest: now
    });

    // Update daily quota
    dailyQuotaMap.set(quotaKey, {
      count: dailyCount + 1,
      resetTime
    });

    // Add tier and quota information to response
    const response = {
      ...result,
      userTier: 'free' as const,
      generationsRemaining: dailyLimit - (dailyCount + 1),
      retentionDays: 7,
      processingTime: Date.now() - startTime
    };

    console.log(`[API] Generation completed in ${response.processingTime}ms for IP: ${clientIp}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Generation error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error during image generation',
      code: 'INTERNAL_ERROR',
      details: {
        processingTime: Date.now() - startTime
      }
    }, { status: 500 });
  }
}

function getDailyQuotaInfo(clientIp: string) {
  const quotaKey = `quota_${clientIp}`;
  const quota = dailyQuotaMap.get(quotaKey);
  const now = Date.now();
  const resetTime = new Date().setHours(24, 0, 0, 0);

  let dailyCount = 0;
  if (quota && quota.resetTime > now) {
    dailyCount = quota.count;
  }

  return {
    used: dailyCount,
    limit: 3, // Free tier limit
    resetTime: new Date(resetTime).toISOString()
  };
}

// Health check endpoint
export async function GET() {
  try {
    const isHealthy = await FalAiClient.healthCheck();

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'generate-api'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'generate-api',
      error: 'Health check failed'
    }, { status: 503 });
  }
}