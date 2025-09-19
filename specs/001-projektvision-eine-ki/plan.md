# Implementation Plan: AI-Powered Selfie Generator with Emilia

**Branch**: `001-projektvision-eine-ki` | **Date**: 2025-09-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-projektvision-eine-ki/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Build an AI-powered web application that allows users to create realistic selfies with "Emilia" by uploading their photo, selecting romantic/social scenarios, choosing interaction types, and generating high-quality images using FAL.ai's face-swapping technology. The system will provide a mobile-first, premium experience with glassmorphism design and social media optimization.

## Technical Context
**Language/Version**: TypeScript 5.6.3, Next.js 15.0.3 (App Router)
**Primary Dependencies**: @fal-ai/client 1.6.2, Tailwind CSS, Sharp 0.33.0, React
**Storage**: Temporary file storage for uploaded images, no persistent user data
**Testing**: Jest/React Testing Library for frontend, Playwright for E2E
**Target Platform**: Web browsers (mobile-first), deployed on Vercel Serverless
**Project Type**: web - Next.js frontend with API routes for backend
**Performance Goals**: 15-20 second AI generation time, 1024x1365 output resolution
**Constraints**: 60 second serverless timeout, 1024MB memory limit, no file system write access
**Scale/Scope**: 50 simultaneous generations (soft-limit 100), tier-based user management (Free/Premium), EU-region data storage

**FAL.ai Integration Details**:
- API Key: `d3bb5586-0ace-4c0e-b1e9-4388acbb972c:6e7846f314d2cc594cb513d82b1f8b75`
- Model: `fal-ai/nano-banana/edit` for face-swapping
- Processing Time: 12-20 seconds
- Output: JPEG format, 1024x1365 pixels
- Input: User photo + Emilia reference image

**Environment Variables**:
```
FAL_API_KEY=d3bb5586-0ace-4c0e-b1e9-4388acbb972c:6e7846f314d2cc594cb513d82b1f8b75
NEXT_PUBLIC_SITE_URL=https://daniel-selfie.vercel.app
REFERENCE_IMAGE_URL=https://daniel-selfie.vercel.app/assets/reference-woman.jpg
S3_BUCKET_URL=eu-central-1.amazonaws.com/emilia-selfie-storage
REDIS_URL=redis://eu-central-1.cache.amazonaws.com
```

**New Requirements from Clarifications**:
- **Tier System**: Free (3/day) vs Premium (unlimited) with SLA targets
- **Data Retention**: 24h uploads, 7/30-day generated images, 30-day audit logs
- **Rate Limiting**: 1 req/10s, CAPTCHA >10/day, abuse protection
- **Observability**: Request tracing, error rate monitoring, performance metrics
- **Compliance**: EU-region storage, encrypted at-rest, GDPR-compliant deletion

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution template is placeholder-only, no specific gates to validate. Proceeding with standard web application patterns:
- Single responsibility principle for components
- Test-driven development approach
- Clean separation of concerns (UI, API, business logic)
- Progressive enhancement for mobile devices

## Project Structure

### Documentation (this feature)
```
specs/001-projektvision-eine-ki/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (Next.js structure)
src/app/
├── page.tsx                    # Main UI (3-step process)
├── api/generate/
│   └── route.ts               # FAL.ai API endpoint
├── globals.css                # Tailwind + glassmorphism styles
└── layout.tsx                 # Root layout with dark theme

components/
├── image-upload.tsx           # Photo upload with drag & drop
├── scene-selector.tsx         # Scene selection cards
├── interaction-selector.tsx   # Interaction type selection
├── generation-progress.tsx    # AI processing animation
└── result-display.tsx         # Download & sharing UI

lib/
├── integrations/fal/
│   └── client.ts             # FAL.ai integration
├── utils.ts                  # Image validation & optimization
└── types.ts                  # TypeScript definitions

public/assets/
└── reference-woman.jpg        # Emilia reference image

tests/
├── contract/                  # API contract tests
├── integration/               # E2E user journey tests
└── unit/                     # Component tests
```

**Structure Decision**: Option 2 (Web application) - Next.js App Router with integrated API routes

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - All technical details provided, no NEEDS CLARIFICATION items
   - Research mobile-first glassmorphism design patterns
   - Research FAL.ai API integration best practices
   - Research Vercel deployment constraints for AI workloads

2. **Generate and dispatch research agents**:
   ```
   Task: "Research glassmorphism design patterns with Tailwind CSS for mobile-first AI apps"
   Task: "Find best practices for FAL.ai face-swapping API integration in Next.js"
   Task: "Research Vercel serverless constraints and optimization for AI image processing"
   Task: "Find mobile touch interaction patterns for drag & drop image upload"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with technology decisions and best practices

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User Photo (uploaded file, validation, temporary storage)
   - Scene Template (predefined categories and backgrounds)
   - Interaction Type (pose parameters and emotional context)
   - Generated Selfie (AI output with metadata)
   - User Session (selection state and progress tracking)

2. **Generate API contracts** from functional requirements:
   - POST /api/generate (multipart upload + generation)
   - GET /api/scenes (available scene options)
   - GET /api/interactions (interaction type options)
   - OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - API endpoint request/response validation
   - File upload format and size limits
   - Error handling for generation failures
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Complete user journey from upload to download
   - Mobile touch interactions and responsiveness
   - AI generation progress and error states
   - Social sharing functionality

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Add Next.js 15, FAL.ai, glassmorphism design context
   - Preserve existing configurations
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API endpoint → contract test task [P]
- Each UI component → component creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: API contracts → components → integration → styling
- Mark [P] for parallel execution (independent components)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations identified for this implementation approach.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution template - See `/memory/constitution.md`*