
#!/bin/bash

# Script to deploy the PayTrack application to Docker Swarm

# Set environment variables
export TAG=$(date +%Y%m%d%H%M%S)
export POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Save environment variables to .env file for future reference
echo "TAG=$TAG" > .env
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env

# Build and push images
docker-compose build
docker-compose push

# Deploy the stack to Docker Swarm
docker stack deploy -c docker-compose.yml paytrack

echo "PayTrack deployed with tag: $TAG"
echo "PostgreSQL password saved to .env file"
