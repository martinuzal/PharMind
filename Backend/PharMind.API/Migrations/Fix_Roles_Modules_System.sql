-- =============================================
-- Fix: Completar sistema de Roles y Módulos
-- =============================================

-- 1. Eliminar tablas existentes y recrear con tipo correcto
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Roles];
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Modulos]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Modulos];
END
GO

-- 2. Crear tabla de Módulos con NVARCHAR(450)
CREATE TABLE [dbo].[Modulos] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [Codigo] NVARCHAR(50) NOT NULL UNIQUE,
    [Nombre] NVARCHAR(100) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [Icono] NVARCHAR(50) NULL,
    [Ruta] NVARCHAR(200) NULL,
    [OrdenMenu] INT NOT NULL DEFAULT 0,
    [ModuloPadreId] NVARCHAR(450) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(256) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(256) NULL,
    [Status] BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Modulos_ModuloPadre FOREIGN KEY ([ModuloPadreId])
        REFERENCES [dbo].[Modulos]([Id])
);
GO

CREATE INDEX IX_Modulos_Codigo ON [dbo].[Modulos]([Codigo]);
CREATE INDEX IX_Modulos_ModuloPadreId ON [dbo].[Modulos]([ModuloPadreId]);
CREATE INDEX IX_Modulos_Activo ON [dbo].[Modulos]([Activo]);
GO

-- 3. Crear tabla de Roles con NVARCHAR(450)
CREATE TABLE [dbo].[Roles] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [Codigo] NVARCHAR(50) NOT NULL UNIQUE,
    [Nombre] NVARCHAR(100) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(256) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(256) NULL,
    [Status] BIT NOT NULL DEFAULT 0
);
GO

CREATE INDEX IX_Roles_Codigo ON [dbo].[Roles]([Codigo]);
CREATE INDEX IX_Roles_Activo ON [dbo].[Roles]([Activo]);
GO

-- 4. Crear tabla intermedia Roles-Módulos
CREATE TABLE [dbo].[RolesModulos] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [RolId] NVARCHAR(450) NOT NULL,
    [ModuloId] NVARCHAR(450) NOT NULL,
    [PuedeLeer] BIT NOT NULL DEFAULT 1,
    [PuedeCrear] BIT NOT NULL DEFAULT 0,
    [PuedeEditar] BIT NOT NULL DEFAULT 0,
    [PuedeEliminar] BIT NOT NULL DEFAULT 0,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(256) NULL,
    CONSTRAINT FK_RolesModulos_Rol FOREIGN KEY ([RolId])
        REFERENCES [dbo].[Roles]([Id]) ON DELETE CASCADE,
    CONSTRAINT FK_RolesModulos_Modulo FOREIGN KEY ([ModuloId])
        REFERENCES [dbo].[Modulos]([Id]) ON DELETE CASCADE,
    CONSTRAINT UQ_RolesModulos_RolModulo UNIQUE ([RolId], [ModuloId])
);
GO

CREATE INDEX IX_RolesModulos_RolId ON [dbo].[RolesModulos]([RolId]);
CREATE INDEX IX_RolesModulos_ModuloId ON [dbo].[RolesModulos]([ModuloId]);
GO

-- 5. Agregar columna RolId a Agentes
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Agentes]') AND name = 'RolId')
BEGIN
    ALTER TABLE [dbo].[Agentes]
    ADD [RolId] NVARCHAR(450) NULL;

    ALTER TABLE [dbo].[Agentes]
    ADD CONSTRAINT FK_Agentes_Rol FOREIGN KEY ([RolId])
        REFERENCES [dbo].[Roles]([Id]);

    CREATE INDEX IX_Agentes_RolId ON [dbo].[Agentes]([RolId]);
END
GO

-- 6. Agregar campos a AspNetUsers si existe la tabla
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND type in (N'U'))
BEGIN
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
END
GO

PRINT 'Tablas de Roles y Módulos creadas correctamente';
