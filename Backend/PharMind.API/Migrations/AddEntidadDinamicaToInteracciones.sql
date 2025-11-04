-- ================================================
-- Migración: Agregar referencia a EntidadDinamica en Interacciones
-- Fecha: 2025-11-04
-- Descripción: Permite asociar datos dinámicos personalizados a cada interacción
-- ================================================

-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[Interacciones]')
    AND name = 'EntidadDinamicaId'
)
BEGIN
    -- Agregar columna EntidadDinamicaId
    ALTER TABLE [Interacciones]
    ADD [EntidadDinamicaId] NVARCHAR(450) NULL;

    -- Crear índice
    CREATE INDEX [IX_Interacciones_EntidadDinamicaId] ON [Interacciones] ([EntidadDinamicaId]);

    -- Agregar Foreign Key
    ALTER TABLE [Interacciones]
    ADD CONSTRAINT [FK_Interacciones_EsquemasPersonalizados_EntidadDinamicaId]
    FOREIGN KEY ([EntidadDinamicaId])
    REFERENCES [EsquemasPersonalizados] ([Id]) ON DELETE NO ACTION;

    PRINT 'Columna EntidadDinamicaId agregada exitosamente a Interacciones';
END
ELSE
BEGIN
    PRINT 'La columna EntidadDinamicaId ya existe en Interacciones';
END
GO

PRINT 'Migración completada: Interacciones ahora puede referenciar EntidadesPersonalizadas';
