# My Web App

This repo contains:

- `frontend/`: a React app built with `react-scripts`
- `backend/`: an Express app that also serves the built frontend from `frontend/build`

## Docker deployment

This repo can run as:

- one `app` container for the Express backend + built React frontend
- one `mongo` container for MongoDB

### 1. Create the Docker env file

```bash
cp backend/.env.docker.example backend/.env.docker
```

Then update `backend/.env.docker` with your real values.

For local Docker, keep:

- `MONGO_URI=mongodb://mongo:27017/mywebapp`
- `BASE_URL=http://localhost:5000`
- `CLIENT_URL=http://localhost:5000`
- `CORS_ORIGINS=http://localhost:5000`

If you use Google OAuth, add:

- Authorized JavaScript origin: `http://localhost:5000`
- Authorized redirect URI: `http://localhost:5000/auth/google/callback`

### 2. Build and start the containers

```bash
docker compose up --build
```

Open:

- `http://localhost:5000`

### 3. Run in the background

```bash
docker compose up -d --build
```

### 4. Stop the app

```bash
docker compose down
```

If you also want to remove the MongoDB data volume:

```bash
docker compose down -v
```

## Local run

1. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Create `backend/.env` from `backend/.env.example`.
3. Build the frontend:
   - `cd frontend && npm run build`
4. Start the backend:
   - `cd ../backend && npm start`
5. Open `http://localhost:5000`

## AWS EC2 deployment with Docker

This is the recommended AWS path for this repo:

- run the app on one Ubuntu EC2 instance with Docker
- keep MongoDB in MongoDB Atlas
- expose port `5000` first, then optionally put Nginx or an AWS load balancer in front later

### 1. Launch the instance

- Create an Ubuntu EC2 instance.
- In the EC2 security group, allow:
  - `22` from your IP
  - `5000` from `0.0.0.0/0` for a quick test
  - Optional: `80` and `443` if you later place Nginx in front

### 2. Connect and install software

```bash
ssh -i /path/to/key.pem ubuntu@<your-ec2-public-dns>
cd /home/ubuntu
git clone https://github.com/tanishkaaa-ai/my-web-app.git
cd my-web-app
chmod +x scripts/ec2-docker-bootstrap.sh scripts/ec2-docker-deploy.sh
./scripts/ec2-docker-bootstrap.sh
```

After the install finishes, disconnect and SSH back in once so Docker group permissions apply cleanly.

### 3. Create the AWS env file

If your latest Docker changes are already on GitHub:

```bash
cd /home/ubuntu/my-web-app
git pull origin main
cp backend/.env.aws.example backend/.env.aws
```

If you have not pushed yet, sync the local project to EC2 first from your Mac:

```bash
rsync -av --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'frontend/build' \
  --exclude 'backend/.env' \
  --exclude 'backend/.env.docker' \
  --exclude 'backend/.env.aws' \
  --exclude '*.pem' \
  -e "ssh -i /path/to/key.pem" \
  /path/to/my-web-app/ ubuntu@<your-ec2-public-dns>:/home/ubuntu/my-web-app/
```

Then on EC2:

```bash
cd /home/ubuntu/my-web-app
cp backend/.env.aws.example backend/.env.aws
```

### 4. Fill in production env values

Update `backend/.env.aws` with:

- `MONGO_URI`: your MongoDB Atlas connection string
- `JWT_SECRET` and `SESSION_SECRET`: long random values
- `CLIENT_ID` and `CLIENT_SECRET`: your Google OAuth credentials
- `BASE_URL`: `http://<your-ec2-public-dns>:5000` for a basic app smoke test, or `https://<your-domain>` for Google OAuth
- `CLIENT_URL`: same value as `BASE_URL`
- `CORS_ORIGINS`: same value as `BASE_URL`

Important:

- Add your EC2 public IP to the MongoDB Atlas network allowlist.
- Google OAuth for a public deployment should use an HTTPS domain. Google documents that redirect URIs must use `https` and cannot use raw public IP addresses, except for localhost testing.
- In Google OAuth, add:
  - For local Docker only: `http://localhost:5000` and `http://localhost:5000/auth/google/callback`
  - For AWS/public access: `https://<your-domain>` and `https://<your-domain>/auth/google/callback`
- Rotate any secrets that were previously committed to the repo before deploying publicly.

### 5. Start the app with Docker

```bash
cd /home/ubuntu/my-web-app
SKIP_GIT_PULL=1 ./scripts/ec2-docker-deploy.sh
```

Use `SKIP_GIT_PULL=1` when you synced the code manually instead of pushing to GitHub first. If the code is already pushed, plain `./scripts/ec2-docker-deploy.sh` is fine.

### 6. Test the deployment

Open:

- `http://<your-ec2-public-dns>:5000`

If the page loads but auth fails, check:

- MongoDB Atlas IP allowlist
- Google OAuth redirect URL and HTTPS/domain setup
- Values in `backend/.env.aws`

### 7. Useful Docker commands on EC2

```bash
docker compose -f docker-compose.aws.yml logs -f
docker compose -f docker-compose.aws.yml ps
docker compose -f docker-compose.aws.yml restart
docker compose -f docker-compose.aws.yml down
```

## Recommended next step

Once the app works on port `5000`, put Nginx in front of it and move to a real domain with HTTPS. That will make Google login and cookies much more reliable for production use.
