# Fredora Academy - Complete Startup Commands

## Step 1: Start the Backend Server

**Open PowerShell Window #1 and run these commands:**

```powershell
# Navigate to backend directory
cd "C:\Users\dorissarpongaboagye\Downloads\webindividual\web group work\fredora-academy-system\web-app\backend"

# Install dependencies (if needed)
npm install

# Run database migrations and seeds
npm run migrate
npm run seed

# Start the backend server
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server.js`
Fredora Academy API server running on port 5000
```

**Keep this PowerShell window open** - the backend will continue running here.

## Step 2: Start the Frontend

**Open PowerShell Window #2 and run these commands:**

```powershell
# Navigate to frontend directory
cd "C:\Users\dorissarpongaboagye\Downloads\webindividual\web group work\fredora-academy-system\web-app\frontend"

# Install dependencies (if needed)
npm install

# Start the frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.4.10  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 3: Access the Interface

Open your web browser and go to: **http://localhost:3000**

## Login Credentials

### Admin Login:
- **Email:** admin@fredora.com
- **Password:** admin123

### Teacher Login:
- **Email:** teacher@fredora.com
- **Password:** teacher123

## Troubleshooting

If you get errors:

1. **"react-scripts not recognized"** - Run `npm install` in the frontend directory
2. **"Port 5000 already in use"** - Close the previous backend process first
3. **"Cannot find module"** - Run `npm install` in the respective directory
4. **Login fails** - Make sure both backend and frontend are running

## Quick Test

- Backend health check: http://localhost:5000/health
- Frontend: http://localhost:3000
