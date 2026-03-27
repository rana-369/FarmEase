-- Migration: Add Two-Factor Authentication Columns
-- Run this script to add 2FA support to your database

-- Add 2FA columns to AspNetUsers table
ALTER TABLE AspNetUsers ADD TwoFactorEnabled BIT DEFAULT 0;
ALTER TABLE AspNetUsers ADD TwoFactorMethod NVARCHAR(20) DEFAULT 'email';
ALTER TABLE AspNetUsers ADD TwoFactorSecret NVARCHAR(255) NULL;
ALTER TABLE AspNetUsers ADD TwoFactorBackupCodes NVARCHAR(MAX) NULL;
ALTER TABLE AspNetUsers ADD TwoFactorOtp NVARCHAR(10) NULL;
ALTER TABLE AspNetUsers ADD TwoFactorOtpExpiry DATETIME2 NULL;

-- Verify columns were added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_NAME = 'AspNetUsers' 
    AND COLUMN_NAME IN (
        'TwoFactorEnabled', 
        'TwoFactorMethod', 
        'TwoFactorSecret', 
        'TwoFactorBackupCodes',
        'TwoFactorOtp',
        'TwoFactorOtpExpiry'
    );

PRINT '2FA columns added successfully!';
