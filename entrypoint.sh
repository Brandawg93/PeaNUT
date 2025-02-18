#!/bin/sh

# Generate new AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
    export AUTH_SECRET=$(npx --yes auth secret)
    echo "Generated new AUTH_SECRET"
fi

# Execute the main command (npm start)
exec "$@" 
