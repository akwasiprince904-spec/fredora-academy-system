## How to Access Fredora's Academy Management System (Local)

### Prerequisites
- Node.js 16+
- PowerShell (Windows)

### 1) Start the Backend (API)
Run these commands in PowerShell:

```powershell
cd "C:\Users\dorissarpongaboagye\Downloads\webindividual\web group work\fredora-academy-system\web-app\backend"
npm install
npm run migrate
npm run seed
npm run dev
```

- Health check: `http://localhost:5000/health`
- Database: SQLite file at `web-app/backend/database.sqlite`

### 2) Start the Frontend (Web UI)
Open a new PowerShell window and run:

```powershell
cd "C:\Users\dorissarpongaboagye\Downloads\webindividual\web group work\fredora-academy-system\web-app\frontend"
npm install
npm run dev   
```

### 3) Open the Interface
- UI: `http://localhost:3000`
- Login page: `http://localhost:3000/login`

### Demo Credentials
- Admin: `admin@fredora.com` / `admin123`
- Teacher: `teacher@fredora.com` / `teacher123`

### Troubleshooting
- If the frontend says port 3000 is in use, allow it to use another port, or stop the other app using that port.
- If migrations fail, ensure you are in: `web group work/fredora-academy-system/web-app/backend`
- Reset database:

```powershell
cd "C:\Users\dorissarpongaboagye\Downloads\webindividual\web group work\fredora-academy-system\web-app\backend"
npm run db:reset
```


