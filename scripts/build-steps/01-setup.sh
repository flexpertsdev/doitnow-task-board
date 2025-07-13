#!/bin/bash

# Setup Step - Initialize development environment

set -euo pipefail

log() {
    echo "[SETUP] $1"
}

setup_environment() {
    log "Initializing environment..."
    
    # Create .env file from template
    if [ ! -f ".env" ]; then
        cp config/.env.template .env
        log "Created .env file - please configure"
    fi
    
    # Install Node dependencies
    log "Installing Node.js dependencies..."
    npm install
    
    # Setup database
    log "Setting up PostgreSQL database..."
    createdb task_board_dev || log "Database already exists"
    
    # Initialize Supabase
    log "Initializing Supabase..."
    npx supabase init || log "Supabase already initialized"
    
    log "Setup complete!"
}

setup_environment
