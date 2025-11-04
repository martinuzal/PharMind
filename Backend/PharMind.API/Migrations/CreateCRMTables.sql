-- ================================================
-- Migración: Crear tablas CRM/SFA (Agentes, Clientes, Relaciones, Interacciones)
-- Fecha: 2025-11-04
-- Descripción: Sistema completo de gestión de relaciones comerciales
-- ================================================

-- ========================================
-- 1. TABLA AGENTES (Representantes de ventas)
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Agentes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Agentes] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [CodigoAgente] NVARCHAR(50) NOT NULL UNIQUE,
        [Nombre] NVARCHAR(200) NOT NULL,
        [CodigoDistrito] NVARCHAR(50) NULL,
        [DistritoNombre] NVARCHAR(200) NULL,
        [CodigoLineaNegocio] NVARCHAR(50) NULL,
        [LineaNegocioNombre] NVARCHAR(200) NULL,
        [Email] NVARCHAR(200) NULL,
        [Telefono] NVARCHAR(50) NULL,
        [ZonaGeografica] NVARCHAR(100) NULL,
        [SupervisorId] NVARCHAR(450) NULL, -- FK a Usuarios
        [FechaIngreso] DATE NULL,
        [Estado] NVARCHAR(50) NOT NULL DEFAULT 'Activo',

        -- Campos de auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(255) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(255) NULL,
        [Status] BIT NOT NULL DEFAULT 0,

        -- Foreign Keys
        CONSTRAINT [FK_Agentes_Usuarios_SupervisorId] FOREIGN KEY ([SupervisorId])
            REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION
    );

    -- Índices para Agentes
    CREATE INDEX [IX_Agentes_CodigoAgente] ON [Agentes] ([CodigoAgente]);
    CREATE INDEX [IX_Agentes_CodigoDistrito] ON [Agentes] ([CodigoDistrito]);
    CREATE INDEX [IX_Agentes_CodigoLineaNegocio] ON [Agentes] ([CodigoLineaNegocio]);
    CREATE INDEX [IX_Agentes_SupervisorId] ON [Agentes] ([SupervisorId]);
    CREATE INDEX [IX_Agentes_Estado] ON [Agentes] ([Estado]);
    CREATE INDEX [IX_Agentes_Status] ON [Agentes] ([Status]);

    PRINT 'Tabla Agentes creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla Agentes ya existe';
END
GO

-- ========================================
-- 2. TABLA AUDITORIA_AGENTES (Historial de cambios)
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[AuditoriaAgentes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [AuditoriaAgentes] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [AgenteId] NVARCHAR(450) NOT NULL,
        [TipoOperacion] NVARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE'
        [CampoModificado] NVARCHAR(200) NULL,
        [ValorAnterior] NVARCHAR(MAX) NULL,
        [ValorNuevo] NVARCHAR(MAX) NULL,
        [Descripcion] NVARCHAR(1000) NULL,
        [FechaOperacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UsuarioOperacion] NVARCHAR(255) NOT NULL,
        [DireccionIP] NVARCHAR(50) NULL,

        CONSTRAINT [FK_AuditoriaAgentes_Agentes] FOREIGN KEY ([AgenteId])
            REFERENCES [Agentes] ([Id]) ON DELETE NO ACTION
    );

    CREATE INDEX [IX_AuditoriaAgentes_AgenteId] ON [AuditoriaAgentes] ([AgenteId]);
    CREATE INDEX [IX_AuditoriaAgentes_FechaOperacion] ON [AuditoriaAgentes] ([FechaOperacion]);
    CREATE INDEX [IX_AuditoriaAgentes_TipoOperacion] ON [AuditoriaAgentes] ([TipoOperacion]);

    PRINT 'Tabla AuditoriaAgentes creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla AuditoriaAgentes ya existe';
END
GO

-- ========================================
-- 3. TABLA CLIENTES (Médicos/Instituciones)
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Clientes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Clientes] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [CodigoCliente] NVARCHAR(50) NOT NULL UNIQUE,
        [TipoCliente] NVARCHAR(50) NOT NULL, -- 'Medico', 'Institucion'
        [RazonSocial] NVARCHAR(300) NOT NULL,
        [Especialidad] NVARCHAR(200) NULL,
        [Categoria] NVARCHAR(100) NULL,
        [Segmento] NVARCHAR(100) NULL,
        [InstitucionId] NVARCHAR(450) NULL, -- FK a Clientes (si es médico)
        [Email] NVARCHAR(200) NULL,
        [Telefono] NVARCHAR(50) NULL,
        [DireccionId] NVARCHAR(450) NULL, -- FK a Direcciones
        [Estado] NVARCHAR(50) NOT NULL DEFAULT 'Activo',

        -- Campos de auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(255) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(255) NULL,
        [Status] BIT NOT NULL DEFAULT 0,

        -- Foreign Keys
        CONSTRAINT [FK_Clientes_Clientes_InstitucionId] FOREIGN KEY ([InstitucionId])
            REFERENCES [Clientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Clientes_Direcciones_DireccionId] FOREIGN KEY ([DireccionId])
            REFERENCES [Direcciones] ([Id]) ON DELETE NO ACTION
    );

    -- Índices para Clientes
    CREATE INDEX [IX_Clientes_CodigoCliente] ON [Clientes] ([CodigoCliente]);
    CREATE INDEX [IX_Clientes_TipoCliente] ON [Clientes] ([TipoCliente]);
    CREATE INDEX [IX_Clientes_Categoria] ON [Clientes] ([Categoria]);
    CREATE INDEX [IX_Clientes_Segmento] ON [Clientes] ([Segmento]);
    CREATE INDEX [IX_Clientes_InstitucionId] ON [Clientes] ([InstitucionId]);
    CREATE INDEX [IX_Clientes_DireccionId] ON [Clientes] ([DireccionId]);
    CREATE INDEX [IX_Clientes_Estado] ON [Clientes] ([Estado]);
    CREATE INDEX [IX_Clientes_Status] ON [Clientes] ([Status]);

    PRINT 'Tabla Clientes creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla Clientes ya existe';
END
GO

-- ========================================
-- 4. TABLA RELACIONES (Agente-Clientes)
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Relaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Relaciones] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [CodigoRelacion] NVARCHAR(50) NOT NULL UNIQUE,
        [AgenteId] NVARCHAR(450) NOT NULL,
        [ClientePrincipalId] NVARCHAR(450) NOT NULL,
        [ClienteSecundario1Id] NVARCHAR(450) NULL,
        [ClienteSecundario2Id] NVARCHAR(450) NULL,
        [TipoRelacion] NVARCHAR(100) NULL,
        [FechaInicio] DATE NOT NULL,
        [FechaFin] DATE NULL,
        [Estado] NVARCHAR(50) NOT NULL DEFAULT 'Activa', -- 'Activa', 'Suspendida', 'Finalizada'
        [FrecuenciaVisitas] NVARCHAR(50) NULL, -- 'Semanal', 'Quincenal', 'Mensual'
        [Prioridad] NVARCHAR(50) NULL DEFAULT 'Media', -- 'Alta', 'Media', 'Baja'
        [Observaciones] NVARCHAR(2000) NULL,

        -- Campos de auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(255) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(255) NULL,
        [Status] BIT NOT NULL DEFAULT 0,

        -- Foreign Keys
        CONSTRAINT [FK_Relaciones_Agentes] FOREIGN KEY ([AgenteId])
            REFERENCES [Agentes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Relaciones_Clientes_Principal] FOREIGN KEY ([ClientePrincipalId])
            REFERENCES [Clientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Relaciones_Clientes_Secundario1] FOREIGN KEY ([ClienteSecundario1Id])
            REFERENCES [Clientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Relaciones_Clientes_Secundario2] FOREIGN KEY ([ClienteSecundario2Id])
            REFERENCES [Clientes] ([Id]) ON DELETE NO ACTION
    );

    -- Índices para Relaciones
    CREATE INDEX [IX_Relaciones_CodigoRelacion] ON [Relaciones] ([CodigoRelacion]);
    CREATE INDEX [IX_Relaciones_AgenteId] ON [Relaciones] ([AgenteId]);
    CREATE INDEX [IX_Relaciones_ClientePrincipalId] ON [Relaciones] ([ClientePrincipalId]);
    CREATE INDEX [IX_Relaciones_ClienteSecundario1Id] ON [Relaciones] ([ClienteSecundario1Id]);
    CREATE INDEX [IX_Relaciones_ClienteSecundario2Id] ON [Relaciones] ([ClienteSecundario2Id]);
    CREATE INDEX [IX_Relaciones_Estado] ON [Relaciones] ([Estado]);
    CREATE INDEX [IX_Relaciones_Prioridad] ON [Relaciones] ([Prioridad]);
    CREATE INDEX [IX_Relaciones_FechaInicio] ON [Relaciones] ([FechaInicio]);
    CREATE INDEX [IX_Relaciones_Status] ON [Relaciones] ([Status]);

    PRINT 'Tabla Relaciones creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla Relaciones ya existe';
END
GO

-- ========================================
-- 5. TABLA INTERACCIONES (Visitas, Llamadas, etc.)
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Interacciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Interacciones] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [CodigoInteraccion] NVARCHAR(50) NOT NULL UNIQUE,
        [RelacionId] NVARCHAR(450) NOT NULL,
        [AgenteId] NVARCHAR(450) NOT NULL, -- Desnormalizado para queries
        [ClienteId] NVARCHAR(450) NOT NULL, -- Desnormalizado para queries
        [TipoInteraccion] NVARCHAR(100) NOT NULL, -- 'Visita', 'Llamada', 'Email', 'Evento'
        [Fecha] DATETIME2 NOT NULL,
        [Turno] NVARCHAR(20) NULL, -- 'Mañana', 'Tarde', 'TodoElDia'
        [DuracionMinutos] INT NULL,
        [Resultado] NVARCHAR(100) NULL, -- 'Exitosa', 'NoContacto', 'Rechazada'
        [ObjetivoVisita] NVARCHAR(500) NULL,
        [ResumenVisita] NVARCHAR(2000) NULL,
        [ProximaAccion] NVARCHAR(500) NULL,
        [FechaProximaAccion] DATE NULL,
        [Latitud] DECIMAL(10, 7) NULL,
        [Longitud] DECIMAL(10, 7) NULL,
        [Observaciones] NVARCHAR(2000) NULL,

        -- Campos de auditoría
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(255) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(255) NULL,
        [Status] BIT NOT NULL DEFAULT 0,

        -- Foreign Keys
        CONSTRAINT [FK_Interacciones_Relaciones] FOREIGN KEY ([RelacionId])
            REFERENCES [Relaciones] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Interacciones_Agentes] FOREIGN KEY ([AgenteId])
            REFERENCES [Agentes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Interacciones_Clientes] FOREIGN KEY ([ClienteId])
            REFERENCES [Clientes] ([Id]) ON DELETE NO ACTION
    );

    -- Índices para Interacciones
    CREATE INDEX [IX_Interacciones_CodigoInteraccion] ON [Interacciones] ([CodigoInteraccion]);
    CREATE INDEX [IX_Interacciones_RelacionId] ON [Interacciones] ([RelacionId]);
    CREATE INDEX [IX_Interacciones_AgenteId] ON [Interacciones] ([AgenteId]);
    CREATE INDEX [IX_Interacciones_ClienteId] ON [Interacciones] ([ClienteId]);
    CREATE INDEX [IX_Interacciones_TipoInteraccion] ON [Interacciones] ([TipoInteraccion]);
    CREATE INDEX [IX_Interacciones_Fecha] ON [Interacciones] ([Fecha]);
    CREATE INDEX [IX_Interacciones_Turno] ON [Interacciones] ([Turno]);
    CREATE INDEX [IX_Interacciones_Resultado] ON [Interacciones] ([Resultado]);
    CREATE INDEX [IX_Interacciones_FechaProximaAccion] ON [Interacciones] ([FechaProximaAccion]);
    CREATE INDEX [IX_Interacciones_Status] ON [Interacciones] ([Status]);

    PRINT 'Tabla Interacciones creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla Interacciones ya existe';
END
GO

PRINT '========================================';
PRINT 'Migración completada exitosamente';
PRINT 'Tablas creadas: Agentes, AuditoriaAgentes, Clientes, Relaciones, Interacciones';
PRINT '========================================';
