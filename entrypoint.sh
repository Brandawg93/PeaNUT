#!/bin/sh

# Set environment variables with defaults
export HOSTNAME=${WEB_HOST:-0.0.0.0}
export PORT=${WEB_PORT:-8080}

# Execute the Node.js server
exec node server.js
