@echo off
echo 🚀 Starting DukanLink...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo ✅ Starting development server...
echo.
echo Open your browser at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
pause
