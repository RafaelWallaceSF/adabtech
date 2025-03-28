
# PayTrack Docker Swarm Deployment with Traefik, Portainer, PostgreSQL and Redis

This document provides instructions for deploying the PayTrack application using Docker Swarm, Traefik, Portainer, PostgreSQL, and Redis.

## Prerequisites

- Docker and Docker Compose installed on your system
- A Docker Swarm cluster initialized
- Basic understanding of Docker Swarm and container orchestration

## System Architecture

The deployment consists of the following services:

1. **frontend**: React application served via Nginx
2. **api**: Node.js Express API server
3. **db**: PostgreSQL database for persistent storage
4. **redis**: Redis for caching and session management
5. **traefik**: Reverse proxy and load balancer
6. **portainer**: Container management UI

## Deployment Steps

### 1. Using Portainer

1. Log in to your Portainer instance
2. Navigate to Stacks
3. Click on "Add stack"
4. Name your stack (e.g., "paytrack")
5. Upload the `docker-compose.yml` file or paste its contents
6. Configure environment variables:
   - `POSTGRES_PASSWORD`: A secure password for PostgreSQL
   - `REGISTRY_URL`: Your Docker registry URL (if using a private registry)
   - `TAG`: Version tag for your images
7. Click "Deploy the stack"

### 2. Using Command Line

1. Run the deployment script:
   ```
   ./deploy-stack.sh
   ```

   This script will:
   - Initialize Docker Swarm if not already done
   - Create necessary networks
   - Generate secure passwords
   - Deploy the stack to Docker Swarm

## Configuration

### Environment Variables

- `POSTGRES_PASSWORD`: Password for PostgreSQL
- `REGISTRY_URL`: Docker registry URL
- `TAG`: Version tag for images
- `REDIS_URL`: Redis connection string (default: redis://redis:6379)

### Volumes

- `postgres_data`: Persistent volume for PostgreSQL data
- `redis_data`: Persistent volume for Redis data
- `portainer_data`: Persistent volume for Portainer data

### Networks

- `traefik-public`: Public-facing network for Traefik
- `paytrack-network`: Internal network for service communication

## Accessing the Services

Once deployed, you can access the services at:

- Frontend: http://app.paytrack.local
- API: http://api.paytrack.local
- Portainer: http://portainer.paytrack.local
- Traefik Dashboard: http://localhost:8080

For local development, add these domains to your `/etc/hosts` file:
```
127.0.0.1 app.paytrack.local api.paytrack.local portainer.paytrack.local
```

## Monitoring and Management

### Using Portainer

Portainer provides a web interface to manage your Docker Swarm cluster:

1. Navigate to http://portainer.paytrack.local
2. Log in with your credentials
3. Use the dashboard to monitor containers, services, and stacks

### Using Docker CLI

Monitor the deployment:
```
docker stack ps paytrack
docker service logs paytrack_frontend
docker service logs paytrack_api
```

## Scaling Services

To scale services:

```
docker service scale paytrack_frontend=3
docker service scale paytrack_api=3
```

Or use Portainer's web interface to adjust the number of replicas.

## Updating the Stack

To update the stack:

1. Make changes to the docker-compose.yml file
2. Run:
   ```
   docker stack deploy -c docker-compose.yml paytrack
   ```
   
Or update through Portainer's web interface.
