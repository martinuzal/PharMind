-- Agregar columnas faltantes de AuditableEntity a RolesModulos
-- Estas columnas son parte de la clase base AuditableEntity

USE PharMind;
GO

-- Agregar columna FechaModificacion si no existe
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'RolesModulos' AND COLUMN_NAME = 'FechaModificacion')
BEGIN
    ALTER TABLE RolesModulos
    ADD FechaModificacion DATETIME2 NULL;

    PRINT 'Columna FechaModificacion agregada a RolesModulos';
END
ELSE
BEGIN
    PRINT 'Columna FechaModificacion ya existe en RolesModulos';
END
GO

-- Agregar columna ModificadoPor si no existe
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'RolesModulos' AND COLUMN_NAME = 'ModificadoPor')
BEGIN
    ALTER TABLE RolesModulos
    ADD ModificadoPor NVARCHAR(450) NULL;

    PRINT 'Columna ModificadoPor agregada a RolesModulos';
END
ELSE
BEGIN
    PRINT 'Columna ModificadoPor ya existe en RolesModulos';
END
GO

-- Agregar columna Status si no existe
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'RolesModulos' AND COLUMN_NAME = 'Status')
BEGIN
    ALTER TABLE RolesModulos
    ADD Status BIT NULL DEFAULT 0;

    -- Actualizar registros existentes a Status = 0 (activos)
    UPDATE RolesModulos SET Status = 0 WHERE Status IS NULL;

    PRINT 'Columna Status agregada a RolesModulos';
END
ELSE
BEGIN
    PRINT 'Columna Status ya existe en RolesModulos';
END
GO

PRINT 'Migración completada: columnas de AuditableEntity agregadas a RolesModulos';
