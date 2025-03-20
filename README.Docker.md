
# PayTrack Docker Swarm Deployment

This document provides instructions for deploying the PayTrack application using Docker Swarm and Portainer.

## Prerequisites

- Docker and Docker Compose installed on your system
- A Docker Swarm cluster initialized
- Portainer installed on your Docker Swarm cluster

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

1. Initialize Docker Swarm if not already done:
   ```
   docker swarm init
   ```

2. Deploy the stack:
   ```
   ./deploy.sh
   ```

## Configuration

The deployment consists of three main services:

1. **frontend**: The React application
2. **api**: A Node.js API server
3. **db**: PostgreSQL database

### Environment Variables

- `POSTGRES_PASSWORD`: Password for PostgreSQL
- `REGISTRY_URL`: Docker registry URL
- `TAG`: Version tag for images

### Volumes

- `postgres_data`: Persistent volume for PostgreSQL data

### Networks

- `paytrack-network`: Overlay network for service communication

## Monitoring

You can monitor the deployment through Portainer or using Docker CLI:

```
docker stack ps paytrack
docker service logs paytrack_frontend
docker service logs paytrack_api
docker service logs paytrack_db
```

## Scaling

To scale services:

```
docker service scale paytrack_frontend=3
docker service scale paytrack_api=3
```

Or use Portainer's web interface to adjust the number of replicas.
