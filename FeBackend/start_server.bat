@echo off
echo ========================================
echo Starting FarmEase Backend Server
echo ========================================
echo.

cd /d C:\Users\asus\OneDrive\Desktop\FEBackend\FarmEase

echo Building project...
dotnet build --configuration Release
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting server on https://localhost:7284
echo Press Ctrl+C to stop the server
echo.

dotnet run --urls "https://localhost:7284" --configuration Release
