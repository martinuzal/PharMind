-- =============================================
-- Script: Crear estructura jerárquica de Agentes
-- Descripción: Crea tablas para LineaNegocio, Region, Distrito, Agente y Manager
-- =============================================

-- 1. Tabla: LineasNegocio
CREATE TABLE [LineasNegocio] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [Codigo] NVARCHAR(50) NOT NULL,
    [Nombre] NVARCHAR(200) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [LegacyCode] NVARCHAR(100) NULL,
    [Legajo] NVARCHAR(100) NULL,
    [Color] NVARCHAR(20) NULL,
    [Icono] NVARCHAR(50) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Orden] INT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0
);

CREATE INDEX [IX_LineasNegocio_Codigo] ON [LineasNegocio] ([Codigo]);
CREATE INDEX [IX_LineasNegocio_Activo] ON [LineasNegocio] ([Activo]);
CREATE INDEX [IX_LineasNegocio_Status] ON [LineasNegocio] ([Status]);

-- 2. Tabla: Regiones
CREATE TABLE [Regiones] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [Codigo] NVARCHAR(50) NOT NULL,
    [Nombre] NVARCHAR(200) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [LegacyCode] NVARCHAR(100) NULL,
    [Legajo] NVARCHAR(100) NULL,
    [Color] NVARCHAR(20) NULL,
    [Icono] NVARCHAR(50) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Orden] INT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0
);

CREATE INDEX [IX_Regiones_Codigo] ON [Regiones] ([Codigo]);
CREATE INDEX [IX_Regiones_Activo] ON [Regiones] ([Activo]);
CREATE INDEX [IX_Regiones_Status] ON [Regiones] ([Status]);

-- 3. Tabla: Distritos
CREATE TABLE [Distritos] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [RegionId] NVARCHAR(450) NOT NULL,
    [Codigo] NVARCHAR(50) NOT NULL,
    [Nombre] NVARCHAR(200) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [LegacyCode] NVARCHAR(100) NULL,
    [Legajo] NVARCHAR(100) NULL,
    [Color] NVARCHAR(20) NULL,
    [Icono] NVARCHAR(50) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Orden] INT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_Distritos_Regiones_RegionId] FOREIGN KEY ([RegionId])
        REFERENCES [Regiones] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Distritos_RegionId] ON [Distritos] ([RegionId]);
CREATE INDEX [IX_Distritos_Codigo] ON [Distritos] ([Codigo]);
CREATE INDEX [IX_Distritos_Activo] ON [Distritos] ([Activo]);
CREATE INDEX [IX_Distritos_Status] ON [Distritos] ([Status]);

-- 4. Tabla: Agentes
CREATE TABLE [Agentes] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [UsuarioId] NVARCHAR(450) NOT NULL,
    [DistritoId] NVARCHAR(450) NOT NULL,
    [LineaNegocioId] NVARCHAR(450) NOT NULL,
    [Codigo] NVARCHAR(50) NOT NULL,
    [Nombre] NVARCHAR(200) NOT NULL,
    [Apellido] NVARCHAR(200) NULL,
    [Email] NVARCHAR(255) NULL,
    [Telefono] NVARCHAR(50) NULL,
    [FechaIngreso] DATETIME2 NULL,
    [LegacyCode] NVARCHAR(100) NULL,
    [Legajo] NVARCHAR(100) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Observaciones] NVARCHAR(1000) NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_Agentes_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId])
        REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Agentes_Distritos_DistritoId] FOREIGN KEY ([DistritoId])
        REFERENCES [Distritos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Agentes_LineasNegocio_LineaNegocioId] FOREIGN KEY ([LineaNegocioId])
        REFERENCES [LineasNegocio] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Agentes_UsuarioId] ON [Agentes] ([UsuarioId]);
CREATE INDEX [IX_Agentes_DistritoId] ON [Agentes] ([DistritoId]);
CREATE INDEX [IX_Agentes_LineaNegocioId] ON [Agentes] ([LineaNegocioId]);
CREATE INDEX [IX_Agentes_Codigo] ON [Agentes] ([Codigo]);
CREATE INDEX [IX_Agentes_Activo] ON [Agentes] ([Activo]);
CREATE INDEX [IX_Agentes_Status] ON [Agentes] ([Status]);

-- 5. Tabla: Managers
CREATE TABLE [Managers] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [UsuarioId] NVARCHAR(450) NOT NULL,
    [Codigo] NVARCHAR(50) NOT NULL,
    [Nombre] NVARCHAR(200) NOT NULL,
    [Apellido] NVARCHAR(200) NULL,
    [Email] NVARCHAR(255) NULL,
    [Telefono] NVARCHAR(50) NULL,
    [Cargo] NVARCHAR(100) NULL,
    [FechaIngreso] DATETIME2 NULL,
    [LegacyCode] NVARCHAR(100) NULL,
    [Legajo] NVARCHAR(100) NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Observaciones] NVARCHAR(1000) NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_Managers_Usuarios_UsuarioId] FOREIGN KEY ([UsuarioId])
        REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Managers_UsuarioId] ON [Managers] ([UsuarioId]);
CREATE INDEX [IX_Managers_Codigo] ON [Managers] ([Codigo]);
CREATE INDEX [IX_Managers_Activo] ON [Managers] ([Activo]);
CREATE INDEX [IX_Managers_Status] ON [Managers] ([Status]);

-- 6. Tabla de relación: ManagerRegiones (muchos-a-muchos)
CREATE TABLE [ManagerRegiones] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [ManagerId] NVARCHAR(450) NOT NULL,
    [RegionId] NVARCHAR(450) NOT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_ManagerRegiones_Managers_ManagerId] FOREIGN KEY ([ManagerId])
        REFERENCES [Managers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ManagerRegiones_Regiones_RegionId] FOREIGN KEY ([RegionId])
        REFERENCES [Regiones] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_ManagerRegiones_ManagerId] ON [ManagerRegiones] ([ManagerId]);
CREATE INDEX [IX_ManagerRegiones_RegionId] ON [ManagerRegiones] ([RegionId]);
CREATE INDEX [IX_ManagerRegiones_Status] ON [ManagerRegiones] ([Status]);

-- 7. Tabla de relación: ManagerDistritos (muchos-a-muchos)
CREATE TABLE [ManagerDistritos] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [ManagerId] NVARCHAR(450) NOT NULL,
    [DistritoId] NVARCHAR(450) NOT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_ManagerDistritos_Managers_ManagerId] FOREIGN KEY ([ManagerId])
        REFERENCES [Managers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ManagerDistritos_Distritos_DistritoId] FOREIGN KEY ([DistritoId])
        REFERENCES [Distritos] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_ManagerDistritos_ManagerId] ON [ManagerDistritos] ([ManagerId]);
CREATE INDEX [IX_ManagerDistritos_DistritoId] ON [ManagerDistritos] ([DistritoId]);
CREATE INDEX [IX_ManagerDistritos_Status] ON [ManagerDistritos] ([Status]);

-- 8. Tabla de relación: ManagerLineasNegocio (muchos-a-muchos)
CREATE TABLE [ManagerLineasNegocio] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [ManagerId] NVARCHAR(450) NOT NULL,
    [LineaNegocioId] NVARCHAR(450) NOT NULL,
    [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreadoPor] NVARCHAR(255) NULL,
    [FechaModificacion] DATETIME2 NULL,
    [ModificadoPor] NVARCHAR(255) NULL,
    [Status] BIT NULL DEFAULT 0,
    CONSTRAINT [FK_ManagerLineasNegocio_Managers_ManagerId] FOREIGN KEY ([ManagerId])
        REFERENCES [Managers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ManagerLineasNegocio_LineasNegocio_LineaNegocioId] FOREIGN KEY ([LineaNegocioId])
        REFERENCES [LineasNegocio] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_ManagerLineasNegocio_ManagerId] ON [ManagerLineasNegocio] ([ManagerId]);
CREATE INDEX [IX_ManagerLineasNegocio_LineaNegocioId] ON [ManagerLineasNegocio] ([LineaNegocioId]);
CREATE INDEX [IX_ManagerLineasNegocio_Status] ON [ManagerLineasNegocio] ([Status]);

-- =============================================
-- Fin del script
-- =============================================
