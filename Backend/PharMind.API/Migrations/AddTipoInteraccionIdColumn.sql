-- ======================================================================
-- Migración: Agregar columna TipoInteraccionId a tabla Interacciones
-- Fecha: 2025-01-05
-- Descripción: Convierte Interacciones a formato híbrido (estático + dinámico)
--              agregando relación con EsquemasPersonalizados
-- ======================================================================

USE PharMindDB;
GO

-- Verificar que existe la tabla EsquemasPersonalizados
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EsquemasPersonalizados')
BEGIN
    PRINT 'ERROR: La tabla EsquemasPersonalizados no existe. Ejecute primero las migraciones de esquemas personalizados.';
    RETURN;
END
GO

-- Agregar columna TipoInteraccionId a la tabla Interacciones
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Interacciones') AND name = 'TipoInteraccionId')
BEGIN
    PRINT 'Agregando columna TipoInteraccionId a tabla Interacciones...';

    ALTER TABLE Interacciones
    ADD TipoInteraccionId NVARCHAR(450) NULL;

    PRINT 'Columna TipoInteraccionId agregada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La columna TipoInteraccionId ya existe en la tabla Interacciones.';
END
GO

-- Crear tipo de interacción por defecto si no existe
DECLARE @DefaultTipoInteraccionId NVARCHAR(450);
DECLARE @DefaultTipoNombre NVARCHAR(200) = 'Visita Médica Estándar';

-- Buscar si existe un tipo de interacción por defecto
SELECT TOP 1 @DefaultTipoInteraccionId = Id
FROM EsquemasPersonalizados
WHERE EntidadTipo = 'Interaccion'
  AND Status = 0
ORDER BY FechaCreacion ASC;

-- Si no existe ningún tipo de interacción, crear uno por defecto
IF @DefaultTipoInteraccionId IS NULL
BEGIN
    SET @DefaultTipoInteraccionId = NEWID();

    PRINT 'Creando tipo de interacción por defecto...';

    INSERT INTO EsquemasPersonalizados (
        Id,
        Nombre,
        Descripcion,
        EntidadTipo,
        SubTipo,
        Schema,
        Icono,
        Color,
        Status,
        FechaCreacion,
        CreadoPor
    )
    VALUES (
        @DefaultTipoInteraccionId,
        @DefaultTipoNombre,
        'Tipo de interacción creado automáticamente durante migración',
        'Interaccion',
        'VisitaMedica',
        '{"fields":[],"version":1}',
        'medical_services',
        '#10B981',
        0,
        GETDATE(),
        'System-Migration'
    );

    PRINT 'Tipo de interacción por defecto creado: ' + @DefaultTipoNombre;
END
ELSE
BEGIN
    SELECT @DefaultTipoNombre = Nombre
    FROM EsquemasPersonalizados
    WHERE Id = @DefaultTipoInteraccionId;

    PRINT 'Usando tipo de interacción existente: ' + @DefaultTipoNombre;
END
GO

-- Actualizar registros existentes con el tipo por defecto
DECLARE @DefaultTipoInteraccionId NVARCHAR(450);
DECLARE @UpdatedRecords INT;

SELECT TOP 1 @DefaultTipoInteraccionId = Id
FROM EsquemasPersonalizados
WHERE EntidadTipo = 'Interaccion'
  AND Status = 0
ORDER BY FechaCreacion ASC;

IF @DefaultTipoInteraccionId IS NOT NULL
BEGIN
    PRINT 'Actualizando interacciones existentes con TipoInteraccionId...';

    UPDATE Interacciones
    SET TipoInteraccionId = @DefaultTipoInteraccionId,
        FechaModificacion = GETDATE(),
        ModificadoPor = 'System-Migration'
    WHERE TipoInteraccionId IS NULL
      AND Status = 0;

    SET @UpdatedRecords = @@ROWCOUNT;
    PRINT CAST(@UpdatedRecords AS NVARCHAR(10)) + ' registros actualizados con TipoInteraccionId.';
END
GO

-- Hacer la columna NOT NULL ahora que todos los registros tienen valor
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Interacciones') AND name = 'TipoInteraccionId' AND is_nullable = 1)
BEGIN
    PRINT 'Cambiando columna TipoInteraccionId a NOT NULL...';

    ALTER TABLE Interacciones
    ALTER COLUMN TipoInteraccionId NVARCHAR(450) NOT NULL;

    PRINT 'Columna TipoInteraccionId configurada como NOT NULL.';
END
GO

-- Crear foreign key con EsquemasPersonalizados
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Interacciones_EsquemasPersonalizados_TipoInteraccionId')
BEGIN
    PRINT 'Creando foreign key FK_Interacciones_EsquemasPersonalizados_TipoInteraccionId...';

    ALTER TABLE Interacciones
    ADD CONSTRAINT FK_Interacciones_EsquemasPersonalizados_TipoInteraccionId
    FOREIGN KEY (TipoInteraccionId) REFERENCES EsquemasPersonalizados(Id);

    PRINT 'Foreign key creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'Foreign key FK_Interacciones_EsquemasPersonalizados_TipoInteraccionId ya existe.';
END
GO

-- Crear índice para mejorar performance de queries por TipoInteraccionId
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Interacciones_TipoInteraccionId' AND object_id = OBJECT_ID(N'Interacciones'))
BEGIN
    PRINT 'Creando índice IX_Interacciones_TipoInteraccionId...';

    CREATE NONCLUSTERED INDEX IX_Interacciones_TipoInteraccionId
    ON Interacciones(TipoInteraccionId)
    INCLUDE (Fecha, RelacionId, AgenteId, ClienteId);

    PRINT 'Índice creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Índice IX_Interacciones_TipoInteraccionId ya existe.';
END
GO

-- Verificar la migración
PRINT '';
PRINT '========================================';
PRINT 'VERIFICACIÓN DE MIGRACIÓN';
PRINT '========================================';

-- Contar interacciones totales
DECLARE @TotalInteracciones INT;
SELECT @TotalInteracciones = COUNT(*)
FROM Interacciones
WHERE Status = 0;
PRINT 'Total de interacciones activas: ' + CAST(@TotalInteracciones AS NVARCHAR(10));

-- Contar interacciones con TipoInteraccionId
DECLARE @InteraccionesConTipo INT;
SELECT @InteraccionesConTipo = COUNT(*)
FROM Interacciones
WHERE TipoInteraccionId IS NOT NULL
  AND Status = 0;
PRINT 'Interacciones con TipoInteraccionId: ' + CAST(@InteraccionesConTipo AS NVARCHAR(10));

-- Mostrar distribución por tipo de interacción
PRINT '';
PRINT 'Distribución por tipo de interacción:';
SELECT
    ep.Nombre AS TipoInteraccion,
    ep.SubTipo,
    COUNT(i.Id) AS Cantidad
FROM Interacciones i
LEFT JOIN EsquemasPersonalizados ep ON i.TipoInteraccionId = ep.Id
WHERE i.Status = 0
GROUP BY ep.Nombre, ep.SubTipo
ORDER BY COUNT(i.Id) DESC;

PRINT '';
PRINT '========================================';
PRINT 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
PRINT '========================================';
GO
