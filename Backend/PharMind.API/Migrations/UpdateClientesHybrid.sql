-- =============================================
-- Script: Actualizar tabla Clientes para soporte híbrido
-- Descripción: Agrega columnas para TipoClienteId, EntidadDinamicaId, Nombre y Apellido
-- =============================================

-- 1. Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Clientes' AND COLUMN_NAME = 'TipoClienteId')
BEGIN
    -- Agregar columna TipoClienteId (temporalmente nullable)
    ALTER TABLE [Clientes]
    ADD [TipoClienteId] NVARCHAR(450) NULL;

    PRINT 'Columna TipoClienteId agregada';
END
ELSE
BEGIN
    PRINT 'Columna TipoClienteId ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Clientes' AND COLUMN_NAME = 'EntidadDinamicaId')
BEGIN
    -- Agregar columna EntidadDinamicaId
    ALTER TABLE [Clientes]
    ADD [EntidadDinamicaId] NVARCHAR(450) NULL;

    PRINT 'Columna EntidadDinamicaId agregada';
END
ELSE
BEGIN
    PRINT 'Columna EntidadDinamicaId ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Clientes' AND COLUMN_NAME = 'Nombre')
BEGIN
    -- Agregar columna Nombre (temporalmente nullable)
    ALTER TABLE [Clientes]
    ADD [Nombre] NVARCHAR(200) NULL;

    PRINT 'Columna Nombre agregada';
END
ELSE
BEGIN
    PRINT 'Columna Nombre ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Clientes' AND COLUMN_NAME = 'Apellido')
BEGIN
    -- Agregar columna Apellido
    ALTER TABLE [Clientes]
    ADD [Apellido] NVARCHAR(200) NULL;

    PRINT 'Columna Apellido agregada';
END
ELSE
BEGIN
    PRINT 'Columna Apellido ya existe';
END

GO

-- 2. Crear un EsquemaPersonalizado por defecto para tipos de cliente existentes
DECLARE @DefaultTipoClienteId NVARCHAR(450) = NEWID();

-- Verificar si ya existe un esquema por defecto para Cliente
IF NOT EXISTS (SELECT * FROM [EsquemasPersonalizados] WHERE [EntidadTipo] = 'Cliente' AND [SubTipo] = 'General')
BEGIN
    INSERT INTO [EsquemasPersonalizados] (
        [Id], [Nombre], [Descripcion], [EntidadTipo], [SubTipo],
        [Schema], [Version], [Icono], [Color], [Activo], [Orden],
        [FechaCreacion], [CreadoPor], [Status]
    )
    VALUES (
        @DefaultTipoClienteId,
        'Cliente General',
        'Tipo de cliente por defecto para migración',
        'Cliente',
        'General',
        '{"campos":[]}',
        1,
        'person',
        '#10B981',
        1,
        0,
        GETDATE(),
        'System',
        0
    );

    PRINT 'EsquemaPersonalizado por defecto creado para Cliente';
END
ELSE
BEGIN
    -- Obtener el ID del esquema existente
    SELECT @DefaultTipoClienteId = [Id]
    FROM [EsquemasPersonalizados]
    WHERE [EntidadTipo] = 'Cliente' AND [SubTipo] = 'General';

    PRINT 'Usando EsquemaPersonalizado existente para Cliente';
END

GO

-- 3. Migrar datos existentes
-- Actualizar TipoClienteId con el valor por defecto para registros existentes
UPDATE [Clientes]
SET [TipoClienteId] = (
    SELECT TOP 1 [Id]
    FROM [EsquemasPersonalizados]
    WHERE [EntidadTipo] = 'Cliente' AND [SubTipo] = 'General'
)
WHERE [TipoClienteId] IS NULL;

-- Actualizar Nombre basándose en RazonSocial para registros existentes
UPDATE [Clientes]
SET [Nombre] =
    CASE
        WHEN CHARINDEX(' ', [RazonSocial]) > 0
        THEN LEFT([RazonSocial], CHARINDEX(' ', [RazonSocial]) - 1)
        ELSE [RazonSocial]
    END
WHERE [Nombre] IS NULL;

-- Actualizar Apellido basándose en RazonSocial para registros existentes (si hay espacio)
UPDATE [Clientes]
SET [Apellido] =
    CASE
        WHEN CHARINDEX(' ', [RazonSocial]) > 0
        THEN SUBSTRING([RazonSocial], CHARINDEX(' ', [RazonSocial]) + 1, LEN([RazonSocial]))
        ELSE NULL
    END
WHERE [Apellido] IS NULL AND CHARINDEX(' ', [RazonSocial]) > 0;

PRINT 'Datos migrados a las nuevas columnas';

GO

-- 4. Hacer las columnas NOT NULL donde corresponda
-- Primero verificar que no hay valores NULL
IF NOT EXISTS (SELECT * FROM [Clientes] WHERE [TipoClienteId] IS NULL)
BEGIN
    ALTER TABLE [Clientes]
    ALTER COLUMN [TipoClienteId] NVARCHAR(450) NOT NULL;

    PRINT 'Columna TipoClienteId configurada como NOT NULL';
END

IF NOT EXISTS (SELECT * FROM [Clientes] WHERE [Nombre] IS NULL)
BEGIN
    ALTER TABLE [Clientes]
    ALTER COLUMN [Nombre] NVARCHAR(200) NOT NULL;

    PRINT 'Columna Nombre configurada como NOT NULL';
END

GO

-- 5. Crear Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_EsquemasPersonalizados_TipoClienteId')
BEGIN
    ALTER TABLE [Clientes]
    ADD CONSTRAINT [FK_Clientes_EsquemasPersonalizados_TipoClienteId]
    FOREIGN KEY ([TipoClienteId]) REFERENCES [EsquemasPersonalizados]([Id]) ON DELETE NO ACTION;

    PRINT 'Foreign Key FK_Clientes_EsquemasPersonalizados_TipoClienteId creada';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_EntidadesDinamicas_EntidadDinamicaId')
BEGIN
    ALTER TABLE [Clientes]
    ADD CONSTRAINT [FK_Clientes_EntidadesDinamicas_EntidadDinamicaId]
    FOREIGN KEY ([EntidadDinamicaId]) REFERENCES [EntidadesDinamicas]([Id]) ON DELETE NO ACTION;

    PRINT 'Foreign Key FK_Clientes_EntidadesDinamicas_EntidadDinamicaId creada';
END

GO

-- 6. Crear índices para mejor rendimiento
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_TipoClienteId')
BEGIN
    CREATE INDEX [IX_Clientes_TipoClienteId] ON [Clientes]([TipoClienteId]);
    PRINT 'Índice IX_Clientes_TipoClienteId creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_EntidadDinamicaId')
BEGIN
    CREATE INDEX [IX_Clientes_EntidadDinamicaId] ON [Clientes]([EntidadDinamicaId]);
    PRINT 'Índice IX_Clientes_EntidadDinamicaId creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_Nombre')
BEGIN
    CREATE INDEX [IX_Clientes_Nombre] ON [Clientes]([Nombre]);
    PRINT 'Índice IX_Clientes_Nombre creado';
END

GO

PRINT 'Migración completada exitosamente!';
PRINT 'La tabla Clientes ahora soporta entidades híbridas (estáticas + dinámicas)';
