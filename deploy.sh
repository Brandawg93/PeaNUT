#!/bin/bash
set -e  # Exit on any error

# Unified deploy script for Docker builds
# Usage: ./deploy.sh [local|test|production]

DEPLOY_TYPE=${1:-test}
PACKAGE_VERSION=$(cat package.json | jq --raw-output ".version")

case $DEPLOY_TYPE in
  local)
    echo "Creating a local image with version $PACKAGE_VERSION"
    npm run fullcheck
    if docker buildx build \
      --tag brandawg93/peanut:local \
      --tag brandawg93/peanut:${PACKAGE_VERSION} \
      --load \
      .; then
      docker buildx stop
      echo "Successfully built local image!"
    else
      docker buildx stop
      echo "Error: Failed to build local image!" >&2
      exit 1
    fi
    ;;
  
  test)
    echo "Creating a test image for arm64 and amd64 with version $PACKAGE_VERSION"
    npm run fullcheck
    if docker buildx build \
      --push \
      --platform linux/arm64,linux/amd64 \
      --tag brandawg93/peanut:test \
      .; then
      docker buildx stop
      echo "Successfully deployed test image!"
    else
      docker buildx stop
      echo "Error: Failed to deploy test image!" >&2
      exit 1
    fi
    ;;
  
  production)
    echo "Creating multi-platform images with version $PACKAGE_VERSION"
    npm run fullcheck
    if docker buildx build \
      --push \
      --platform linux/arm64,linux/amd64 \
      --tag brandawg93/peanut:latest \
      --tag brandawg93/peanut:${PACKAGE_VERSION} \
      --tag brandawg93/peanut:test \
      .; then
      docker buildx stop
      echo "Successfully deployed all platforms!"
    else
      docker buildx stop
      echo "Error: Failed to deploy production images!" >&2
      exit 1
    fi
    ;;
  
  *)
    echo "Error: Invalid deploy type '$DEPLOY_TYPE'" >&2
    echo "Usage: $0 [local|test|production]" >&2
    exit 1
    ;;
esac

