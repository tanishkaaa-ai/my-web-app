# My Web App

This repo contains:

- `frontend/`: a React app built with `react-scripts`
- `backend/`: an Express app that also serves the built frontend from `frontend/build`

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

## AWS EC2 deployment

This app is simplest to run on one EC2 instance with Node.js and PM2.

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
chmod +x scripts/ec2-bootstrap.sh scripts/ec2-deploy.sh
./scripts/ec2-bootstrap.sh
```

### 3. Copy the repo and install packages

```bash
cd /home/ubuntu/my-web-app
git pull origin main
npm --prefix backend install
npm --prefix frontend install
npm --prefix frontend run build
cd backend
cp .env.example .env
```

### 4. Fill in production env values

Update `backend/.env` with:

- `MONGO_URI`: your MongoDB Atlas connection string
- `JWT_SECRET` and `SESSION_SECRET`: long random values
- `CLIENT_ID` and `CLIENT_SECRET`: your Google OAuth credentials
- `BASE_URL`: `http://<your-ec2-public-dns>:5000` for the first test
- `CLIENT_URL`: same value as `BASE_URL`
- `CORS_ORIGINS`: same value as `BASE_URL`

Important:

- Add your EC2 public IP to the MongoDB Atlas network allowlist.
- In Google OAuth, add:
  - Authorized JavaScript origin: `http://<your-ec2-public-dns>:5000`
  - Authorized redirect URI: `http://<your-ec2-public-dns>:5000/auth/google/callback`
- Rotate any secrets that were previously committed to the repo before deploying publicly.

### 5. Start the app with PM2

```bash
cd /home/ubuntu/my-web-app
./scripts/ec2-deploy.sh
pm2 startup
```

### 6. Test the deployment

Open:

- `http://<your-ec2-public-dns>:5000`

If the page loads but auth fails, check:

- MongoDB Atlas IP allowlist
- Google OAuth redirect URL
- Values in `backend/.env`

## Recommended next step

Once the app works on port `5000`, put Nginx in front of it and move to a real domain with HTTPS. That will make Google login and cookies much more reliable for production use.
