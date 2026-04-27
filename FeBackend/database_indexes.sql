-- ============================================
-- FarmEase Performance Indexes
-- Run this in SQL Server Management Studio
-- ============================================

USE FarmEaseDB;
GO

PRINT 'Creating performance indexes...';
GO

-- Users table indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AspNetUsers_Role' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    CREATE INDEX IX_AspNetUsers_Role ON AspNetUsers(Role) WHERE Role IS NOT NULL;
    PRINT 'Created IX_AspNetUsers_Role';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AspNetUsers_CreatedAt' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    CREATE INDEX IX_AspNetUsers_CreatedAt ON AspNetUsers(CreatedAt);
    PRINT 'Created IX_AspNetUsers_CreatedAt';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AspNetUsers_Location' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    CREATE INDEX IX_AspNetUsers_Location ON AspNetUsers(Location) WHERE Location IS NOT NULL;
    PRINT 'Created IX_AspNetUsers_Location';
END
GO

-- Machines table indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_Status' AND object_id = OBJECT_ID('Machines'))
BEGIN
    CREATE INDEX IX_Machines_Status ON Machines(Status) WHERE Status IS NOT NULL;
    PRINT 'Created IX_Machines_Status';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_OwnerId' AND object_id = OBJECT_ID('Machines'))
BEGIN
    CREATE INDEX IX_Machines_OwnerId ON Machines(OwnerId) WHERE OwnerId IS NOT NULL;
    PRINT 'Created IX_Machines_OwnerId';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_CreatedAt' AND object_id = OBJECT_ID('Machines'))
BEGIN
    CREATE INDEX IX_Machines_CreatedAt ON Machines(CreatedAt);
    PRINT 'Created IX_Machines_CreatedAt';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_Type' AND object_id = OBJECT_ID('Machines'))
BEGIN
    CREATE INDEX IX_Machines_Type ON Machines(Type) WHERE Type IS NOT NULL;
    PRINT 'Created IX_Machines_Type';
END
GO

-- Bookings table indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_Status' AND object_id = OBJECT_ID('Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_Status ON Bookings(Status) WHERE Status IS NOT NULL;
    PRINT 'Created IX_Bookings_Status';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_FarmerId' AND object_id = OBJECT_ID('Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_FarmerId ON Bookings(FarmerId) WHERE FarmerId IS NOT NULL;
    PRINT 'Created IX_Bookings_FarmerId';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_MachineId' AND object_id = OBJECT_ID('Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_MachineId ON Bookings(MachineId);
    PRINT 'Created IX_Bookings_MachineId';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_CreatedAt' AND object_id = OBJECT_ID('Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_CreatedAt ON Bookings(CreatedAt);
    PRINT 'Created IX_Bookings_CreatedAt';
END
GO

-- Composite index for completed bookings analytics
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bookings_Status_CreatedAt' AND object_id = OBJECT_ID('Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_Status_CreatedAt ON Bookings(Status, CreatedAt) WHERE Status = 'Completed';
    PRINT 'Created IX_Bookings_Status_CreatedAt';
END
GO

-- Reviews table composite index
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_MachineId_Rating' AND object_id = OBJECT_ID('Reviews'))
BEGIN
    CREATE INDEX IX_Reviews_MachineId_Rating ON Reviews(MachineId, Rating) WHERE Rating > 0;
    PRINT 'Created IX_Reviews_MachineId_Rating';
END
GO

PRINT 'All performance indexes created successfully!';
GO
