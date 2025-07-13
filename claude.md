# Claude/AI Assistant Build Instructions

You are about to build a complete kanban task management application autonomously. This document provides step-by-step instructions for the build process.

## Overview

This project uses a specification-driven approach where the entire application is defined in JSON/Markdown documents. Your task is to transform these specifications into a working application.

## Build Process

### Phase 1: Environment Setup
1. Read and validate all specification documents in `/docs`
2. Check system requirements
3. Initialize project dependencies
4. Set up development environment

### Phase 2: Database Layer
1. Parse `06-database.json`
2. Generate SQL migrations
3. Create database schema
4. Set up Supabase integration
5. Implement data access layer

### Phase 3: Backend Development
1. Parse `04-features.json` for API requirements
2. Generate REST API endpoints
3. Implement WebSocket handlers
4. Create authentication middleware
5. Add real-time synchronization

### Phase 4: Frontend Development
1. Parse `02-design-system.json` for styling
2. Parse `03-pages.json` for components
3. Generate React components
4. Implement drag-and-drop
5. Add responsive layouts

### Phase 5: Integration
1. Connect frontend to backend
2. Implement user journeys from `05-user-journeys.json`
3. Add error handling
4. Set up monitoring

### Phase 6: Testing
1. Generate unit tests for components
2. Create integration tests for APIs
3. Add E2E tests for user journeys
4. Performance testing

## Execution Commands

When executing the build, use these commands in sequence:

```bash
# 1. Setup environment
cd /Users/jos/Developer/Testing/doitnow
chmod +x scripts/build.sh
./scripts/build.sh setup

# 2. Generate code from specs
./scripts/build.sh generate

# 3. Run tests
./scripts/build.sh test

# 4. Deploy locally
./scripts/build.sh deploy-local
```

## Code Generation Rules

1. **Follow the specifications exactly** - All components, colors, spacing must match the design system
2. **Use TypeScript** for type safety
3. **Implement error boundaries** for all user interactions
4. **Add loading states** for all async operations
5. **Include accessibility** features (ARIA labels, keyboard navigation)

## Key Decisions

- **Framework**: React 18 with Next.js 14
- **Styling**: Tailwind CSS with design tokens
- **State**: Zustand for client state
- **Database**: PostgreSQL with Supabase
- **Realtime**: Supabase Realtime
- **Testing**: Vitest + Playwright

## Error Handling

If any step fails:
1. Log the full error with context
2. Attempt automatic recovery
3. If recovery fails, provide clear fix instructions
4. Continue with next non-dependent step

## Success Criteria

The build is complete when:
- [ ] All tests pass (>90% coverage)
- [ ] Application runs without errors
- [ ] All user journeys are functional
- [ ] Performance metrics meet targets (<100ms interaction)
- [ ] Accessibility score >95

## Important Notes

- Always read the specification files before generating code
- Preserve the layered architecture
- Make the build process idempotent
- Log all decisions and generated files
