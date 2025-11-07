-- =============================================
-- Sistema de Roles y Módulos con Permisos
-- =============================================

-- 1. Crear tabla de Módulos (items del sidebar)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Modulos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Modulos] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Codigo] NVARCHAR(50) NOT NULL UNIQUE,
        [Nombre] NVARCHAR(100) NOT NULL,
        [Descripcion] NVARCHAR(500) NULL,
        [Icono] NVARCHAR(50) NULL, -- Icono Material UI
        [Ruta] NVARCHAR(200) NULL, -- Ruta del componente/página
        [OrdenMenu] INT NOT NULL DEFAULT 0,
        [ModuloPadreId] UNIQUEIDENTIFIER NULL, -- Para submódulos
        [Activo] BIT NOT NULL DEFAULT 1,

        -- Auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(256) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(256) NULL,
        [Status] BIT NOT NULL DEFAULT 0,

        CONSTRAINT FK_Modulos_ModuloPadre FOREIGN KEY ([ModuloPadreId])
            REFERENCES [dbo].[Modulos]([Id])
    );

    CREATE INDEX IX_Modulos_Codigo ON [dbo].[Modulos]([Codigo]);
    CREATE INDEX IX_Modulos_ModuloPadreId ON [dbo].[Modulos]([ModuloPadreId]);
    CREATE INDEX IX_Modulos_Activo ON [dbo].[Modulos]([Activo]);
END
GO

-- 2. Crear tabla de Roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Codigo] NVARCHAR(50) NOT NULL UNIQUE,
        [Nombre] NVARCHAR(100) NOT NULL,
        [Descripcion] NVARCHAR(500) NULL,
        [Activo] BIT NOT NULL DEFAULT 1,

        -- Auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(256) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(256) NULL,
        [Status] BIT NOT NULL DEFAULT 0
    );

    CREATE INDEX IX_Roles_Codigo ON [dbo].[Roles]([Codigo]);
    CREATE INDEX IX_Roles_Activo ON [dbo].[Roles]([Activo]);
END
GO

-- 3. Crear tabla intermedia Roles-Módulos (permisos)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolesModulos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RolesModulos] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [RolId] UNIQUEIDENTIFIER NOT NULL,
        [ModuloId] UNIQUEIDENTIFIER NOT NULL,

        -- Permisos granulares (opcional para futuro)
        [PuedeLeer] BIT NOT NULL DEFAULT 1,
        [PuedeCrear] BIT NOT NULL DEFAULT 0,
        [PuedeEditar] BIT NOT NULL DEFAULT 0,
        [PuedeEliminar] BIT NOT NULL DEFAULT 0,

        -- Auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(256) NULL,

        CONSTRAINT FK_RolesModulos_Rol FOREIGN KEY ([RolId])
            REFERENCES [dbo].[Roles]([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_RolesModulos_Modulo FOREIGN KEY ([ModuloId])
            REFERENCES [dbo].[Modulos]([Id]) ON DELETE CASCADE,
        CONSTRAINT UQ_RolesModulos_RolModulo UNIQUE ([RolId], [ModuloId])
    );

    CREATE INDEX IX_RolesModulos_RolId ON [dbo].[RolesModulos]([RolId]);
    CREATE INDEX IX_RolesModulos_ModuloId ON [dbo].[RolesModulos]([ModuloId]);
END
GO

-- 4. Agregar campos a la tabla Agentes para asignar Rol
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Agentes]') AND name = 'RolId')
BEGIN
    ALTER TABLE [dbo].[Agentes]
    ADD [RolId] UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Agentes_Rol FOREIGN KEY ([RolId])
        REFERENCES [dbo].[Roles]([Id]);

    CREATE INDEX IX_Agentes_RolId ON [dbo].[Agentes]([RolId]);
END
GO

-- 5. Agregar campos a AspNetUsers para vincular con Agentes
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = 'AgenteId')
BEGIN
    ALTER TABLE [dbo].[AspNetUsers]
    ADD [AgenteId] NVARCHAR(450) NULL,
        [EsAdministrador] BIT NOT NULL DEFAULT 0;

    ALTER TABLE [dbo].[AspNetUsers]
    ADD CONSTRAINT FK_AspNetUsers_Agente FOREIGN KEY ([AgenteId])
        REFERENCES [dbo].[Agentes]([Id]);

    CREATE INDEX IX_AspNetUsers_AgenteId ON [dbo].[AspNetUsers]([AgenteId]);
END
GO

-- =============================================
-- DATOS INICIALES - Módulos del Sistema
-- =============================================

-- Insertar módulos principales (basados en el sidebar actual)
DECLARE @ModulosCRM UNIQUEIDENTIFIER = NEWID();
DECLARE @ModulosAnalytics UNIQUEIDENTIFIER = NEWID();
DECLARE @ModulosConfig UNIQUEIDENTIFIER = NEWID();
DECLARE @ModulosAudit UNIQUEIDENTIFIER = NEWID();

-- Módulo: CRM
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM')
BEGIN
    SET @ModulosCRM = NEWID();
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo)
    VALUES (@ModulosCRM, 'CRM', 'CRM', 'Gestión de clientes y relaciones', 'people', '/crm', 1, 1);
END

-- Submódulos de CRM
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_CLIENTES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CRM_CLIENTES', 'Clientes', 'Gestión de clientes', 'person', '/crm/clientes', 1, @ModulosCRM, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_RELACIONES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CRM_RELACIONES', 'Relaciones', 'Gestión de relaciones', 'link', '/crm/relaciones', 2, @ModulosCRM, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_INTERACCIONES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CRM_INTERACCIONES', 'Interacciones', 'Gestión de interacciones', 'assignment', '/crm/interacciones', 3, @ModulosCRM, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CRM_AGENTES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CRM_AGENTES', 'Agentes', 'Gestión de agentes', 'badge', '/crm/agentes', 4, @ModulosCRM, 1);
END

-- Módulo: Analytics
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'ANALYTICS')
BEGIN
    SET @ModulosAnalytics = NEWID();
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo)
    VALUES (@ModulosAnalytics, 'ANALYTICS', 'Analytics', 'Análisis y reportes', 'analytics', '/analytics', 2, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'ANALYTICS_VISITAS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'ANALYTICS_VISITAS', 'Actividad de Visitas', 'Análisis de visitas', 'trending_up', '/analytics/actividad-visitas', 1, @ModulosAnalytics, 1);
END

-- Módulo: Auditoría
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'AUDITORIA')
BEGIN
    SET @ModulosAudit = NEWID();
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo)
    VALUES (@ModulosAudit, 'AUDITORIA', 'Auditoría', 'Importación de datos de auditoría', 'upload', '/auditoria', 3, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'AUDITORIA_IMPORTACION')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'AUDITORIA_IMPORTACION', 'Importaciones', 'Importar archivos de auditoría', 'cloud_upload', '/auditoria/importaciones', 1, @ModulosAudit, 1);
END

-- Módulo: Configuración (solo para administradores)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG')
BEGIN
    SET @ModulosConfig = NEWID();
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo)
    VALUES (@ModulosConfig, 'CONFIG', 'Configuración', 'Configuración del sistema', 'settings', '/config', 10, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_SCHEMAS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CONFIG_SCHEMAS', 'Esquemas', 'Gestión de esquemas personalizados', 'schema', '/config/esquemas', 1, @ModulosConfig, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_USUARIOS')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CONFIG_USUARIOS', 'Usuarios', 'Gestión de usuarios', 'people', '/config/usuarios', 2, @ModulosConfig, 1);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Modulos] WHERE Codigo = 'CONFIG_ROLES')
BEGIN
    INSERT INTO [dbo].[Modulos] (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, ModuloPadreId, Activo)
    VALUES (NEWID(), 'CONFIG_ROLES', 'Roles y Permisos', 'Gestión de roles y permisos', 'security', '/config/roles', 3, @ModulosConfig, 1);
END

GO

-- =============================================
-- DATOS INICIALES - Roles del Sistema
-- =============================================

-- Rol: Administrador (acceso completo)
DECLARE @RolAdmin UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'ADMIN')
BEGIN
    SET @RolAdmin = NEWID();
    INSERT INTO [dbo].[Roles] (Id, Codigo, Nombre, Descripcion, Activo)
    VALUES (@RolAdmin, 'ADMIN', 'Administrador', 'Acceso completo al sistema', 1);

    -- Asignar todos los módulos al rol Administrador
    INSERT INTO [dbo].[RolesModulos] (RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar)
    SELECT @RolAdmin, Id, 1, 1, 1, 1
    FROM [dbo].[Modulos]
    WHERE Activo = 1;
END

-- Rol: Vendedor (acceso a CRM y Analytics)
DECLARE @RolVendedor UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'VENDEDOR')
BEGIN
    SET @RolVendedor = NEWID();
    INSERT INTO [dbo].[Roles] (Id, Codigo, Nombre, Descripcion, Activo)
    VALUES (@RolVendedor, 'VENDEDOR', 'Vendedor', 'Acceso a CRM y Analytics básicos', 1);

    -- Asignar módulos de CRM y Analytics
    INSERT INTO [dbo].[RolesModulos] (RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar)
    SELECT @RolVendedor, Id, 1, 1, 1, 0
    FROM [dbo].[Modulos]
    WHERE Codigo IN ('CRM', 'CRM_CLIENTES', 'CRM_RELACIONES', 'CRM_INTERACCIONES', 'ANALYTICS', 'ANALYTICS_VISITAS')
    AND Activo = 1;
END

-- Rol: Supervisor (acceso a CRM, Analytics y Auditoría)
DECLARE @RolSupervisor UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE Codigo = 'SUPERVISOR')
BEGIN
    SET @RolSupervisor = NEWID();
    INSERT INTO [dbo].[Roles] (Id, Codigo, Nombre, Descripcion, Activo)
    VALUES (@RolSupervisor, 'SUPERVISOR', 'Supervisor', 'Acceso a CRM, Analytics y Auditoría', 1);

    -- Asignar módulos de CRM, Analytics y Auditoría
    INSERT INTO [dbo].[RolesModulos] (RolId, ModuloId, PuedeLeer, PuedeCrear, PuedeEditar, PuedeEliminar)
    SELECT @RolSupervisor, Id, 1, 1, 1, 1
    FROM [dbo].[Modulos]
    WHERE Codigo IN ('CRM', 'CRM_CLIENTES', 'CRM_RELACIONES', 'CRM_INTERACCIONES', 'CRM_AGENTES',
                     'ANALYTICS', 'ANALYTICS_VISITAS', 'AUDITORIA', 'AUDITORIA_IMPORTACION')
    AND Activo = 1;
END

GO

PRINT 'Sistema de Roles y Módulos creado exitosamente';
