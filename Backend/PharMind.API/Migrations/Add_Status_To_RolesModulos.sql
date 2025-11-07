-- Agregar columna Status a RolesModulos
USE PharMind;
GO

ALTER TABLE RolesModulos
ADD Status BIT NULL DEFAULT 0;
GO

UPDATE RolesModulos SET Status = 0;
GO

PRINT 'Columna Status agregada y valores inicializados en RolesModulos';
