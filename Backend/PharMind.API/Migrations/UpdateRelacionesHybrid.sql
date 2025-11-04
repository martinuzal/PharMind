-- =============================================
-- Script: Actualizar tabla Relaciones para soporte híbrido
-- Descripción: Agrega columnas para TipoRelacionId y EntidadDinamicaId
-- =============================================

-- 1. Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Relaciones' AND COLUMN_NAME = 'TipoRelacionId')
BEGIN
    -- Agregar columna TipoRelacionId (temporalmente nullable)
    ALTER TABLE [Relaciones]
    ADD [TipoRelacionId] NVARCHAR(450) NULL;

    PRINT 'Columna TipoRelacionId agregada';
END
ELSE
BEGIN
    PRINT 'Columna TipoRelacionId ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Relaciones' AND COLUMN_NAME = 'EntidadDinamicaId')
BEGIN
    -- Agregar columna EntidadDinamicaId
    ALTER TABLE [Relaciones]
    ADD [EntidadDinamicaId] NVARCHAR(450) NULL;

    PRINT 'Columna EntidadDinamicaId agregada';
END
ELSE
BEGIN
    PRINT 'Columna EntidadDinamicaId ya existe';
END

GO

-- 2. Crear un EsquemaPersonalizado por defecto para tipos de relación existentes
DECLARE @DefaultTipoRelacionId NVARCHAR(450) = NEWID();

-- Verificar si ya existe un esquema por defecto para Relacion
IF NOT EXISTS (SELECT * FROM [EsquemasPersonalizados] WHERE [EntidadTipo] = 'Relacion' AND [SubTipo] = 'General')
BEGIN
    INSERT INTO [EsquemasPersonalizados] (
        [Id], [Nombre], [Descripcion], [EntidadTipo], [SubTipo],
        [Schema], [Version], [Icono], [Color], [Activo], [Orden],
        [FechaCreacion], [CreadoPor], [Status]
    )
    VALUES (
        @DefaultTipoRelacionId,
        'Relación General',
        'Tipo de relación por defecto para migración',
        'Relacion',
        'General',
        '{"campos":[]}',
        1,
        'link',
        '#3B82F6',
        1,
        0,
        GETDATE(),
        'System',
        0
    );

    PRINT 'EsquemaPersonalizado por defecto creado para Relacion';
END
ELSE
BEGIN
    -- Obtener el ID del esquema existente
    SELECT @DefaultTipoRelacionId = [Id]
    FROM [EsquemasPersonalizados]
    WHERE [EntidadTipo] = 'Relacion' AND [SubTipo] = 'General';

    PRINT 'Usando EsquemaPersonalizado existente para Relacion';
END

GO

-- 3. Migrar datos existentes
-- Actualizar TipoRelacionId con el valor por defecto para registros existentes
UPDATE [Relaciones]
SET [TipoRelacionId] = (
    SELECT TOP 1 [Id]
    FROM [EsquemasPersonalizados]
    WHERE [EntidadTipo] = 'Relacion' AND [SubTipo] = 'General'
)
WHERE [TipoRelacionId] IS NULL;

PRINT 'Datos migrados: TipoRelacionId actualizado';

GO

-- 4. Hacer TipoRelacionId NOT NULL
-- Primero verificar que no hay valores NULL
IF NOT EXISTS (SELECT * FROM [Relaciones] WHERE [TipoRelacionId] IS NULL)
BEGIN
    ALTER TABLE [Relaciones]
    ALTER COLUMN [TipoRelacionId] NVARCHAR(450) NOT NULL;

    PRINT 'Columna TipoRelacionId configurada como NOT NULL';
END

GO

-- 5. Crear Foreign Keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Relaciones_EsquemasPersonalizados_TipoRelacionId')
BEGIN
    ALTER TABLE [Relaciones]
    ADD CONSTRAINT [FK_Relaciones_EsquemasPersonalizados_TipoRelacionId]
    FOREIGN KEY ([TipoRelacionId]) REFERENCES [EsquemasPersonalizados]([Id]) ON DELETE NO ACTION;

    PRINT 'Foreign Key FK_Relaciones_EsquemasPersonalizados_TipoRelacionId creada';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Relaciones_EntidadesDinamicas_EntidadDinamicaId')
BEGIN
    ALTER TABLE [Relaciones]
    ADD CONSTRAINT [FK_Relaciones_EntidadesDinamicas_EntidadDinamicaId]
    FOREIGN KEY ([EntidadDinamicaId]) REFERENCES [EntidadesDinamicas]([Id]) ON DELETE NO ACTION;

    PRINT 'Foreign Key FK_Relaciones_EntidadesDinamicas_EntidadDinamicaId creada';
END

GO

-- 6. Crear índices para mejor rendimiento
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Relaciones_TipoRelacionId')
BEGIN
    CREATE INDEX [IX_Relaciones_TipoRelacionId] ON [Relaciones]([TipoRelacionId]);
    PRINT 'Índice IX_Relaciones_TipoRelacionId creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Relaciones_EntidadDinamicaId')
BEGIN
    CREATE INDEX [IX_Relaciones_EntidadDinamicaId] ON [Relaciones]([EntidadDinamicaId]);
    PRINT 'Índice IX_Relaciones_EntidadDinamicaId creado';
END

GO

PRINT 'Migración completada exitosamente!';
PRINT 'La tabla Relaciones ahora soporta entidades híbridas (estáticas + dinámicas)';
