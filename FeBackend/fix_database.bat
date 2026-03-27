@echo off
echo Adding Location and Description columns to Machines table...
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF COL_LENGTH('Machines', 'Location') IS NULL ALTER TABLE Machines ADD Location NVARCHAR(MAX) NULL;"
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF COL_LENGTH('Machines', 'Description') IS NULL ALTER TABLE Machines ADD Description NVARCHAR(MAX) NULL;"
echo.
echo Verifying columns...
sqlcmd -S localhost -d FarmEaseDB -E -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Machines' ORDER BY ORDINAL_POSITION;" -w 200
echo.
pause
