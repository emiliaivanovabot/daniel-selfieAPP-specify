# Tasks: AI-Powered Selfie Generator with Emilia

**Input**: Design documents from `/specs/001-projektvision-eine-ki/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: Next.js 15.0.3, TypeScript 5.6.3, FAL.ai, Tailwind, Redis
2. Load optional design documents:
   → data-model.md: Extract 9 entities → model tasks
   → contracts/: api-spec.yaml → 3 endpoint contract tests
   → research.md: Extract glassmorphism, rate limiting → setup tasks
3. Generate tasks by category:
   → Setup: Next.js project, dependencies, environment
   → Tests: API contract tests, integration scenarios
   → Core: models, services, API endpoints, UI components
   → Integration: Redis rate limiting, S3 storage, observability
   → Polish: E2E tests, performance validation, monitoring
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? (✓ 3/3)
   → All entities have models? (✓ 9/9)
   → All endpoints implemented? (✓ 3/3)
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Next.js structure with App Router:
- **Frontend**: `src/app/`, `components/`
- **API**: `src/app/api/`
- **Libraries**: `lib/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`

---

## Phase 3.1: Setup & Environment

- [ ] **T001** Create Next.js 15.0.3 project structure with TypeScript 5.6.3 and App Router
- [ ] **T002** Install dependencies: @fal-ai/client@1.6.2, tailwindcss, sharp@0.33.0, redis, aws-sdk
- [ ] **T003** [P] Configure ESLint, Prettier, and TypeScript strict mode in config files
- [ ] **T004** [P] Setup environment variables in `.env.local` and `.env.example`
- [ ] **T005** [P] Configure Tailwind CSS with glassmorphism utilities in `tailwind.config.js`
- [ ] **T006** [P] Setup Redis connection configuration in `lib/redis.ts`
- [ ] **T007** [P] Setup S3-compatible storage client in `lib/storage.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] **T008** [P] Contract test POST /api/generate in `tests/contract/test_generate_post.ts`
- [ ] **T009** [P] Contract test GET /api/scenes in `tests/contract/test_scenes_get.ts`
- [ ] **T010** [P] Contract test GET /api/interactions in `tests/contract/test_interactions_get.ts`

### Rate Limiting & Tier Tests
- [ ] **T011** [P] Rate limiting test (1 req/10s) in `tests/contract/test_rate_limiting.ts`
- [ ] **T012** [P] Daily quota test (Free: 3/day, Premium: unlimited) in `tests/contract/test_daily_quota.ts`
- [ ] **T013** [P] CAPTCHA trigger test (>10 generations/day) in `tests/contract/test_captcha.ts`

### Integration Tests (User Journey)
- [ ] **T014** [P] Complete user journey test (upload → select → generate → download) in `tests/integration/test_complete_journey.ts`
- [ ] **T015** [P] Mobile touch interaction test in `tests/integration/test_mobile_interactions.ts`
- [ ] **T016** [P] Error handling and recovery test in `tests/integration/test_error_handling.ts`
- [ ] **T017** [P] Data retention and cleanup test in `tests/integration/test_data_retention.ts`

### Performance & Observability Tests
- [ ] **T018** [P] Performance test (≤25s P95 latency) in `tests/integration/test_performance.ts`
- [ ] **T019** [P] Concurrent load test (50 simultaneous) in `tests/integration/test_concurrent_load.ts`
- [ ] **T020** [P] Observability metrics test in `tests/integration/test_observability.ts`

## Phase 3.3: Data Models & Types (ONLY after tests are failing)

### Core Entity Models
- [ ] **T021** [P] UserPhoto model with validation in `lib/models/user-photo.ts`
- [ ] **T022** [P] SceneTemplate model with predefined data in `lib/models/scene-template.ts`
- [ ] **T023** [P] InteractionType model with predefined data in `lib/models/interaction-type.ts`
- [ ] **T024** [P] GeneratedSelfie model with metadata in `lib/models/generated-selfie.ts`
- [ ] **T025** [P] UserSession model with tier tracking in `lib/models/user-session.ts`

### Tier & Rate Limiting Models
- [ ] **T026** [P] UserTier model (Free/Premium) in `lib/models/user-tier.ts`
- [ ] **T027** [P] RateLimitTracker model in `lib/models/rate-limit-tracker.ts`
- [ ] **T028** [P] AuditLog model for observability in `lib/models/audit-log.ts`

### Validation Schemas
- [ ] **T029** [P] Zod validation schemas for all models in `lib/schemas/index.ts`

## Phase 3.4: Core Services

### Image Processing Services
- [ ] **T030** Image validation service (format, size, face detection) in `lib/services/image-validation.ts`
- [ ] **T031** Image optimization service (Sharp integration) in `lib/services/image-optimization.ts`
- [ ] **T032** FAL.ai integration service in `lib/integrations/fal/client.ts`

### Rate Limiting & Tier Services
- [ ] **T033** Rate limiting service (Redis-backed) in `lib/services/rate-limiting.ts`
- [ ] **T034** User tier management service in `lib/services/user-tier.ts`
- [ ] **T035** Daily quota tracking service in `lib/services/quota-tracking.ts`

### Data Management Services
- [ ] **T036** S3 storage service (EU region, encrypted) in `lib/services/storage.ts`
- [ ] **T037** Data retention service (24h/7d/30d cleanup) in `lib/services/data-retention.ts`
- [ ] **T038** Audit logging service in `lib/services/audit-logging.ts`

### Session & Queue Services
- [ ] **T039** Session management service in `lib/services/session-management.ts`
- [ ] **T040** Generation queue service (Premium priority) in `lib/services/generation-queue.ts`

## Phase 3.5: API Endpoints Implementation

### Core API Routes
- [ ] **T041** POST /api/generate endpoint with multipart upload in `src/app/api/generate/route.ts`
- [ ] **T042** GET /api/scenes endpoint in `src/app/api/scenes/route.ts`
- [ ] **T043** GET /api/interactions endpoint in `src/app/api/interactions/route.ts`

### Rate Limiting & Middleware
- [ ] **T044** Rate limiting middleware for all API routes in `lib/middleware/rate-limit.ts`
- [ ] **T045** CAPTCHA verification endpoint in `src/app/api/captcha/route.ts`
- [ ] **T046** Tier validation middleware in `lib/middleware/tier-validation.ts`

### Monitoring & Health
- [ ] **T047** Health check endpoint in `src/app/api/health/route.ts`
- [ ] **T048** Metrics endpoint for observability in `src/app/api/metrics/route.ts`

## Phase 3.6: UI Components (Mobile-First)

### Core User Interface Components
- [ ] **T049** [P] ImageUpload component with drag & drop in `components/image-upload.tsx`
- [ ] **T050** [P] SceneSelector component with preview cards in `components/scene-selector.tsx`
- [ ] **T051** [P] InteractionSelector component in `components/interaction-selector.tsx`
- [ ] **T052** [P] GenerationProgress component with animations in `components/generation-progress.tsx`
- [ ] **T053** [P] ResultDisplay component with download/share in `components/result-display.tsx`

### Tier & Rate Limiting UI
- [ ] **T054** [P] TierDisplay component (Free/Premium status) in `components/tier-display.tsx`
- [ ] **T055** [P] QuotaIndicator component in `components/quota-indicator.tsx`
- [ ] **T056** [P] CaptchaModal component in `components/captcha-modal.tsx`
- [ ] **T057** [P] RateLimitNotification component in `components/rate-limit-notification.tsx`

### Layout & Navigation
- [ ] **T058** Main page layout with 4-step process in `src/app/page.tsx`
- [ ] **T059** Root layout with dark theme and glassmorphism in `src/app/layout.tsx`
- [ ] **T060** Global CSS with Tailwind utilities in `src/app/globals.css`

## Phase 3.7: Background Jobs & Automation

### Data Retention Jobs
- [ ] **T061** [P] Upload cleanup job (24h deletion) in `lib/jobs/cleanup-uploads.ts`
- [ ] **T062** [P] Generated images cleanup job (7d/30d) in `lib/jobs/cleanup-generated.ts`
- [ ] **T063** [P] Audit logs cleanup job (30d) in `lib/jobs/cleanup-audit-logs.ts`

### Queue Processing
- [ ] **T064** Generation queue processor with priority handling in `lib/jobs/process-generation-queue.ts`
- [ ] **T065** Failed generation retry logic in `lib/jobs/retry-failed-generations.ts`

### Monitoring Jobs
- [ ] **T066** [P] Performance monitoring job in `lib/jobs/monitor-performance.ts`
- [ ] **T067** [P] Error rate monitoring job in `lib/jobs/monitor-errors.ts`

## Phase 3.8: Integration & Infrastructure

### External Service Integration
- [ ] **T068** Redis cluster setup for distributed rate limiting in `lib/infrastructure/redis-cluster.ts`
- [ ] **T069** S3 bucket configuration (EU region, encryption) in `lib/infrastructure/s3-setup.ts`
- [ ] **T070** CDN configuration for generated images in `lib/infrastructure/cdn-setup.ts`

### Observability Integration
- [ ] **T071** Request tracing middleware in `lib/middleware/tracing.ts`
- [ ] **T072** Error tracking integration in `lib/integrations/error-tracking.ts`
- [ ] **T073** Performance metrics collection in `lib/integrations/metrics.ts`

### Security & Compliance
- [ ] **T074** CORS configuration for EU compliance in `lib/middleware/cors.ts`
- [ ] **T075** Data encryption utilities in `lib/utils/encryption.ts`
- [ ] **T076** GDPR compliance utilities in `lib/utils/gdpr.ts`

## Phase 3.9: Deployment & Environment

### Vercel Configuration
- [ ] **T077** [P] Vercel deployment configuration in `vercel.json`
- [ ] **T078** [P] Environment variables setup in deployment pipeline
- [ ] **T079** [P] Serverless function optimization for 60s timeout

### Infrastructure as Code
- [ ] **T080** [P] Redis infrastructure configuration
- [ ] **T081** [P] S3 bucket and IAM policies configuration
- [ ] **T082** [P] Monitoring and alerting setup

## Phase 3.10: Polish & Validation

### End-to-End Testing
- [ ] **T083** [P] Playwright E2E test suite in `tests/e2e/complete-user-journey.spec.ts`
- [ ] **T084** [P] Mobile responsiveness E2E tests in `tests/e2e/mobile-interactions.spec.ts`
- [ ] **T085** [P] Performance E2E validation in `tests/e2e/performance-validation.spec.ts`

### Final Validation
- [ ] **T086** Run complete quickstart validation scenarios
- [ ] **T087** Performance benchmark validation (≤25s P95)
- [ ] **T088** Security audit and penetration testing
- [ ] **T089** GDPR compliance validation
- [ ] **T090** Production deployment verification

---

## Dependencies

### Critical Paths
- **Setup** (T001-T007) → **Tests** (T008-T020) → **Models** (T021-T029) → **Services** (T030-T040) → **APIs** (T041-T048)
- **T030-T032** (Image services) blocks **T041** (generate endpoint)
- **T033-T035** (Rate limiting) blocks **T044** (rate limit middleware)
- **T036-T038** (Storage & retention) blocks **T061-T063** (cleanup jobs)
- **T021-T025** (Core models) blocks **T030-T040** (Services)
- **T041-T048** (API endpoints) blocks **T049-T060** (UI components)

### Parallel Execution Groups
```
# Setup Phase (T001-T007)
T003, T004, T005, T006, T007 can run in parallel

# Test Phase (T008-T020)
T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020 can run in parallel

# Models Phase (T021-T029)
T021, T022, T023, T024, T025, T026, T027, T028, T029 can run in parallel

# UI Components (T049-T060)
T049, T050, T051, T052, T053, T054, T055, T056, T057 can run in parallel
```

## Parallel Example
```bash
# Launch critical test tasks together (after T001-T007 complete):
Task: "Contract test POST /api/generate in tests/contract/test_generate_post.ts"
Task: "Contract test GET /api/scenes in tests/contract/test_scenes_get.ts"
Task: "Rate limiting test (1 req/10s) in tests/contract/test_rate_limiting.ts"
Task: "Complete user journey test in tests/integration/test_complete_journey.ts"
Task: "Performance test (≤25s P95 latency) in tests/integration/test_performance.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD)
- Focus on tier system (Free/Premium) and rate limiting
- EU region compliance for all data storage
- Performance targets: ≤25s P95, 50 concurrent users
- Data retention: 24h uploads, 7d/30d generated images, 30d logs

## Task Generation Rules Applied

1. **From Contracts (api-spec.yaml)**:
   - 3 endpoints → 3 contract tests (T008-T010) [P]
   - Rate limiting → dedicated tests (T011-T013) [P]

2. **From Data Model (9 entities)**:
   - Each entity → model creation task (T021-T028) [P]
   - Validation schemas → unified task (T029)

3. **From User Stories (quickstart.md)**:
   - Complete journey → integration test (T014) [P]
   - Mobile interactions → integration test (T015) [P]
   - Error handling → integration test (T016) [P]

4. **From New Requirements (FR-020, FR-021, FR-022)**:
   - Tier management → services (T034, T035)
   - Data retention → cleanup jobs (T061-T063) [P]
   - Performance monitoring → observability (T066, T067) [P]

## Validation Checklist ✓

- [x] All contracts have corresponding tests (3/3)
- [x] All entities have model tasks (9/9)
- [x] All tests come before implementation (T008-T020 → T021+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD approach: failing tests before implementation
- [x] Tier system and rate limiting thoroughly covered
- [x] Data retention and compliance requirements included
- [x] Performance and observability requirements addressed