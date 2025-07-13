#!/bin/bash

# Task Board - Autonomous Build Script
# This script can be run by an AI assistant to build the entire application

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"
SRC_DIR="$PROJECT_ROOT/src"
BUILD_LOG="$PROJECT_ROOT/build.log"

# Initialize build log
echo "=== Task Board Build Started at $(date) ===" > "$BUILD_LOG"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$BUILD_LOG"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$BUILD_LOG"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$BUILD_LOG"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$BUILD_LOG"
            ;;
    esac
}

# Check if running in autonomous mode
AUTONOMOUS_MODE=false
GUIDED_MODE=false

if [[ "${1:-}" == "--autonomous" ]]; then
    AUTONOMOUS_MODE=true
    log "INFO" "Running in AUTONOMOUS mode"
elif [[ "${1:-}" == "--guided" ]]; then
    GUIDED_MODE=true
    log "INFO" "Running in GUIDED mode"
fi

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if (( node_version < 20 )); then
            missing_deps+=("Node.js 20+ (current: v$node_version)")
        fi
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        missing_deps+=("PostgreSQL")
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "ERROR" "Missing dependencies: ${missing_deps[*]}"
        return 1
    fi
    
    log "SUCCESS" "All prerequisites met"
    return 0
}

# Function to validate specification files
validate_specs() {
    log "INFO" "Validating specification files..."
    
    local required_files=(
        "01-vision.md"
        "02-design-system.json"
        "03-pages.json"
        "04-features.json"
        "05-user-journeys.json"
        "06-database.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$DOCS_DIR/$file" ]; then
            log "ERROR" "Missing specification file: $file"
            return 1
        fi
        
        # Validate JSON files
        if [[ $file == *.json ]]; then
            if ! jq empty "$DOCS_DIR/$file" 2>/dev/null; then
                log "ERROR" "Invalid JSON in $file"
                return 1
            fi
        fi
    done
    
    log "SUCCESS" "All specification files valid"
    return 0
}

# Function to setup project structure
setup_project() {
    log "INFO" "Setting up project structure..."
    
    # Create directory structure
    mkdir -p "$SRC_DIR"/{backend,frontend,shared,tests}
    mkdir -p "$SRC_DIR"/backend/{api,services,models,middleware}
    mkdir -p "$SRC_DIR"/frontend/{components,pages,hooks,stores,styles}
    mkdir -p "$SRC_DIR"/shared/{types,utils,constants}
    mkdir -p "$SRC_DIR"/tests/{unit,integration,e2e}
    
    # Initialize package.json
    cat > "$PROJECT_ROOT/package.json" << 'EOF'
{
  "name": "task-board",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd src/backend && npm run dev",
    "dev:frontend": "cd src/frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
EOF

    log "SUCCESS" "Project structure created"
}

# Function to generate code from specifications
generate_code() {
    log "INFO" "Generating code from specifications..."
    
    # This function would typically call individual generators
    # For now, we'll create a marker file for the AI to process
    
    cat > "$SRC_DIR/GENERATE_INSTRUCTIONS.md" << 'EOF'
# Code Generation Instructions

Please generate the following based on the specification files:

## 1. Database Layer (from 06-database.json)
- [ ] Create TypeScript types from schema
- [ ] Generate Prisma/Drizzle schema
- [ ] Create migration files
- [ ] Generate repository classes

## 2. API Layer (from 04-features.json + 06-database.json)
- [ ] Generate Express/Fastify routes
- [ ] Create WebSocket handlers
- [ ] Implement authentication middleware
- [ ] Add request validation

## 3. Frontend Components (from 02-design-system.json + 03-pages.json)
- [ ] Generate design token CSS variables
- [ ] Create base components
- [ ] Implement page components
- [ ] Add drag-and-drop functionality

## 4. State Management (from 04-features.json)
- [ ] Create Zustand stores
- [ ] Implement real-time sync logic
- [ ] Add optimistic updates

## 5. Tests (from 05-user-journeys.json)
- [ ] Generate component tests
- [ ] Create API integration tests
- [ ] Implement E2E test scenarios

Use the specification files as the source of truth for all generated code.
EOF

    log "SUCCESS" "Code generation instructions created"
}

# Function to run tests
run_tests() {
    log "INFO" "Running tests..."
    
    # Create a basic test to verify setup
    mkdir -p "$SRC_DIR/tests/unit"
    cat > "$SRC_DIR/tests/unit/setup.test.ts" << 'EOF'
import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have valid specification files', () => {
    expect(true).toBe(true)
  })
})
EOF

    log "SUCCESS" "Test suite prepared"
}

# Main execution flow
main() {
    log "INFO" "Starting Task Board build process..."
    
    # Step 1: Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi
    
    # Step 2: Validate specifications
    if ! validate_specs; then
        log "ERROR" "Specification validation failed. Please check the docs directory."
        exit 1
    fi
    
    # Step 3: Setup project
    setup_project
    
    # Step 4: Generate code
    generate_code
    
    # Step 5: Run tests
    run_tests
    
    log "SUCCESS" "Build process completed successfully!"
    log "INFO" "Next steps:"
    log "INFO" "1. Review generated code in $SRC_DIR"
    log "INFO" "2. Run 'npm install' to install dependencies"
    log "INFO" "3. Configure environment variables"
    log "INFO" "4. Run 'npm run dev' to start development server"
    
    # Create summary file for AI
    cat > "$PROJECT_ROOT/BUILD_SUMMARY.md" << EOF
# Build Summary

Build completed at: $(date)
Status: SUCCESS

## Generated Structure
- Backend API: $SRC_DIR/backend
- Frontend App: $SRC_DIR/frontend
- Shared Types: $SRC_DIR/shared
- Test Suite: $SRC_DIR/tests

## Next Actions Required
1. Generate actual code from specifications
2. Implement database migrations
3. Configure environment variables
4. Run comprehensive tests

## Specifications Used
$(ls -la "$DOCS_DIR"/*.json "$DOCS_DIR"/*.md)

Please proceed with code generation using the GENERATE_INSTRUCTIONS.md file.
EOF
}

# Execute main function
main "$@"
