# daniel-selfieAPP-specify Development Guidelines

Auto-generated from feature plans. Last updated: 2025-09-19

## Active Technologies
- **TypeScript 5.6.3**: Primary language with strict typing
- **Next.js 15.0.3**: App Router for SSR and API routes
- **@fal-ai/client 1.6.2**: AI image generation integration
- **Tailwind CSS**: Utility-first styling with glassmorphism design
- **Sharp 0.33.0**: Server-side image optimization
- **React**: Component-based UI framework

## Project Structure
```
src/app/
├── page.tsx              # Main UI (3-step process)
├── api/generate/
│   └── route.ts         # FAL.ai API endpoint
├── globals.css          # Tailwind + glassmorphism styles
└── layout.tsx           # Root layout with dark theme

components/
├── image-upload.tsx     # Photo upload with drag & drop
├── scene-selector.tsx   # Scene selection cards
├── interaction-selector.tsx # Interaction type selection
├── generation-progress.tsx  # AI processing animation
└── result-display.tsx   # Download & sharing UI

lib/
├── integrations/fal/
│   └── client.ts       # FAL.ai integration
├── utils.ts            # Image validation & optimization
└── types.ts            # TypeScript definitions

tests/
├── contract/           # API contract tests
├── integration/        # E2E user journey tests
└── unit/              # Component tests
```

## Key Environment Variables
```
FAL_API_KEY=d3bb5586-0ace-4c0e-b1e9-4388acbb972c:6e7846f314d2cc594cb513d82b1f8b75
NEXT_PUBLIC_SITE_URL=https://daniel-selfie.vercel.app
REFERENCE_IMAGE_URL=https://daniel-selfie.vercel.app/assets/reference-woman.jpg
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # E2E tests with Playwright
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
```

## Code Style Guidelines
- **Mobile-First**: All components responsive with touch optimization
- **Glassmorphism**: Use `bg-white/10 backdrop-blur-lg` patterns
- **Dark Theme**: Primary theme with pink/purple gradients
- **TypeScript**: Strict typing, use Zod for runtime validation
- **Error Boundaries**: Graceful failure handling for AI operations
- **Progressive Enhancement**: Core functionality works without JS

## FAL.ai Integration Patterns
```typescript
// Standard generation pattern
const result = await fal.subscribe('fal-ai/nano-banana/edit', {
  input: {
    image_url: userImageUrl,
    reference_image_url: process.env.REFERENCE_IMAGE_URL,
    scene: selectedScene,
    interaction: selectedInteraction
  },
  onQueueUpdate: (update) => {
    // Stream progress to client
  }
});
```

## Performance Constraints
- **Processing Time**: 15-20 seconds max for AI generation
- **Image Output**: Exactly 1024x1365 JPEG format
- **Serverless Timeout**: 60 seconds max on Vercel
- **Memory Limit**: 1024MB for image processing
- **Upload Limit**: 10MB max file size

## Testing Strategy
- **Contract Tests**: Validate API request/response schemas
- **Component Tests**: React Testing Library for UI components
- **E2E Tests**: Playwright for complete user journeys
- **Manual Testing**: Mobile touch interactions and accessibility

## Recent Changes
- 001-projektvision-eine-ki: Added AI selfie generation with Next.js 15, FAL.ai integration, glassmorphism design, mobile-first responsive layout

<!-- MANUAL ADDITIONS START -->
## Additional Guidelines
- Follow CLAUDE.md conventions from user's global config
- Use `npm` for package management (Vercel compatibility)
- Server runs on port 3000
- Kill existing dev servers before starting new ones
- Check project size regularly (GitHub 100MB limit)
- Never commit node_modules or .next directories

## AI-Specific Considerations
- Handle long-running AI operations with proper loading states
- Implement retry logic for failed generations
- Provide clear progress feedback during 15-20 second processing
- Optimize images before sending to FAL.ai to reduce processing time
- Cache static scene and interaction data in application bundle
<!-- MANUAL ADDITIONS END -->