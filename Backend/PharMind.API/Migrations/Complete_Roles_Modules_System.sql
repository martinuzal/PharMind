-- =============================================
-- Completar sistema de Roles y Módulos
-- =============================================

-- 1. Agregar columna Codigo a Modulos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Modulos]') AND name = 'Codigo')
BEGIN
    ALTER TABLE [dbo].[Modulos]
    ADD [Codigo] NVARCHAR(50) NOT NULL DEFAULT 'MOD_' + CAST(NEWID() AS NVARCHAR(50));

    -- Crear índice único
    ALTER TABLE [dbo].[Modulos]
    ADD CONSTRAINT UQ_Modulos_Codigo UNIQUE ([Codigo]);
END
GO

-- 2. Renombrar columna Orden a OrdenMenu en Modulos si existe
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Modulos]') AND name = 'Orden')
BEGIN
    EXEC sp_rename 'dbo.Modulos.Orden', 'OrdenMenu', 'COLUMN';
END
GO

-- 3. Agregar columna Codigo a Roles
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND name = 'Codigo')
BEGIN
    ALTER TABLE [dbo].[Roles]
    ADD [Codigo] NVARCHAR(50) NOT NULL DEFAULT 'ROL_' + CAST(NEWID() AS NVARCHAR(50));

    -- Crear índice único
    ALTER TABLE [dbo].[Roles]
    ADD CONSTRAINT UQ_Roles_Codigo UNIQUE ([Codigo]);
END
GO

-- 4. Crear tabla RolesModulos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolesModulos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RolesModulos] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT CAST(NEWID() AS NVARCHAR(450)),
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
            REFERENCES [dbo].[Modulos]([Id]) ON DELETE NO ACTION
    );

    CREATE INDEX IX_RolesModulos_RolId ON [dbo].[RolesModulos]([RolId]);
    CREATE INDEX IX_RolesModulos_ModuloId ON [dbo].[RolesModulos]([ModuloId]);
    CREATE UNIQUE INDEX UQ_RolesModulos_RolModulo ON [dbo].[RolesModulos]([RolId], [ModuloId]);
END
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

PRINT 'Sistema de Roles y Módulos completado correctamente';
