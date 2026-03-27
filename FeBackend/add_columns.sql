USE FarmEaseDB;
GO

-- Check if columns exist and add them if they don't
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Machines' AND COLUMN_NAME = 'Location')
BEGIN
    ALTER TABLE Machines ADD Location NVARCHAR(MAX) NULL;
    PRINT 'Location column added';
END
ELSE
BEGIN
    PRINT 'Location column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Machines' AND COLUMN_NAME = 'Description')
BEGIN
    ALTER TABLE Machines ADD Description NVARCHAR(MAX) NULL;
    PRINT 'Description column added';
END
ELSE
BEGIN
    PRINT 'Description column already exists';
END
GO

-- Show all columns
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Machines' ORDER BY ORDINAL_POSITION;
GO
