-- Create ProcessLogs table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='ProcessLogs')
BEGIN
    CREATE TABLE [ProcessLogs] (
        [Id] int NOT NULL IDENTITY(1,1),
        [UploadId] nvarchar(450) NOT NULL,
        [Timestamp] datetime2 NOT NULL,
        [Level] nvarchar(50) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Details] nvarchar(max) NULL,
        CONSTRAINT [PK_ProcessLogs] PRIMARY KEY ([Id])
    );

    -- Add index on UploadId for faster queries
    CREATE INDEX [IX_ProcessLogs_UploadId] ON [ProcessLogs] ([UploadId]);

    PRINT 'ProcessLogs table created successfully';
END
ELSE
BEGIN
    PRINT 'ProcessLogs table already exists';
END
