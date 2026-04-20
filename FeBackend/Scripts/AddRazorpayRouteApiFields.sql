-- =============================================
-- Add Razorpay Route API Fields to Database
-- Run this script in SQL Server Management Studio
-- =============================================

USE [FarmEaseDb]  -- Change to your database name if different
GO

-- Add Razorpay fields to AspNetUsers table (ApplicationUser)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'RazorpayAccountId')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [RazorpayAccountId] NVARCHAR(100) NULL;
    PRINT 'Added RazorpayAccountId column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'RazorpayContactId')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [RazorpayContactId] NVARCHAR(100) NULL;
    PRINT 'Added RazorpayContactId column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'IsPaymentOnboardingComplete')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [IsPaymentOnboardingComplete] BIT NOT NULL DEFAULT 0;
    PRINT 'Added IsPaymentOnboardingComplete column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'PaymentOnboardingCompletedAt')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [PaymentOnboardingCompletedAt] DATETIME2 NULL;
    PRINT 'Added PaymentOnboardingCompletedAt column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'RazorpayFundAccountId')
BEGIN
    ALTER TABLE [AspNetUsers] ADD [RazorpayFundAccountId] NVARCHAR(100) NULL;
    PRINT 'Added RazorpayFundAccountId column';
END
GO

-- Add settlement tracking fields to Payments table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'OwnerAmount')
BEGIN
    ALTER TABLE [Payments] ADD [OwnerAmount] DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added OwnerAmount column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'PlatformFeeAmount')
BEGIN
    ALTER TABLE [Payments] ADD [PlatformFeeAmount] DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Added PlatformFeeAmount column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'RazorpayTransferId')
BEGIN
    ALTER TABLE [Payments] ADD [RazorpayTransferId] NVARCHAR(100) NULL;
    PRINT 'Added RazorpayTransferId column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'SettlementStatus')
BEGIN
    ALTER TABLE [Payments] ADD [SettlementStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending';
    PRINT 'Added SettlementStatus column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'SettledAt')
BEGIN
    ALTER TABLE [Payments] ADD [SettledAt] DATETIME2 NULL;
    PRINT 'Added SettledAt column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Payments') AND name = 'SettlementFailureReason')
BEGIN
    ALTER TABLE [Payments] ADD [SettlementFailureReason] NVARCHAR(500) NULL;
    PRINT 'Added SettlementFailureReason column';
END
GO

-- Create indexes for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Payments_SettlementStatus' AND object_id = OBJECT_ID('Payments'))
BEGIN
    CREATE INDEX [IX_Payments_SettlementStatus] ON [Payments]([SettlementStatus]);
    PRINT 'Created IX_Payments_SettlementStatus index';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_RazorpayAccountId' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    CREATE INDEX [IX_AspNetUsers_RazorpayAccountId] ON [AspNetUsers]([RazorpayAccountId]) WHERE [RazorpayAccountId] IS NOT NULL;
    PRINT 'Created IX_AspNetUsers_RazorpayAccountId index';
END
GO

PRINT 'Migration completed successfully!';
GO
