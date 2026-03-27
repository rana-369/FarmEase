USE FarmEaseDB;
GO

-- Add 2FA columns if they don't exist
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorMethod')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorMethod NVARCHAR(20) NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorSecret')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorSecret NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorBackupCodes')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorBackupCodes NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorOtp')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorOtp NVARCHAR(10) NULL;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'TwoFactorOtpExpiry')
BEGIN
    ALTER TABLE AspNetUsers ADD TwoFactorOtpExpiry DATETIME2 NULL;
END

-- Show all 2FA columns
SELECT name AS ColumnName, TYPE_NAME(user_type_id) AS DataType, max_length, is_nullable
FROM sys.columns 
WHERE object_id = OBJECT_ID('AspNetUsers') 
AND name LIKE 'TwoFactor%';
GO
