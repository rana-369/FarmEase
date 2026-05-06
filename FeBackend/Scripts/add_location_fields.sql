-- FarmEase Location Fields Migration
-- Run this script in SQL Server Management Studio or your database tool

USE [FarmEaseDb]; -- Replace with your actual database name if different
GO

-- Add location columns to Machines table
ALTER TABLE [Machines] ADD [Latitude] FLOAT NULL;
ALTER TABLE [Machines] ADD [Longitude] FLOAT NULL;
ALTER TABLE [Machines] ADD [City] NVARCHAR(100) NULL;
ALTER TABLE [Machines] ADD [State] NVARCHAR(100) NULL;
ALTER TABLE [Machines] ADD [Pincode] NVARCHAR(20) NULL;
GO

-- Add indexes for efficient location-based queries
CREATE INDEX [IX_Machines_City] ON [Machines]([City]);
CREATE INDEX [IX_Machines_Latitude_Longitude] ON [Machines]([Latitude], [Longitude]);
GO

-- Optional: Update existing machines with sample coordinates for testing
-- These are sample coordinates in Punjab/Haryana region (India's agricultural belt)
-- Uncomment and modify as needed

/*
-- Example: Update machines with location based on their Location field
UPDATE [Machines] SET 
    Latitude = 30.7333,
    Longitude = 76.7794,
    City = 'Chandigarh',
    State = 'Punjab'
WHERE Location LIKE '%Chandigarh%' AND Latitude IS NULL;

UPDATE [Machines] SET 
    Latitude = 30.3692,
    Longitude = 76.7875,
    City = 'Patiala',
    State = 'Punjab'
WHERE Location LIKE '%Patiala%' AND Latitude IS NULL;

UPDATE [Machines] SET 
    Latitude = 29.0588,
    Longitude = 76.1305,
    City = 'Hisar',
    State = 'Haryana'
WHERE Location LIKE '%Hisar%' AND Latitude IS NULL;

UPDATE [Machines] SET 
    Latitude = 30.9000,
    Longitude = 75.8500,
    City = 'Ludhiana',
    State = 'Punjab'
WHERE Location LIKE '%Ludhiana%' AND Latitude IS NULL;
*/

PRINT 'Migration completed successfully!';
PRINT 'Location columns added to Machines table.';
GO
