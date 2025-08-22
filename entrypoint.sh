#!/bin/sh

# Set environment variables with defaults
export HOSTNAME=${WEB_HOST:-0.0.0.0}
export PORT=${WEB_PORT:-8080}
export NEXT_PUBLIC_BASE_PATH=${BASE_PATH:-""}

# Execute the Node.js server with tini
exec node server.js
