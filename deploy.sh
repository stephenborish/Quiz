#!/bin/bash

# =========================================
# Google Apps Script Deployment Script
# =========================================

set -e  # Exit on error

echo "🚀 Deploying Secure Assessment Platform to Google Apps Script..."
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "❌ Error: clasp is not installed"
    echo "Run: npm install -g @google/clasp"
    exit 1
fi

# Check if logged in
echo "Checking clasp authentication..."
if ! clasp login --status 2>/dev/null; then
    echo "⚠️  You need to login to clasp first"
    echo "Running: clasp login"
    clasp login
fi

# Show current project info
echo ""
echo "📋 Project Information:"
echo "Script ID: 1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb"
echo ""

# Push files to Apps Script
echo "📤 Pushing files to Apps Script..."
clasp push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Open project: clasp open"
echo "  2. Test in Apps Script editor"
echo "  3. Deploy as web app: clasp deploy --description 'Production v2.0'"
echo ""
echo "View logs: clasp logs"
echo ""
