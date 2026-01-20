#!/bin/sh
set -e

# Check if the application is responding
wget --no-verbose --tries=1 --spider http://localhost:${PORT:-4000}/health || exit 1
