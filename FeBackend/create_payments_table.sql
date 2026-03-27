-- Create Payments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Payments')
BEGIN
    CREATE TABLE Payments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        BookingId INT NOT NULL,
        RazorpayOrderId NVARCHAR(MAX) NOT NULL,
        RazorpayPaymentId NVARCHAR(MAX) NOT NULL,
        RazorpaySignature NVARCHAR(MAX) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Currency NVARCHAR(MAX) NOT NULL DEFAULT 'INR',
        Status NVARCHAR(MAX) NOT NULL DEFAULT 'Pending',
        RefundAmount DECIMAL(18,2) NULL,
        RefundId NVARCHAR(MAX) NULL,
        RefundedAt DATETIME2 NULL,
        RefundReason NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Payments_Bookings_BookingId FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
    
    PRINT 'Payments table created successfully';
END
ELSE
BEGIN
    PRINT 'Payments table already exists';
END
GO

-- Verify table exists
SELECT name AS TableName FROM sys.tables WHERE name = 'Payments';
GO

-- Show table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Payments' ORDER BY ORDINAL_POSITION;
GO
