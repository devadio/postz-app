#!/bin/bash
# ============================================================================
# Postiz Fork Deployment Script
# Automatically updates cache-busting tokens and rebuilds
# ============================================================================

set -e  # Exit on error

echo "🚀 Starting Postiz deployment..."

# Generate unique cache bust token
TIMESTAMP=$(date +%s)
BUILD_DATE=$(date +%Y-%m-%d-%H%M)

# Update .env file with new cache bust tokens
echo "📝 Updating cache-bust tokens..."
sed -i.bak "s/BUILD_DATE=.*/BUILD_DATE=\"$BUILD_DATE\"/" .env
sed -i.bak "s/CACHE_BUST_TOKEN=.*/CACHE_BUST_TOKEN=\"$TIMESTAMP\"/" .env

echo "✅ Cache tokens updated:"
echo "   BUILD_DATE=$BUILD_DATE"
echo "   CACHE_BUST_TOKEN=$TIMESTAMP"

# Check if this is a static-asset-only change (logo, images, text)
if [ "$1" == "--static-only" ]; then
    echo "🎨 Static assets changed - forcing frontend rebuild..."
    
    # Force rebuild only the frontend layer
    docker-compose build --no-cache postiz-app
    
    echo "♻️  Restarting services..."
    docker-compose up -d --force-recreate postiz-app
    
else
    echo "🔨 Full rebuild and restart..."
    
    # Full rebuild with cache
    docker-compose build postiz-app
    docker-compose up -d --force-recreate
fi

# Clean up old images to save space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✅ Deployment complete!"
echo "🌐 URL: https://postz2.devad.io"
echo ""
echo "💡 To force browser cache clear, tell users to:"
echo "   - Press Ctrl+Shift+R (Windows/Linux)"
echo "   - Press Cmd+Shift+R (Mac)"
echo ""
