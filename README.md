# backend-docker

A simple REST API built with **Node.js** and **Express**, containerized with **Docker**, and automated with a **Jenkins** CI/CD pipeline.

---

## Project Structure

```
backend-docker/
├── index.js              # Express server entry point
├── package.json          # Node.js dependencies & scripts
├── Dockerfile            # Multi-stage Docker build
├── .dockerignore         # Files excluded from Docker image
├── docker-compose.yml    # Docker Compose configuration
├── Jenkinsfile           # Jenkins declarative pipeline
├── .gitignore            # Files excluded from Git
└── README.md             # This file
```

---

## API Endpoints

| Method | Endpoint      | Description          |
|--------|---------------|----------------------|
| GET    | `/`           | Welcome message      |
| GET    | `/health`     | Health check         |
| GET    | `/api/items`  | Returns list of items|

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode (auto-restart)
npm run dev
```

Server runs at **http://localhost:3000**

---

## Docker

### What was done

- **Multi-stage Dockerfile** — uses a `builder` stage to install dependencies and a lean `production` stage to run the app, keeping the final image small.
- **Non-root user** — a dedicated `appuser` is created inside the container for security.
- **HEALTHCHECK** — Docker automatically checks `/health` every 30 seconds to monitor container status.
- **`.dockerignore`** — excludes `node_modules`, `.env`, logs, `.git`, and other unnecessary files from the image to keep it clean and fast to build.
- **`docker-compose.yml`** — one-command local setup with port mapping, environment variables, and health check configured.

### Build & Run

```bash
# Build the image
docker build -t backend-docker .

# Run the container (port 3005 on host → 3000 in container)
docker run -d -p 3005:3000 --name backend-docker backend-docker

# Or use Docker Compose
docker compose up -d
```

### Useful Docker commands

```bash
# View running containers
docker ps

# View container logs
docker logs backend-docker

# Stop the container
docker stop backend-docker

# Remove the container
docker rm backend-docker
```

---

## Jenkins

### What was done

- **Declarative pipeline** (`Jenkinsfile`) with the following stages:

  | Stage | Description |
  |---|---|
  | **Checkout** | Pulls the latest code from Git |
  | **Install Dependencies** | Runs `npm ci --only=production` |
  | **Test** | Runs `npm test` |
  | **Build Docker Image** | Builds and tags the image as `backend-docker:<BUILD_NUMBER>` and `latest` |
  | **Push to Registry** | Pushes image to Docker Hub / registry *(skipped if `REGISTRY` is empty)* |
  | **Deploy** | Stops the old container and starts a new one automatically |

- **Remote trigger support** — builds can be triggered remotely via URL:
  ```
  http://JENKINS_URL/job/backend-docker/build?token=BACKEND_DOCKER_TOKEN
  ```
- **Generic Webhook Trigger** — configured for webhook-based automation from GitHub/GitLab.
- **Post actions** — notifies on success/failure and prunes dangling Docker images after every build.
- **Build retention** — keeps only the last 10 builds to save disk space.
- **Timeout** — pipeline aborts automatically if it runs longer than 20 minutes.

### Jenkins Setup

1. Run Jenkins:
   ```bash
   docker run -d \
     --name jenkins \
     -p 8080:8080 -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     jenkins/jenkins:lts-jdk17
   ```

2. Get the unlock password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. Open **http://localhost:8080** and complete setup.

4. Install plugins: **Docker Pipeline**, **Generic Webhook Trigger**.

5. Create a **Pipeline** job → SCM: Git → Script Path: `Jenkinsfile`.

6. Enable **"Trigger builds remotely"** → Token: `BACKEND_DOCKER_TOKEN`.

### Push to Docker Hub (optional)

Set `REGISTRY` in `Jenkinsfile`:
```groovy
REGISTRY = 'docker.io/your-dockerhub-username'
```

Add a Jenkins credential with ID `docker-registry-credentials` (username + password).

---

## Environment Variables

| Variable    | Default      | Description              |
|-------------|--------------|--------------------------|
| `PORT`      | `3000`       | Port the server listens on |
| `NODE_ENV`  | `production` | Node environment          |
