-- =============================================
-- Corregir asignación de Roles: deben estar en Usuarios, no en Agentes
-- =============================================

-- 1. Eliminar RolId de Agentes si existe
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Agentes]') AND name = 'RolId')
BEGIN
    -- Primero eliminar el constraint foreign key
    DECLARE @ConstraintName NVARCHAR(200);
    SELECT @ConstraintName = name
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('Agentes')
    AND referenced_object_id = OBJECT_ID('Roles');

    IF @ConstraintName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE [dbo].[Agentes] DROP CONSTRAINT ' + @ConstraintName);
    END

    -- Eliminar el índice si existe
    IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Agentes]') AND name = 'IX_Agentes_RolId')
    BEGIN
        DROP INDEX IX_Agentes_RolId ON [dbo].[Agentes];
    END

    -- Eliminar la columna
    ALTER TABLE [dbo].[Agentes] DROP COLUMN [RolId];

    PRINT 'RolId eliminado de tabla Agentes';
END
GO

-- 2. Agregar RolId a Usuarios
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND name = 'RolId')
BEGIN
    ALTER TABLE [dbo].[Usuarios]
    ADD [RolId] NVARCHAR(450) NULL;

    ALTER TABLE [dbo].[Usuarios]
    ADD CONSTRAINT FK_Usuarios_Rol FOREIGN KEY ([RolId])
        REFERENCES [dbo].[Roles]([Id]);

    CREATE INDEX IX_Usuarios_RolId ON [dbo].[Usuarios]([RolId]);

    PRINT 'RolId agregado a tabla Usuarios';
END
GO

-- 3. Agregar AgenteId a Usuarios (para vincular usuario con agente)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND name = 'AgenteId')
BEGIN
    ALTER TABLE [dbo].[Usuarios]
    ADD [AgenteId] NVARCHAR(450) NULL;

    ALTER TABLE [dbo].[Usuarios]
    ADD CONSTRAINT FK_Usuarios_Agente FOREIGN KEY ([AgenteId])
        REFERENCES [dbo].[Agentes]([Id]);

    CREATE INDEX IX_Usuarios_AgenteId ON [dbo].[Usuarios]([AgenteId]);

    PRINT 'AgenteId agregado a tabla Usuarios';
END
GO

-- 4. Agregar campo EsAdministrador a Usuarios
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND name = 'EsAdministrador')
BEGIN
    ALTER TABLE [dbo].[Usuarios]
    ADD [EsAdministrador] BIT NOT NULL DEFAULT 0;

    PRINT 'EsAdministrador agregado a tabla Usuarios';
END
GO

PRINT 'Asignación de roles corregida: ahora los roles están en Usuarios';
