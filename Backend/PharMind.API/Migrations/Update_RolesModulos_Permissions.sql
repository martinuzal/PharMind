-- =============================================
-- Script: Actualizar permisos en RolesModulos
-- Descripción:
--   1. Renombrar PuedeLeer a PuedeVer
--   2. Agregar nuevas columnas de permisos
-- =============================================

USE PharMind;
GO

-- Renombrar columna PuedeLeer a PuedeVer
EXEC sp_rename 'RolesModulos.PuedeLeer', 'PuedeVer', 'COLUMN';
GO

-- Agregar nuevas columnas de permisos
ALTER TABLE RolesModulos
ADD
    PuedeExportar BIT NOT NULL DEFAULT 0,
    PuedeImportar BIT NOT NULL DEFAULT 0,
    PuedeAprobar BIT NOT NULL DEFAULT 0;
GO

-- Actualizar permisos existentes del rol Administrador
-- Darle todos los permisos al administrador
UPDATE rm
SET
    PuedeExportar = 1,
    PuedeImportar = 1,
    PuedeAprobar = 1
FROM RolesModulos rm
INNER JOIN Roles r ON rm.RolId = r.Id
WHERE r.Nombre = 'Administrador'
  AND r.Status = 0;
GO

PRINT 'Columnas de permisos actualizadas correctamente en RolesModulos';
GO
