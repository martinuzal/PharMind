-- ================================================
-- Migración: Sistema de Direcciones Normalizadas
-- Fecha: 2025-11-05
-- Descripción: Crea estructura completa para manejo de direcciones
--              con normalización geográfica y soporte multi-país
-- ================================================

BEGIN TRANSACTION;

BEGIN TRY
    -- ============================================
    -- 1. TABLA DE PAÍSES
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Paises]') AND type = 'U')
    BEGIN
        CREATE TABLE [Paises] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [Codigo] NVARCHAR(3) UNIQUE NOT NULL,
            [Nombre] NVARCHAR(100) NOT NULL,
            [NombreLocal] NVARCHAR(100),
            [Activo] BIT DEFAULT 1
        );
        PRINT 'Tabla Paises creada';
    END
    ELSE
        PRINT 'Tabla Paises ya existe';

    -- ============================================
    -- 2. TABLA DE PROVINCIAS/ESTADOS
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[ProvinciasEstados]') AND type = 'U')
    BEGIN
        CREATE TABLE [ProvinciasEstados] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [PaisId] INT NOT NULL,
            [Codigo] NVARCHAR(10) NOT NULL,
            [Nombre] NVARCHAR(100) NOT NULL,
            [NombreCompleto] NVARCHAR(200),
            [Activo] BIT DEFAULT 1,
            FOREIGN KEY ([PaisId]) REFERENCES [Paises]([Id]),
            INDEX IX_ProvinciasEstados_Pais ([PaisId])
        );
        PRINT 'Tabla ProvinciasEstados creada';
    END
    ELSE
        PRINT 'Tabla ProvinciasEstados ya existe';

    -- ============================================
    -- 3. TABLA DE DEPARTAMENTOS/PARTIDOS
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Departamentos]') AND type = 'U')
    BEGIN
        CREATE TABLE [Departamentos] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [ProvinciaEstadoId] INT NOT NULL,
            [Codigo] NVARCHAR(20),
            [Nombre] NVARCHAR(100) NOT NULL,
            [Activo] BIT DEFAULT 1,
            FOREIGN KEY ([ProvinciaEstadoId]) REFERENCES [ProvinciasEstados]([Id]),
            INDEX IX_Departamentos_Provincia ([ProvinciaEstadoId])
        );
        PRINT 'Tabla Departamentos creada';
    END
    ELSE
        PRINT 'Tabla Departamentos ya existe';

    -- ============================================
    -- 4. TABLA DE LOCALIDADES/CIUDADES
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Localidades]') AND type = 'U')
    BEGIN
        CREATE TABLE [Localidades] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [DepartamentoId] INT NOT NULL,
            [Nombre] NVARCHAR(100) NOT NULL,
            [CodigoPostal] NVARCHAR(20),
            [Latitud] DECIMAL(10, 8),
            [Longitud] DECIMAL(11, 8),
            [Activo] BIT DEFAULT 1,
            FOREIGN KEY ([DepartamentoId]) REFERENCES [Departamentos]([Id]),
            INDEX IX_Localidades_Departamento ([DepartamentoId]),
            INDEX IX_Localidades_CodigoPostal ([CodigoPostal])
        );
        PRINT 'Tabla Localidades creada';
    END
    ELSE
        PRINT 'Tabla Localidades ya existe';

    -- ============================================
    -- 5. TABLA DE CÓDIGOS POSTALES
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CodigosPostales]') AND type = 'U')
    BEGIN
        CREATE TABLE [CodigosPostales] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [LocalidadId] INT NOT NULL,
            [CodigoPostal] NVARCHAR(20) UNIQUE NOT NULL,
            [TipoCP] NVARCHAR(50),
            [Barrio] NVARCHAR(100),
            [Latitud] DECIMAL(10, 8),
            [Longitud] DECIMAL(11, 8),
            [Activo] BIT DEFAULT 1,
            FOREIGN KEY ([LocalidadId]) REFERENCES [Localidades]([Id]),
            INDEX IX_CodigosPostales_Localidad ([LocalidadId])
        );
        PRINT 'Tabla CodigosPostales creada';
    END
    ELSE
        PRINT 'Tabla CodigosPostales ya existe';

    -- ============================================
    -- 6. TABLA DE CALLES NORMALIZADAS
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Calles]') AND type = 'U')
    BEGIN
        CREATE TABLE [Calles] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [LocalidadId] INT NOT NULL,
            [Nombre] NVARCHAR(200) NOT NULL,
            [NombreNormalizado] NVARCHAR(200) NOT NULL,
            [Tipo] NVARCHAR(50),
            [AlturaDesde] INT,
            [AlturaHasta] INT,
            [Activo] BIT DEFAULT 1,
            FOREIGN KEY ([LocalidadId]) REFERENCES [Localidades]([Id]),
            INDEX IX_Calles_Localidad ([LocalidadId]),
            INDEX IX_Calles_NombreNormalizado ([NombreNormalizado])
        );
        PRINT 'Tabla Calles creada';
    END
    ELSE
        PRINT 'Tabla Calles ya existe';

    -- ============================================
    -- 7. TABLA DE RELACIÓN CALLE-CP
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[CalleCodigoPostal]') AND type = 'U')
    BEGIN
        CREATE TABLE [CalleCodigoPostal] (
            [Id] INT PRIMARY KEY IDENTITY(1,1),
            [CalleId] INT NOT NULL,
            [CodigoPostalId] INT NOT NULL,
            [AlturaDesde] INT,
            [AlturaHasta] INT,
            [Lado] NVARCHAR(10),
            FOREIGN KEY ([CalleId]) REFERENCES [Calles]([Id]),
            FOREIGN KEY ([CodigoPostalId]) REFERENCES [CodigosPostales]([Id]),
            INDEX IX_CalleCodigoPostal_Calle ([CalleId]),
            INDEX IX_CalleCodigoPostal_CP ([CodigoPostalId])
        );
        PRINT 'Tabla CalleCodigoPostal creada';
    END
    ELSE
        PRINT 'Tabla CalleCodigoPostal ya existe';

    -- ============================================
    -- 8. TABLA DE DIRECCIONES
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Direcciones]') AND type = 'U')
    BEGIN
        CREATE TABLE [Direcciones] (
            [Id] NVARCHAR(450) PRIMARY KEY,

            -- Referencias a datos normalizados
            [PaisId] INT NOT NULL,
            [ProvinciaEstadoId] INT NOT NULL,
            [DepartamentoId] INT,
            [LocalidadId] INT NOT NULL,
            [CodigoPostalId] INT NOT NULL,
            [CalleId] INT,

            -- Datos de la dirección
            [CalleNombre] NVARCHAR(200),
            [Altura] INT,
            [Piso] NVARCHAR(20),
            [Departamento] NVARCHAR(20),
            [Torre] NVARCHAR(20),
            [Manzana] NVARCHAR(50),
            [Lote] NVARCHAR(50),

            -- Datos adicionales (JSON)
            [DatosAdicionales] NVARCHAR(MAX),

            -- Dirección formateada
            [DireccionCompleta] NVARCHAR(500),

            -- Coordenadas
            [Latitud] DECIMAL(10, 8),
            [Longitud] DECIMAL(11, 8),
            [PrecisionGeografica] NVARCHAR(50),

            -- Validación
            [Validada] BIT DEFAULT 0,
            [FechaValidacion] DATETIME2,
            [FuenteValidacion] NVARCHAR(100),

            -- Metadatos
            [FechaCreacion] DATETIME2 DEFAULT GETDATE(),
            [FechaModificacion] DATETIME2,
            [Activa] BIT DEFAULT 1,

            FOREIGN KEY ([PaisId]) REFERENCES [Paises]([Id]),
            FOREIGN KEY ([ProvinciaEstadoId]) REFERENCES [ProvinciasEstados]([Id]),
            FOREIGN KEY ([DepartamentoId]) REFERENCES [Departamentos]([Id]),
            FOREIGN KEY ([LocalidadId]) REFERENCES [Localidades]([Id]),
            FOREIGN KEY ([CodigoPostalId]) REFERENCES [CodigosPostales]([Id]),
            FOREIGN KEY ([CalleId]) REFERENCES [Calles]([Id]),

            INDEX IX_Direcciones_CP ([CodigoPostalId]),
            INDEX IX_Direcciones_Localidad ([LocalidadId]),
            INDEX IX_Direcciones_Provincia ([ProvinciaEstadoId])
        );
        PRINT 'Tabla Direcciones creada';
    END
    ELSE
        PRINT 'Tabla Direcciones ya existe';

    -- ============================================
    -- 9. TABLA DE RELACIÓN ENTIDAD-DIRECCIÓN
    -- ============================================
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EntidadDireccion]') AND type = 'U')
    BEGIN
        CREATE TABLE [EntidadDireccion] (
            [Id] NVARCHAR(450) PRIMARY KEY,
            [DireccionId] NVARCHAR(450) NOT NULL,

            -- Entidad relacionada (polimórfica)
            [EntidadTipo] NVARCHAR(50) NOT NULL,
            [EntidadId] NVARCHAR(450) NOT NULL,

            -- Tipo de dirección
            [TipoDireccion] NVARCHAR(50),
            [EsPrincipal] BIT DEFAULT 0,

            -- Metadatos
            [FechaAsignacion] DATETIME2 DEFAULT GETDATE(),
            [Activa] BIT DEFAULT 1,

            FOREIGN KEY ([DireccionId]) REFERENCES [Direcciones]([Id]),
            INDEX IX_EntidadDireccion_Entidad ([EntidadTipo], [EntidadId]),
            INDEX IX_EntidadDireccion_Principal ([EntidadTipo], [EntidadId], [EsPrincipal])
        );
        PRINT 'Tabla EntidadDireccion creada';
    END
    ELSE
        PRINT 'Tabla EntidadDireccion ya existe';

    COMMIT TRANSACTION;
    PRINT 'Migración completada exitosamente: Sistema de Direcciones creado';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT 'Error durante la migración: ' + @ErrorMessage;
    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;
GO
