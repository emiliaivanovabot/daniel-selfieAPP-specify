# Research: AI-Powered Selfie Generator with Emilia

**Phase 0 Research Output** | **Date**: 2025-09-19

## Glassmorphism Design Patterns with Tailwind CSS

**Decision**: Implement glassmorphism using Tailwind CSS utilities with custom backdrop-blur and rgba backgrounds

**Rationale**:
- Glassmorphism provides the premium, modern aesthetic specified in requirements
- Tailwind CSS allows rapid implementation with consistent design tokens
- Mobile-first approach ensures touch-friendly interface elements
- Dark theme with pink/purple gradients aligns with specified design philosophy

**Alternatives considered**:
- CSS-in-JS solutions (too complex for this scope)
- Vanilla CSS (less maintainable)
- UI component libraries (don't provide exact glassmorphism styling needed)

**Implementation approach**:
```css
/* Glassmorphism components */
.glass-card {
  @apply bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl;
}

.glass-button {
  @apply bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-white/30;
}
```

## FAL.ai Face-Swapping API Integration

**Decision**: Use @fal-ai/client 1.6.2 with server-side processing in Next.js API routes

**Rationale**:
- Official FAL.ai client provides type safety and error handling
- Server-side integration protects API keys and handles CORS
- Streaming responses allow progress updates during 15-20 second processing
- Next.js API routes provide serverless scalability on Vercel

**Alternatives considered**:
- Direct browser-side API calls (exposes API keys)
- Custom HTTP client (reinventing wheel)
- WebSocket connections (unnecessary complexity)

**Implementation approach**:
```typescript
// API route: /api/generate
import { fal } from '@fal-ai/client';

export async function POST(request: Request) {
  const formData = await request.formData();
  const userImage = formData.get('image') as File;

  const result = await fal.subscribe('fal-ai/nano-banana/edit', {
    input: {
      image_url: await uploadToTemp(userImage),
      reference_image_url: process.env.REFERENCE_IMAGE_URL,
      scene: formData.get('scene'),
      interaction: formData.get('interaction')
    },
    onQueueUpdate: (update) => {
      // Stream progress to client
    }
  });

  return Response.json(result);
}
```

## Vercel Serverless Constraints and Optimization

**Decision**: Optimize for 60-second timeout with efficient memory usage and temporary file handling

**Rationale**:
- 15-20 second AI processing fits within 60-second limit with buffer
- 1024MB memory sufficient for image processing with Sharp
- Vercel Edge Runtime not suitable for complex AI operations
- Temporary file cleanup prevents memory leaks

**Alternatives considered**:
- Edge Runtime (insufficient for AI processing)
- External storage services (unnecessary complexity)
- Background job queues (overengineering for this use case)

**Optimization strategies**:
- Use Vercel's built-in file upload handling
- Implement proper cleanup for temporary files
- Optimize image sizes before FAL.ai processing
- Use streaming responses for progress updates

## Mobile Touch Interaction Patterns

**Decision**: Implement native drag & drop with touch fallbacks and progressive enhancement

**Rationale**:
- HTML5 drag & drop provides familiar desktop experience
- Touch event handlers ensure mobile compatibility
- Visual feedback guides users through interaction
- Progressive enhancement ensures accessibility

**Alternatives considered**:
- File input only (poor UX)
- Third-party upload libraries (unnecessary dependency)
- Native mobile camera API (beyond scope)

**Implementation approach**:
- Drag & drop zone with visual hover states
- Touch event handling for mobile devices
- Image preview with validation feedback
- Multiple file format support (JPG, PNG, WebP)

## Performance and User Experience Patterns

**Decision**: Implement optimistic UI with loading states and error boundaries

**Rationale**:
- 15-20 second processing time requires engaging progress UI
- Error handling for API failures improves reliability
- Optimistic updates provide immediate feedback
- Progressive loading enhances perceived performance

**Key patterns**:
- Step-by-step wizard with progress indicators
- Animated loading states during AI processing
- Immediate preview of uploaded images
- Error boundaries for graceful failure handling
- Offline detection and messaging

## Social Media Integration

**Decision**: Use Web Share API with fallbacks for Instagram optimization

**Rationale**:
- Web Share API provides native sharing on mobile devices
- Instagram-optimized dimensions (1024x1365) specified in requirements
- Automatic filename generation with timestamps
- Direct download as backup sharing method

**Implementation approach**:
```typescript
const shareImage = async (imageUrl: string) => {
  if (navigator.share) {
    await navigator.share({
      title: 'My AI Selfie with Emilia',
      url: imageUrl
    });
  } else {
    // Fallback to download
    downloadImage(imageUrl);
  }
};
```

## Technical Stack Decisions Summary

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Frontend Framework** | Next.js 15.0.3 App Router | Server components, API routes, Vercel optimization |
| **Styling** | Tailwind CSS + Custom CSS | Rapid development, consistent design tokens |
| **AI Integration** | @fal-ai/client 1.6.2 | Official client, type safety, streaming support |
| **Image Processing** | Sharp 0.33.0 | Fast, memory-efficient image operations |
| **Testing** | Jest + Playwright | Unit and E2E testing coverage |
| **Deployment** | Vercel Serverless | Automatic scaling, Next.js optimizations |

All research findings support the technical approach outlined in the implementation plan. No blockers identified for moving to Phase 1 design and contracts.