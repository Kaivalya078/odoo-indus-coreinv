@echo off
echo Starting CoreINV Services...

echo Starting Backend API...
start "CoreINV Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo Starting Frontend Dev Server...
start "CoreINV Frontend" cmd /k "cd frontend && npm run dev"

echo Both services are starting up in separate windows!
