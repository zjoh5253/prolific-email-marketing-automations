#!/bin/sh
# wait-for-it.sh - Wait for a service to be ready

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z "$host" "$port" 2>/dev/null; do
  echo "Waiting for $host:$port..."
  sleep 1
done

echo "$host:$port is available"
exec $cmd
