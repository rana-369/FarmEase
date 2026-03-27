-- Run this script in SQL Server Management Studio or via sqlcmd
USE FarmEaseDB;
GO

-- Check if columns exist and add them if not
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorMethod')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorMethod NVARCHAR(20) NULL;
    PRINT 'Added TwoFactorMethod column';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorSecret')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorSecret NVARCHAR(255) NULL;
    PRINT 'Added TwoFactorSecret column';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorBackupCodes')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorBackupCodes NVARCHAR(MAX) NULL;
    PRINT 'Added TwoFactorBackupCodes column';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorOtp')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorOtp NVARCHAR(10) NULL;
    PRINT 'Added TwoFactorOtp column';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorOtpExpiry')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorOtpExpiry DATETIME2 NULL;
    PRINT 'Added TwoFactorOtpExpiry column';
END

-- Verify columns
SELECT name AS ColumnName, TYPE_NAME(user_type_id) AS DataType
FROM sys.columns 
WHERE object_id = OBJECT_ID('AspNetUsers') 
AND name LIKE 'TwoFactor%';

PRINT '2FA columns setup complete!';
GO
