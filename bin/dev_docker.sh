#!/usr/bin/env bash

if [ ! -f .env ]; then
  echo "No .env file found. Creating one..."
  bin/create_env.sh
fi

docker-compose -f dev-compose.yml up "$@"
