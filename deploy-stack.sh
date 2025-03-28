
#!/bin/bash

# Script to deploy the PayTrack application to Docker Swarm with Traefik, Portainer, PostgreSQL and Redis

# Make sure Docker Swarm is initialized
if ! docker info | grep -q "Swarm: active"; then
  echo "Initializing Docker Swarm..."
  docker swarm init
fi

# Create traefik-public network if it doesn't exist
if ! docker network ls | grep -q traefik-public; then
  echo "Creating traefik-public network..."
  docker network create --driver=overlay --attachable traefik-public
fi

# Set environment variables
export TAG=$(date +%Y%m%d%H%M%S)
export POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Save environment variables to .env file for future reference
echo "TAG=$TAG" > .env
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env

# Deploy the stack to Docker Swarm
docker stack deploy -c docker-compose.yml paytrack

echo "PayTrack deployed with tag: $TAG"
echo "PostgreSQL password saved to .env file"
echo ""
echo "Access your services at:"
echo "- Frontend: http://app.paytrack.local"
echo "- API: http://api.paytrack.local"
echo "- Portainer: http://portainer.paytrack.local"
echo "- Traefik Dashboard: http://localhost:8080"
echo ""
echo "Note: Add these domains to your /etc/hosts file for local development:"
echo "127.0.0.1 app.paytrack.local api.paytrack.local portainer.paytrack.local"
