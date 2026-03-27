@echo off
echo Adding 2FA columns to database...
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='TwoFactorMethod') ALTER TABLE AspNetUsers ADD TwoFactorMethod NVARCHAR(20) NULL;"
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='TwoFactorSecret') ALTER TABLE AspNetUsers ADD TwoFactorSecret NVARCHAR(255) NULL;"
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='TwoFactorBackupCodes') ALTER TABLE AspNetUsers ADD TwoFactorBackupCodes NVARCHAR(MAX) NULL;"
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='TwoFactorOtp') ALTER TABLE AspNetUsers ADD TwoFactorOtp NVARCHAR(10) NULL;"
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AspNetUsers' AND COLUMN_NAME='TwoFactorOtpExpiry') ALTER TABLE AspNetUsers ADD TwoFactorOtpExpiry DATETIME2 NULL;"
echo.
echo Verifying columns...
sqlcmd -S localhost -d FarmEaseDB -E -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AspNetUsers' AND COLUMN_NAME LIKE 'TwoFactor%'" -W
echo.
echo Starting backend server...
cd FarmEase
dotnet run --urls "https://localhost:7284"
