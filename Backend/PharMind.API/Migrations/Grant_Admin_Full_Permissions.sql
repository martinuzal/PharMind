-- =============================================
-- Script: Grant Full Permissions to Administrator Role
-- Descripción: Asigna todos los módulos al rol Administrador con permisos completos
-- Fecha: 2025-11-07
-- =============================================

USE PharMind;
GO

DECLARE @RolAdminId NVARCHAR(450) = 'ROL-ADMIN-001';

-- Eliminar permisos existentes del rol Administrador para evitar duplicados
DELETE FROM RolModulos WHERE RolId = @RolAdminId;
GO

-- Insertar permisos completos para TODOS los módulos al rol Administrador
INSERT INTO RolModulos (Id, RolId, ModuloId, NivelAcceso, PuedeVer, PuedeCrear, PuedeEditar, PuedeEliminar, PuedeExportar, PuedeImportar, PuedeAprobar, FechaCreacion, Status)
SELECT
    NEWID() AS Id,
    'ROL-ADMIN-001' AS RolId,
    m.Id AS ModuloId,
    3 AS NivelAcceso, -- Nivel máximo de acceso
    1 AS PuedeVer,
    1 AS PuedeCrear,
    1 AS PuedeEditar,
    1 AS PuedeEliminar,
    1 AS PuedeExportar,
    1 AS PuedeImportar,
    1 AS PuedeAprobar,
    GETUTCDATE() AS FechaCreacion,
    0 AS Status
FROM Modulos m
WHERE m.Activo = 1
  AND NOT EXISTS (
    SELECT 1
    FROM RolModulos rm
    WHERE rm.RolId = 'ROL-ADMIN-001'
      AND rm.ModuloId = m.Id
  );
GO

-- Verificar los permisos asignados
SELECT
    r.Nombre as Rol,
    m.Nombre as Modulo,
    m.Ruta,
    rm.PuedeVer,
    rm.PuedeCrear,
    rm.PuedeEditar,
    rm.PuedeEliminar,
    rm.PuedeExportar,
    rm.PuedeImportar,
    rm.PuedeAprobar
FROM RolModulos rm
INNER JOIN Roles r ON rm.RolId = r.Id
INNER JOIN Modulos m ON rm.ModuloId = m.Id
WHERE r.Nombre = 'Administrador'
ORDER BY m.OrdenMenu;
GO

PRINT 'Permisos completos asignados al rol Administrador exitosamente.';
GO
