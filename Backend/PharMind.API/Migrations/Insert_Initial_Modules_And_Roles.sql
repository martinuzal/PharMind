-- =============================================
-- Insertar Datos Iniciales - Módulos y Roles
-- =============================================

-- Variables para almacenar IDs de módulos principales
DECLARE @ModulosCRM NVARCHAR(450);
DECLARE @ModulosAnalytics NVARCHAR(450);
DECLARE @ModulosConfig NVARCHAR(450);
DECLARE @ModulosAudit NVARCHAR(450);

-- Variable para EmpresaId
DECLARE @EmpresaId NVARCHAR(450) = 'EMP-DEFAULT-001';

-- =============================================
-- MÓDULOS DEL SISTEMA
-- =============================================

-- Módulo: CRM
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM')
BEGIN
    SET @ModulosCRM = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, FechaCreacion)
    VALUES (@ModulosCRM, 'CRM', 'CRM', 'Gestión de clientes y relaciones', 'people', '/crm', 1, 1, GETDATE());
    PRINT 'Módulo CRM creado';
END
ELSE
BEGIN
    SELECT @ModulosCRM = Id FROM [dbo].[Modulos] WHERE Codigo = 'CRM';
    PRINT 'Módulo CRM ya existe';
END

-- Submódulos de CRM
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_CLIENTES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CRM_CLIENTES', 'Clientes', 'Gestión de clientes', 'person', '/crm/clientes', 1, @ModulosCRM, 1, GETDATE());
    PRINT 'Submódulo CRM_CLIENTES creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CRM_CLIENTES ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_RELACIONES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CRM_RELACIONES', 'Relaciones', 'Gestión de relaciones', 'link', '/crm/relaciones', 2, @ModulosCRM, 1, GETDATE());
    PRINT 'Submódulo CRM_RELACIONES creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CRM_RELACIONES ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_INTERACCIONES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CRM_INTERACCIONES', 'Interacciones', 'Gestión de interacciones', 'assignment', '/crm/interacciones', 3, @ModulosCRM, 1, GETDATE());
    PRINT 'Submódulo CRM_INTERACCIONES creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CRM_INTERACCIONES ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_AGENTES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CRM_AGENTES', 'Agentes', 'Gestión de agentes', 'badge', '/crm/agentes', 4, @ModulosCRM, 1, GETDATE());
    PRINT 'Submódulo CRM_AGENTES creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CRM_AGENTES ya existe';
END

-- Módulo: Analytics
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'ANALYTICS')
BEGIN
    SET @ModulosAnalytics = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, FechaCreacion)
    VALUES (@ModulosAnalytics, 'ANALYTICS', 'Analytics', 'Análisis y reportes', 'analytics', '/analytics', 2, 1, GETDATE());
    PRINT 'Módulo ANALYTICS creado';
END
ELSE
BEGIN
    SELECT @ModulosAnalytics = Id FROM [dbo].[Modulos] WHERE Codigo = 'ANALYTICS';
    PRINT 'Módulo ANALYTICS ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'ANALYTICS_VISITAS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'ANALYTICS_VISITAS', 'Actividad de Visitas', 'Análisis de visitas', 'trending_up', '/analytics/actividad-visitas', 1, @ModulosAnalytics, 1, GETDATE());
    PRINT 'Submódulo ANALYTICS_VISITAS creado';
END
ELSE
BEGIN
    PRINT 'Submódulo ANALYTICS_VISITAS ya existe';
END

-- Módulo: Auditoría
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'AUDITORIA')
BEGIN
    SET @ModulosAudit = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, FechaCreacion)
    VALUES (@ModulosAudit, 'AUDITORIA', 'Auditoría', 'Importación de datos de auditoría', 'upload', '/auditoria', 3, 1, GETDATE());
    PRINT 'Módulo AUDITORIA creado';
END
ELSE
BEGIN
    SELECT @ModulosAudit = Id FROM [dbo].[Modulos] WHERE Codigo = 'AUDITORIA';
    PRINT 'Módulo AUDITORIA ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'AUDITORIA_IMPORTACION')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'AUDITORIA_IMPORTACION', 'Importaciones', 'Importar archivos de auditoría', 'cloud_upload', '/auditoria/importaciones', 1, @ModulosAudit, 1, GETDATE());
    PRINT 'Submódulo AUDITORIA_IMPORTACION creado';
END
ELSE
BEGIN
    PRINT 'Submódulo AUDITORIA_IMPORTACION ya existe';
END

-- Módulo: Configuración (solo para administradores)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG')
BEGIN
    SET @ModulosConfig = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, FechaCreacion)
    VALUES (@ModulosConfig, 'CONFIG', 'Configuración', 'Configuración del sistema', 'settings', '/config', 10, 1, GETDATE());
    PRINT 'Módulo CONFIG creado';
END
ELSE
BEGIN
    SELECT @ModulosConfig = Id FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG';
    PRINT 'Módulo CONFIG ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_SCHEMAS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CONFIG_SCHEMAS', 'Esquemas', 'Gestión de esquemas personalizados', 'schema', '/config/esquemas', 1, @ModulosConfig, 1, GETDATE());
    PRINT 'Submódulo CONFIG_SCHEMAS creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CONFIG_SCHEMAS ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_USUARIOS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CONFIG_USUARIOS', 'Usuarios', 'Gestión de usuarios', 'people', '/config/usuarios', 2, @ModulosConfig, 1, GETDATE());
    PRINT 'Submódulo CONFIG_USUARIOS creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CONFIG_USUARIOS ya existe';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_ROLES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo, FechaCreacion)
    VALUES (CAST(NEWID() AS NVARCHAR(450)), 'CONFIG_ROLES', 'Roles y Permisos', 'Gestión de roles y permisos', 'security', '/config/roles', 3, @ModulosConfig, 1, GETDATE());
    PRINT 'Submódulo CONFIG_ROLES creado';
END
ELSE
BEGIN
    PRINT 'Submódulo CONFIG_ROLES ya existe';
END

-- =============================================
-- ROLES DEL SISTEMA
-- =============================================

-- Variables para almacenar IDs de roles
DECLARE @RolAdmin NVARCHAR(450);
DECLARE @RolVendedor NVARCHAR(450);
DECLARE @RolSupervisor NVARCHAR(450);

-- Rol: Administrador (acceso completo)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'ADMIN')
BEGIN
    SET @RolAdmin = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Roles] (Id, EmpresaId, Codigo, Nombre, Descripcion, EsSistema, Activo, FechaCreacion)
    VALUES (@RolAdmin, @EmpresaId, 'ADMIN', 'Administrador', 'Acceso completo al sistema', 1, 1, GETDATE());
    PRINT 'Rol ADMIN creado';

    -- Asignar todos los módulos al rol Administrador
    INSERT INTO [dbo].[RolesModulos] (Id, RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar, FechaCreacion)
    SELECT CAST(NEWID() AS NVARCHAR(450)), @RolAdmin, Id, 1, 1, 1, 1, GETDATE()
    FROM [dbo].[Modulos]
    WHERE Activo = 1;
    PRINT 'Permisos asignados al rol ADMIN';
END
ELSE
BEGIN
    PRINT 'Rol ADMIN ya existe';
END

-- Rol: Vendedor (acceso a CRM y Analytics)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'VENDEDOR')
BEGIN
    SET @RolVendedor = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Roles] (Id, EmpresaId, Codigo, Nombre, Descripcion, EsSistema, Activo, FechaCreacion)
    VALUES (@RolVendedor, @EmpresaId, 'VENDEDOR', 'Vendedor', 'Acceso a CRM y Analytics básicos', 1, 1, GETDATE());
    PRINT 'Rol VENDEDOR creado';

    -- Asignar módulos de CRM y Analytics
    INSERT INTO [dbo].[RolesModulos] (Id, RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar, FechaCreacion)
    SELECT CAST(NEWID() AS NVARCHAR(450)), @RolVendedor, Id, 1, 1, 1, 0, GETDATE()
    FROM [dbo].[Modulos]
    WHERE Codigo IN ('CRM', 'CRM_CLIENTES', 'CRM_RELACIONES', 'CRM_INTERACCIONES', 'ANALYTICS', 'ANALYTICS_VISITAS')
    AND Activo = 1;
    PRINT 'Permisos asignados al rol VENDEDOR';
END
ELSE
BEGIN
    PRINT 'Rol VENDEDOR ya existe';
END

-- Rol: Supervisor (acceso a CRM, Analytics y Auditoría)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'SUPERVISOR')
BEGIN
    SET @RolSupervisor = CAST(NEWID() AS NVARCHAR(450));
    INSERT INTO [dbo].[Roles] (Id, EmpresaId, Codigo, Nombre, Descripcion, EsSistema, Activo, FechaCreacion)
    VALUES (@RolSupervisor, @EmpresaId, 'SUPERVISOR', 'Supervisor', 'Acceso a CRM, Analytics y Auditoría', 1, 1, GETDATE());
    PRINT 'Rol SUPERVISOR creado';

    -- Asignar módulos de CRM, Analytics y Auditoría
    INSERT INTO [dbo].[RolesModulos] (Id, RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar, FechaCreacion)
    SELECT CAST(NEWID() AS NVARCHAR(450)), @RolSupervisor, Id, 1, 1, 1, 1, GETDATE()
    FROM [dbo].[Modulos]
    WHERE Codigo IN ('CRM', 'CRM_CLIENTES', 'CRM_RELACIONES', 'CRM_INTERACCIONES', 'CRM_AGENTES',
                     'ANALYTICS', 'ANALYTICS_VISITAS', 'AUDITORIA', 'AUDITORIA_IMPORTACION')
    AND Activo = 1;
    PRINT 'Permisos asignados al rol SUPERVISOR';
END
ELSE
BEGIN
    PRINT 'Rol SUPERVISOR ya existe';
END

-- =============================================
-- RESUMEN
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'Sistema de Roles y Módulos configurado';
PRINT '==============================================';
PRINT '';
SELECT COUNT(*) AS 'Total Módulos' FROM [dbo].[Modulos];
SELECT COUNT(*) AS 'Total Roles' FROM [dbo].[Roles];
SELECT COUNT(*) AS 'Total Permisos' FROM [dbo].[RolesModulos];
