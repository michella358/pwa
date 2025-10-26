@echo off
echo Starting MongoDB...
echo.

REM Try to start MongoDB service first
echo Attempting to start MongoDB service...
net start MongoDB 2>nul
if %errorlevel% == 0 (
    echo ✅ MongoDB service started successfully!
    echo 🌐 MongoDB is running on: mongodb://localhost:27017
    echo.
    echo You can now run: node create-admin.js
    pause
    exit /b 0
)

echo ⚠️  MongoDB service not found or failed to start.
echo.
echo Trying to start MongoDB manually...
echo Creating data directory if it doesn't exist...
if not exist "C:\data\db" mkdir "C:\data\db"

echo.
echo Starting MongoDB daemon...
echo 📍 Data directory: C:\data\db
echo 🌐 MongoDB will run on: mongodb://localhost:27017
echo.
echo ⚠️  Keep this window open while using MongoDB
echo ⚠️  Press Ctrl+C to stop MongoDB
echo.

mongod --dbpath "C:\data\db"

pause