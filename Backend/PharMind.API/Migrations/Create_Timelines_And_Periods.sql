-- Crear tabla Timelines
CREATE TABLE [dbo].[Timelines](
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [Nombre] NVARCHAR(100) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [Color] NVARCHAR(20) NULL,
    [Anio] INT NOT NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [EsDefault] BIT NOT NULL DEFAULT 0,
    [FechaCreacion] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(MAX) NULL,
    [FechaModificacion] DATETIME2(7) NULL,
    [ModificadoPor] NVARCHAR(MAX) NULL,
    [Status] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Timelines] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- Crear tabla Periods
CREATE TABLE [dbo].[Periods](
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [TimelineId] UNIQUEIDENTIFIER NOT NULL,
    [Nombre] NVARCHAR(100) NOT NULL,
    [Codigo] NVARCHAR(20) NULL,
    [Orden] INT NOT NULL,
    [FechaInicio] DATETIME2(7) NOT NULL,
    [FechaFin] DATETIME2(7) NOT NULL,
    [Color] NVARCHAR(20) NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [FechaCreacion] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(MAX) NULL,
    [FechaModificacion] DATETIME2(7) NULL,
    [ModificadoPor] NVARCHAR(MAX) NULL,
    [Status] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Periods] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Periods_Timelines_TimelineId] FOREIGN KEY ([TimelineId]) REFERENCES [dbo].[Timelines] ([Id]) ON DELETE CASCADE
);

-- Crear índice en TimelineId de Periods
CREATE INDEX [IX_Periods_TimelineId] ON [dbo].[Periods] ([TimelineId]);

-- Agregar columna TimelineId a tabla Agentes
ALTER TABLE [dbo].[Agentes]
ADD [TimelineId] UNIQUEIDENTIFIER NULL;

-- Crear Foreign Key de Agentes a Timelines
ALTER TABLE [dbo].[Agentes]
ADD CONSTRAINT [FK_Agentes_Timelines_TimelineId] FOREIGN KEY ([TimelineId]) REFERENCES [dbo].[Timelines] ([Id]);

-- Crear índice en TimelineId de Agentes
CREATE INDEX [IX_Agentes_TimelineId] ON [dbo].[Agentes] ([TimelineId]);

-- Insertar un timeline por defecto
INSERT INTO [dbo].[Timelines] ([Id], [Nombre], [Descripcion], [Color], [Anio], [Activo], [EsDefault], [Status])
VALUES
    (NEWID(), 'Timeline Estándar 2025', 'Timeline con períodos mensuales estándar', '#4CAF50', 2025, 1, 1, 1);

-- Obtener el ID del timeline creado
DECLARE @TimelineId UNIQUEIDENTIFIER = (SELECT TOP 1 [Id] FROM [dbo].[Timelines] WHERE [EsDefault] = 1);

-- Insertar períodos mensuales para el timeline por defecto
INSERT INTO [dbo].[Periods] ([Id], [TimelineId], [Nombre], [Codigo], [Orden], [FechaInicio], [FechaFin], [Color], [Activo], [Status])
VALUES
    (NEWID(), @TimelineId, 'Enero', 'ENE', 1, '2025-01-01', '2025-01-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Febrero', 'FEB', 2, '2025-02-01', '2025-02-28', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Marzo', 'MAR', 3, '2025-03-01', '2025-03-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Abril', 'ABR', 4, '2025-04-01', '2025-04-30', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Mayo', 'MAY', 5, '2025-05-01', '2025-05-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Junio', 'JUN', 6, '2025-06-01', '2025-06-30', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Julio', 'JUL', 7, '2025-07-01', '2025-07-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Agosto', 'AGO', 8, '2025-08-01', '2025-08-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Septiembre', 'SEP', 9, '2025-09-01', '2025-09-30', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Octubre', 'OCT', 10, '2025-10-01', '2025-10-31', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Noviembre', 'NOV', 11, '2025-11-01', '2025-11-30', '#2196F3', 1, 1),
    (NEWID(), @TimelineId, 'Diciembre', 'DIC', 12, '2025-12-01', '2025-12-31', '#2196F3', 1, 1);

GO
