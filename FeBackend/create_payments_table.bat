@echo off
echo Creating Payments table in FarmEaseDB...
sqlcmd -S localhost -d FarmEaseDB -E -Q "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Payments') BEGIN CREATE TABLE Payments (Id INT IDENTITY(1,1) PRIMARY KEY, BookingId INT NOT NULL, RazorpayOrderId NVARCHAR(MAX) NOT NULL, RazorpayPaymentId NVARCHAR(MAX) NOT NULL, RazorpaySignature NVARCHAR(MAX) NOT NULL, Amount DECIMAL(18,2) NOT NULL, Currency NVARCHAR(MAX) NOT NULL DEFAULT 'INR', Status NVARCHAR(MAX) NOT NULL DEFAULT 'Pending', RefundAmount DECIMAL(18,2) NULL, RefundId NVARCHAR(MAX) NULL, RefundedAt DATETIME2 NULL, RefundReason NVARCHAR(MAX) NULL, CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(), CONSTRAINT FK_Payments_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE); CREATE INDEX IX_Payments_BookingId ON Payments(BookingId); SELECT 'Payments table created successfully!' AS Result; END ELSE SELECT 'Payments table already exists' AS Result;"
echo.
echo Verifying table exists...
sqlcmd -S localhost -d FarmEaseDB -E -Q "SELECT name AS TableName FROM sys.tables WHERE name = 'Payments'"
pause
