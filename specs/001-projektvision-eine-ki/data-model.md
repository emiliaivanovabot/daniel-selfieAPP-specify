# Data Model: AI-Powered Selfie Generator with Emilia

**Phase 1 Design Output** | **Date**: 2025-09-19

## Core Entities

### User Photo
**Purpose**: Uploaded user image for AI processing

**Fields**:
- `file`: File object (JPG/PNG/WebP)
- `size`: number (bytes, max 10MB)
- `dimensions`: { width: number, height: number }
- `quality`: 'low' | 'medium' | 'high'
- `faceDetected`: boolean
- `uploadTimestamp`: Date
- `tempUrl`: string (temporary blob URL)

**Validation Rules**:
- File size ≤ 10MB (FR-002)
- Supported formats: JPG, PNG, WebP (FR-002)
- Minimum dimensions: 200x200px
- Face detection confidence > 0.7
- Image quality assessment > 0.5

**State Transitions**:
```
uploaded → validating → [valid|invalid] → processing → complete
```

### Scene Template
**Purpose**: Predefined background scenarios for selfie generation

**Fields**:
- `id`: string (unique identifier)
- `category`: 'romantic' | 'party' | 'casual' | 'urban'
- `name`: string (display name)
- `description`: string (user-facing description)
- `previewImage`: string (thumbnail URL)
- `falaiParams`: object (FAL.ai scene parameters)

**Predefined Values** (FR-004):
```typescript
const SCENE_TEMPLATES = [
  // Romantic
  { id: 'candlelight', category: 'romantic', name: 'Candlelight Dinner' },
  { id: 'beach-sunset', category: 'romantic', name: 'Beach Sunset' },

  // Party
  { id: 'nightclub', category: 'party', name: 'Nightclub' },
  { id: 'festival', category: 'party', name: 'Festival' },
  { id: 'wedding', category: 'party', name: 'Wedding Party' },

  // Casual
  { id: 'coffee-shop', category: 'casual', name: 'Coffee Shop' },
  { id: 'park-picnic', category: 'casual', name: 'Park Picnic' },

  // Urban
  { id: 'rooftop', category: 'urban', name: 'Rooftop City View' }
];
```

### Interaction Type
**Purpose**: Defines pose and emotional context between user and Emilia

**Fields**:
- `id`: string (unique identifier)
- `category`: 'romantic' | 'friendly' | 'party' | 'social'
- `name`: string (display name)
- `description`: string (emotional context)
- `falaiParams`: object (pose parameters for AI)

**Predefined Values** (FR-005):
```typescript
const INTERACTION_TYPES = [
  // Romantic
  { id: 'kiss-cheek', category: 'romantic', name: 'Kiss on Cheek' },
  { id: 'holding-hands', category: 'romantic', name: 'Holding Hands' },

  // Friendly
  { id: 'hugging', category: 'friendly', name: 'Hugging' },
  { id: 'smiling', category: 'friendly', name: 'Smiling Together' },

  // Party
  { id: 'clinking-glasses', category: 'party', name: 'Clinking Glasses' },
  { id: 'laughing', category: 'party', name: 'Laughing Together' },

  // Social Media
  { id: 'selfie-pose', category: 'social', name: 'Selfie Pose' }
];
```

### Generated Selfie
**Purpose**: AI-generated output image with metadata

**Fields**:
- `id`: string (unique identifier)
- `imageUrl`: string (generated image URL)
- `dimensions`: { width: 1024, height: 1365 } (FR-008)
- `format`: 'jpeg' (FR-010)
- `fileSize`: number (bytes)
- `processingTime`: number (milliseconds, target 15-20s)
- `generationTimestamp`: Date
- `downloadFilename`: string (auto-generated with timestamp)
- `falaiRequestId`: string (for debugging)

**Validation Rules**:
- Exact dimensions: 1024x1365 (FR-008)
- Format: JPEG only (FR-010)
- Processing time ≤ 20 seconds (FR-009)
- File size < 5MB (for sharing optimization)

**Auto-Generated Filename** (FR-012):
```typescript
const generateFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `emilia-selfie-${timestamp}.jpg`;
};
```

### User Session
**Purpose**: Tracks user progress and selections during creation process

**Fields**:
- `sessionId`: string (UUID)
- `step`: 1 | 2 | 3 | 4 (current step in process)
- `uploadedPhoto`: UserPhoto | null
- `selectedScene`: string | null (scene template ID)
- `selectedInteraction`: string | null (interaction type ID)
- `generatedSelfie`: GeneratedSelfie | null
- `userTier`: 'free' | 'premium' (determines generation limits)
- `dailyGenerationCount`: number (resets at midnight UTC)
- `lastRequestTime`: Date (for rate limiting)
- `startTime`: Date
- `lastActivity`: Date
- `status`: 'active' | 'generating' | 'complete' | 'error' | 'rate_limited'

**State Transitions**:
```
created → photo-uploaded → scene-selected → interaction-selected → generating → complete
                                                                  ↓
                                                               error → retry
```

**Progress Calculation** (FR-006):
```typescript
const calculateProgress = (session: UserSession): number => {
  const stepWeights = { 1: 25, 2: 50, 3: 75, 4: 100 };
  return stepWeights[session.step] || 0;
};
```

### User Tier
**Purpose**: Defines user access level and generation limits

**Fields**:
- `tier`: 'free' | 'premium'
- `dailyLimit`: number (3 for free, unlimited for premium)
- `priorityQueue`: boolean (false for free, true for premium)
- `slaTarget`: number (99.5% for free, 99.9% for premium)
- `retentionDays`: number (7 for free, 30 for premium)

**Validation Rules**:
- Free tier: max 3 generations per day
- Premium tier: unlimited generations
- Rate limit: 1 request per 10 seconds for all tiers
- CAPTCHA required when >10 generations per day

### Rate Limit Tracker
**Purpose**: Monitors request frequency and abuse protection

**Fields**:
- `sessionId`: string (UUID, links to UserSession)
- `requestCount`: number (requests in current time window)
- `windowStart`: Date (start of current rate limit window)
- `dailyCount`: number (total requests today)
- `lastCaptchaTime`: Date | null (when CAPTCHA was last required)
- `isBlocked`: boolean (temporary block for abuse)

**Rate Limiting Rules**:
- 1 request per 10 seconds per session
- CAPTCHA required after 10 generations per day
- Exponential backoff for repeated violations

### Audit Log
**Purpose**: Request tracing and debugging information

**Fields**:
- `logId`: string (UUID)
- `sessionId`: string (links to UserSession)
- `timestamp`: Date
- `action`: 'upload' | 'generate' | 'download' | 'rate_limit' | 'error'
- `metadata`: object (request details, error info, processing time)
- `userAgent`: string
- `ipHash`: string (hashed for privacy)
- `region`: string (EU region identifier)

**Retention Rules**:
- Automatic deletion after 30 days
- Used only for debugging and abuse detection
- No personal data stored in plaintext

## Entity Relationships

```
UserSession (1) → (0..1) UserPhoto
UserSession (1) → (0..1) SceneTemplate [via selectedScene]
UserSession (1) → (0..1) InteractionType [via selectedInteraction]
UserSession (1) → (0..1) GeneratedSelfie
UserSession (1) → (1) UserTier [via userTier field]
UserSession (1) → (1) RateLimitTracker
UserSession (1) → (n) AuditLog

SceneTemplate (n) → (m) InteractionType [compatible combinations]
```

## Data Storage Strategy

### Temporary Storage (Session Duration Only)
- **UserPhoto**: Browser memory as blob URL, server encrypted storage, automatic deletion after 24 hours
- **UserSession**: Browser localStorage for state persistence, server-side session tracking for rate limiting
- **RateLimitTracker**: In-memory cache with Redis backing for distributed rate limiting

### Retention-Based Storage (EU Region, S3-Compatible, Encrypted)
- **GeneratedSelfie**: Encrypted storage, 7 days (Free) or 30 days (Premium), manual deletion available
- **AuditLog**: Encrypted storage, 30 days retention, automatic cleanup

### Static Data (Application Bundled)
- **SceneTemplate**: Hardcoded in application, no database needed
- **InteractionType**: Hardcoded in application, no database needed
- **UserTier**: Configuration-based, determined by user authentication/payment status
- **Reference Image**: Static asset at `/public/assets/reference-woman.jpg`

### Data Privacy and Security
- All stored data encrypted at rest in EU region
- No personal data in plaintext in audit logs
- IP addresses hashed for privacy
- Manual deletion available for all user-generated content
- GDPR-compliant data handling

## TypeScript Definitions

```typescript
// types/index.ts
export interface UserPhoto {
  file: File;
  size: number;
  dimensions: { width: number; height: number };
  quality: 'low' | 'medium' | 'high';
  faceDetected: boolean;
  uploadTimestamp: Date;
  tempUrl: string;
}

export interface SceneTemplate {
  id: string;
  category: 'romantic' | 'party' | 'casual' | 'urban';
  name: string;
  description: string;
  previewImage: string;
  falaiParams: Record<string, any>;
}

export interface InteractionType {
  id: string;
  category: 'romantic' | 'friendly' | 'party' | 'social';
  name: string;
  description: string;
  falaiParams: Record<string, any>;
}

export interface GeneratedSelfie {
  id: string;
  imageUrl: string;
  dimensions: { width: 1024; height: 1365 };
  format: 'jpeg';
  fileSize: number;
  processingTime: number;
  generationTimestamp: Date;
  downloadFilename: string;
  falaiRequestId: string;
}

export interface UserSession {
  sessionId: string;
  step: 1 | 2 | 3 | 4;
  uploadedPhoto: UserPhoto | null;
  selectedScene: string | null;
  selectedInteraction: string | null;
  generatedSelfie: GeneratedSelfie | null;
  userTier: 'free' | 'premium';
  dailyGenerationCount: number;
  lastRequestTime: Date;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'generating' | 'complete' | 'error' | 'rate_limited';
}

export interface UserTier {
  tier: 'free' | 'premium';
  dailyLimit: number;
  priorityQueue: boolean;
  slaTarget: number;
  retentionDays: number;
}

export interface RateLimitTracker {
  sessionId: string;
  requestCount: number;
  windowStart: Date;
  dailyCount: number;
  lastCaptchaTime: Date | null;
  isBlocked: boolean;
}

export interface AuditLog {
  logId: string;
  sessionId: string;
  timestamp: Date;
  action: 'upload' | 'generate' | 'download' | 'rate_limit' | 'error';
  metadata: Record<string, any>;
  userAgent: string;
  ipHash: string;
  region: string;
}
```

## Validation Schemas

Using Zod for runtime validation:

```typescript
import { z } from 'zod';

export const UserPhotoSchema = z.object({
  file: z.instanceof(File),
  size: z.number().max(10 * 1024 * 1024), // 10MB
  dimensions: z.object({
    width: z.number().min(200),
    height: z.number().min(200)
  }),
  quality: z.enum(['low', 'medium', 'high']),
  faceDetected: z.boolean(),
  uploadTimestamp: z.date(),
  tempUrl: z.string().url()
});

export const GenerationRequestSchema = z.object({
  image: z.instanceof(File),
  scene: z.string(),
  interaction: z.string()
});
```

This data model supports all functional requirements while maintaining simplicity and avoiding unnecessary persistence.