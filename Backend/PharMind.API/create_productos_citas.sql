-- Tabla Productos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Productos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Productos](
        [Id] [nvarchar](450) NOT NULL,
        [CodigoProducto] [nvarchar](50) NOT NULL,
        [Nombre] [nvarchar](200) NOT NULL,
        [NombreComercial] [nvarchar](200) NULL,
        [Descripcion] [nvarchar](1000) NULL,
        [Presentacion] [nvarchar](100) NULL,
        [Categoria] [nvarchar](100) NULL,
        [Laboratorio] [nvarchar](200) NULL,
        [PrincipioActivo] [nvarchar](500) NULL,
        [Concentracion] [nvarchar](100) NULL,
        [ViaAdministracion] [nvarchar](50) NULL,
        [Indicaciones] [nvarchar](2000) NULL,
        [Contraindicaciones] [nvarchar](2000) NULL,
        [PrecioReferencia] [decimal](18, 2) NULL,
        [ImagenUrl] [nvarchar](500) NULL,
        [Activo] [bit] NOT NULL DEFAULT 1,
        [EsMuestra] [bit] NOT NULL DEFAULT 0,
        [RequiereReceta] [bit] NOT NULL DEFAULT 0,
        [LineaNegocioId] [nvarchar](450) NULL,
        [FechaCreacion] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [CreadoPor] [nvarchar](255) NULL,
        [FechaModificacion] [datetime2](7) NULL,
        [ModificadoPor] [nvarchar](255) NULL,
        [Status] [bit] NULL DEFAULT 0,
        CONSTRAINT [PK_Productos] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Productos_LineasNegocio] FOREIGN KEY([LineaNegocioId])
            REFERENCES [dbo].[LineasNegocio] ([Id])
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Productos_CodigoProducto] ON [dbo].[Productos]([CodigoProducto] ASC);
    PRINT 'Tabla Productos creada';
END
GO

-- Tabla InventariosAgente
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[InventariosAgente]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[InventariosAgente](
        [Id] [nvarchar](450) NOT NULL,
        [AgenteId] [nvarchar](450) NOT NULL,
        [ProductoId] [nvarchar](450) NOT NULL,
        [CantidadDisponible] [int] NOT NULL DEFAULT 0,
        [CantidadInicial] [int] NULL,
        [CantidadEntregada] [int] NOT NULL DEFAULT 0,
        [FechaUltimaRecarga] [datetime2](7) NULL,
        [LoteActual] [nvarchar](50) NULL,
        [FechaVencimiento] [datetime2](7) NULL,
        [Observaciones] [nvarchar](500) NULL,
        [FechaCreacion] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [CreadoPor] [nvarchar](255) NULL,
        [FechaModificacion] [datetime2](7) NULL,
        [ModificadoPor] [nvarchar](255) NULL,
        [Status] [bit] NULL DEFAULT 0,
        CONSTRAINT [PK_InventariosAgente] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_InventariosAgente_Agentes] FOREIGN KEY([AgenteId])
            REFERENCES [dbo].[Agentes] ([Id]),
        CONSTRAINT [FK_InventariosAgente_Productos] FOREIGN KEY([ProductoId])
            REFERENCES [dbo].[Productos] ([Id])
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_InventariosAgente_AgenteId_ProductoId]
        ON [dbo].[InventariosAgente]([AgenteId] ASC, [ProductoId] ASC);
    PRINT 'Tabla InventariosAgente creada';
END
GO

-- Tabla MuestrasMedicas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MuestrasMedicas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MuestrasMedicas](
        [Id] [nvarchar](450) NOT NULL,
        [InteraccionId] [nvarchar](450) NOT NULL,
        [ProductoId] [nvarchar](450) NOT NULL,
        [AgenteId] [nvarchar](450) NOT NULL,
        [ClienteId] [nvarchar](450) NOT NULL,
        [Cantidad] [int] NOT NULL,
        [Lote] [nvarchar](50) NULL,
        [FechaVencimiento] [datetime2](7) NULL,
        [FechaEntrega] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [Observaciones] [nvarchar](500) NULL,
        [FirmaDigital] [nvarchar](1000) NULL,
        [FotoComprobante] [nvarchar](1000) NULL,
        [FechaCreacion] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [CreadoPor] [nvarchar](255) NULL,
        [FechaModificacion] [datetime2](7) NULL,
        [ModificadoPor] [nvarchar](255) NULL,
        [Status] [bit] NULL DEFAULT 0,
        CONSTRAINT [PK_MuestrasMedicas] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_MuestrasMedicas_Interacciones] FOREIGN KEY([InteraccionId])
            REFERENCES [dbo].[Interacciones] ([Id]),
        CONSTRAINT [FK_MuestrasMedicas_Productos] FOREIGN KEY([ProductoId])
            REFERENCES [dbo].[Productos] ([Id]),
        CONSTRAINT [FK_MuestrasMedicas_Agentes] FOREIGN KEY([AgenteId])
            REFERENCES [dbo].[Agentes] ([Id]),
        CONSTRAINT [FK_MuestrasMedicas_Clientes] FOREIGN KEY([ClienteId])
            REFERENCES [dbo].[Clientes] ([Id])
    );
    PRINT 'Tabla MuestrasMedicas creada';
END
GO

-- Tabla MovimientosInventario
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MovimientosInventario]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MovimientosInventario](
        [Id] [nvarchar](450) NOT NULL,
        [InventarioAgenteId] [nvarchar](450) NOT NULL,
        [TipoMovimiento] [nvarchar](20) NOT NULL,
        [Cantidad] [int] NOT NULL,
        [CantidadAnterior] [int] NOT NULL,
        [CantidadNueva] [int] NOT NULL,
        [MuestraMedicaId] [nvarchar](450) NULL,
        [Motivo] [nvarchar](200) NULL,
        [Observaciones] [nvarchar](500) NULL,
        [FechaMovimiento] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [FechaCreacion] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [CreadoPor] [nvarchar](255) NULL,
        [FechaModificacion] [datetime2](7) NULL,
        [ModificadoPor] [nvarchar](255) NULL,
        [Status] [bit] NULL DEFAULT 0,
        CONSTRAINT [PK_MovimientosInventario] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_MovimientosInventario_InventariosAgente] FOREIGN KEY([InventarioAgenteId])
            REFERENCES [dbo].[InventariosAgente] ([Id]),
        CONSTRAINT [FK_MovimientosInventario_MuestrasMedicas] FOREIGN KEY([MuestraMedicaId])
            REFERENCES [dbo].[MuestrasMedicas] ([Id])
    );
    PRINT 'Tabla MovimientosInventario creada';
END
GO

-- Tabla Citas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Citas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Citas](
        [Id] [nvarchar](450) NOT NULL,
        [CodigoCita] [nvarchar](50) NOT NULL,
        [AgenteId] [nvarchar](450) NOT NULL,
        [RelacionId] [nvarchar](450) NULL,
        [ClienteId] [nvarchar](450) NULL,
        [InteraccionId] [nvarchar](450) NULL,
        [Titulo] [nvarchar](200) NOT NULL,
        [Descripcion] [nvarchar](1000) NULL,
        [FechaInicio] [datetime2](7) NOT NULL,
        [FechaFin] [datetime2](7) NOT NULL,
        [TodoElDia] [bit] NOT NULL DEFAULT 0,
        [TipoCita] [nvarchar](50) NULL,
        [Estado] [nvarchar](50) NOT NULL DEFAULT 'Programada',
        [Prioridad] [nvarchar](20) NULL,
        [Ubicacion] [nvarchar](500) NULL,
        [Latitud] [decimal](10, 7) NULL,
        [Longitud] [decimal](10, 7) NULL,
        [Color] [nvarchar](20) NULL,
        [Recordatorio] [bit] NOT NULL DEFAULT 1,
        [MinutosAntes] [int] NOT NULL DEFAULT 30,
        [Notas] [nvarchar](2000) NULL,
        [Orden] [int] NULL,
        [DistanciaKm] [decimal](10, 2) NULL,
        [TiempoEstimadoMinutos] [int] NULL,
        [FechaCreacion] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [CreadoPor] [nvarchar](255) NULL,
        [FechaModificacion] [datetime2](7) NULL,
        [ModificadoPor] [nvarchar](255) NULL,
        [Status] [bit] NULL DEFAULT 0,
        CONSTRAINT [PK_Citas] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Citas_Agentes] FOREIGN KEY([AgenteId])
            REFERENCES [dbo].[Agentes] ([Id]),
        CONSTRAINT [FK_Citas_Relaciones] FOREIGN KEY([RelacionId])
            REFERENCES [dbo].[Relaciones] ([Id]),
        CONSTRAINT [FK_Citas_Clientes] FOREIGN KEY([ClienteId])
            REFERENCES [dbo].[Clientes] ([Id]),
        CONSTRAINT [FK_Citas_Interacciones] FOREIGN KEY([InteraccionId])
            REFERENCES [dbo].[Interacciones] ([Id])
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Citas_CodigoCita] ON [dbo].[Citas]([CodigoCita] ASC);
    PRINT 'Tabla Citas creada';
END
GO

PRINT 'Script completado - Tablas de Productos, Inventario, Muestras y Citas creadas';
