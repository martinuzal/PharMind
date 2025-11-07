-- ================================================
-- Script: Datos de Prueba - Direcciones Argentina
-- Fecha: 2025-11-05
-- Descripción: Carga datos geográficos normalizados de Argentina
--              para testing del sistema de direcciones
-- ================================================

BEGIN TRANSACTION;

BEGIN TRY
    PRINT 'Iniciando carga de datos geográficos de Argentina...';

    -- ============================================
    -- 1. INSERTAR PAÍS: ARGENTINA
    -- ============================================
    IF NOT EXISTS (SELECT * FROM Paises WHERE Codigo = 'ARG')
    BEGIN
        INSERT INTO Paises (Codigo, Nombre, NombreLocal, Activo)
        VALUES ('ARG', 'Argentina', 'Argentina', 1);
        PRINT 'País Argentina insertado';
    END

    DECLARE @PaisArgId INT = (SELECT Id FROM Paises WHERE Codigo = 'ARG');

    -- ============================================
    -- 2. INSERTAR PROVINCIAS ARGENTINAS
    -- ============================================
    IF NOT EXISTS (SELECT * FROM ProvinciasEstados WHERE Codigo = 'CABA' AND PaisId = @PaisArgId)
    BEGIN
        INSERT INTO ProvinciasEstados (PaisId, Codigo, Nombre, NombreCompleto, Activo)
        VALUES
        (@PaisArgId, 'CABA', 'CABA', 'Ciudad Autónoma de Buenos Aires', 1),
        (@PaisArgId, 'BA', 'Buenos Aires', 'Provincia de Buenos Aires', 1),
        (@PaisArgId, 'CBA', 'Córdoba', 'Provincia de Córdoba', 1),
        (@PaisArgId, 'SF', 'Santa Fe', 'Provincia de Santa Fe', 1),
        (@PaisArgId, 'MZA', 'Mendoza', 'Provincia de Mendoza', 1),
        (@PaisArgId, 'TUC', 'Tucumán', 'Provincia de Tucumán', 1),
        (@PaisArgId, 'ER', 'Entre Ríos', 'Provincia de Entre Ríos', 1),
        (@PaisArgId, 'SAL', 'Salta', 'Provincia de Salta', 1),
        (@PaisArgId, 'CHA', 'Chaco', 'Provincia del Chaco', 1),
        (@PaisArgId, 'COR', 'Corrientes', 'Provincia de Corrientes', 1);

        PRINT '10 Provincias argentinas insertadas';
    END

    -- ============================================
    -- 3. INSERTAR DEPARTAMENTOS/PARTIDOS
    -- ============================================
    DECLARE @CABAId INT = (SELECT Id FROM ProvinciasEstados WHERE Codigo = 'CABA' AND PaisId = @PaisArgId);
    DECLARE @BAId INT = (SELECT Id FROM ProvinciasEstados WHERE Codigo = 'BA' AND PaisId = @PaisArgId);
    DECLARE @CBAId INT = (SELECT Id FROM ProvinciasEstados WHERE Codigo = 'CBA' AND PaisId = @PaisArgId);
    DECLARE @SFId INT = (SELECT Id FROM ProvinciasEstados WHERE Codigo = 'SF' AND PaisId = @PaisArgId);

    IF NOT EXISTS (SELECT * FROM Departamentos WHERE Codigo = 'COMUNA1' AND ProvinciaEstadoId = @CABAId)
    BEGIN
        INSERT INTO Departamentos (ProvinciaEstadoId, Codigo, Nombre, Activo)
        VALUES
        -- CABA - Comunas
        (@CABAId, 'COMUNA1', 'Comuna 1', 1),
        (@CABAId, 'COMUNA2', 'Comuna 2', 1),
        (@CABAId, 'COMUNA3', 'Comuna 3', 1),
        (@CABAId, 'COMUNA4', 'Comuna 4', 1),
        (@CABAId, 'COMUNA5', 'Comuna 5', 1),

        -- Buenos Aires - Partidos principales
        (@BAId, 'LAPLATA', 'La Plata', 1),
        (@BAId, 'VICENTE_LOPEZ', 'Vicente López', 1),
        (@BAId, 'SAN_ISIDRO', 'San Isidro', 1),
        (@BAId, 'TIGRE', 'Tigre', 1),
        (@BAId, 'PILAR', 'Pilar', 1),

        -- Córdoba
        (@CBAId, 'CAPITAL', 'Capital', 1),
        (@CBAId, 'COLON', 'Colón', 1),

        -- Santa Fe
        (@SFId, 'LA_CAPITAL', 'La Capital', 1),
        (@SFId, 'ROSARIO', 'Rosario', 1);

        PRINT 'Departamentos/Partidos insertados';
    END

    -- ============================================
    -- 4. INSERTAR LOCALIDADES PRINCIPALES
    -- ============================================
    DECLARE @Comuna1Id INT = (SELECT Id FROM Departamentos WHERE Codigo = 'COMUNA1');
    DECLARE @Comuna2Id INT = (SELECT Id FROM Departamentos WHERE Codigo = 'COMUNA2');
    DECLARE @Comuna3Id INT = (SELECT Id FROM Departamentos WHERE Codigo = 'COMUNA3');
    DECLARE @LaPlataId INT = (SELECT Id FROM Departamentos WHERE Codigo = 'LAPLATA');
    DECLARE @VicenteLopezId INT = (SELECT Id FROM Departamentos WHERE Codigo = 'VICENTE_LOPEZ');
    DECLARE @CapitalCbaId INT = (SELECT Id FROM Departamentos WHERE Codigo = 'CAPITAL' AND ProvinciaEstadoId = @CBAId);
    DECLARE @RosarioDepId INT = (SELECT Id FROM Departamentos WHERE Codigo = 'ROSARIO');

    IF NOT EXISTS (SELECT * FROM Localidades WHERE Nombre = 'Retiro' AND DepartamentoId = @Comuna1Id)
    BEGIN
        INSERT INTO Localidades (DepartamentoId, Nombre, CodigoPostal, Latitud, Longitud, Activo)
        VALUES
        -- CABA - Comuna 1
        (@Comuna1Id, 'Retiro', 'C1001', -34.5922, -58.3744, 1),
        (@Comuna1Id, 'San Nicolás', 'C1002', -34.6037, -58.3816, 1),
        (@Comuna1Id, 'Puerto Madero', 'C1107', -34.6131, -58.3636, 1),

        -- CABA - Comuna 2
        (@Comuna2Id, 'Recoleta', 'C1113', -34.5875, -58.3974, 1),

        -- CABA - Comuna 3
        (@Comuna3Id, 'Balvanera', 'C1200', -34.6099, -58.3997, 1),
        (@Comuna3Id, 'San Cristóbal', 'C1204', -34.6226, -58.3987, 1),

        -- Buenos Aires
        (@LaPlataId, 'La Plata', 'B1900', -34.9214, -57.9544, 1),
        (@VicenteLopezId, 'Vicente López', 'B1638', -34.5266, -58.4778, 1),

        -- Córdoba
        (@CapitalCbaId, 'Córdoba', 'X5000', -31.4201, -64.1888, 1),

        -- Santa Fe
        (@RosarioDepId, 'Rosario', 'S2000', -32.9442, -60.6505, 1);

        PRINT 'Localidades principales insertadas';
    END

    -- ============================================
    -- 5. INSERTAR CÓDIGOS POSTALES
    -- ============================================
    DECLARE @RetiroId INT = (SELECT Id FROM Localidades WHERE Nombre = 'Retiro' AND CodigoPostal = 'C1001');
    DECLARE @RecoletaId INT = (SELECT Id FROM Localidades WHERE Nombre = 'Recoleta');
    DECLARE @BalvaneraId INT = (SELECT Id FROM Localidades WHERE Nombre = 'Balvanera');
    DECLARE @PuertoMaderoId INT = (SELECT Id FROM Localidades WHERE Nombre = 'Puerto Madero');

    IF NOT EXISTS (SELECT * FROM CodigosPostales WHERE CodigoPostal = 'C1001AAA')
    BEGIN
        INSERT INTO CodigosPostales (LocalidadId, CodigoPostal, TipoCP, Barrio, Latitud, Longitud, Activo)
        VALUES
        -- Retiro
        (@RetiroId, 'C1001AAA', 'CPA', 'Retiro', -34.5922, -58.3744, 1),
        (@RetiroId, 'C1002AAA', 'CPA', 'San Nicolás', -34.6037, -58.3816, 1),

        -- Puerto Madero
        (@PuertoMaderoId, 'C1107AAA', 'CPA', 'Puerto Madero', -34.6131, -58.3636, 1),

        -- Recoleta
        (@RecoletaId, 'C1113AAA', 'CPA', 'Recoleta', -34.5875, -58.3974, 1),
        (@RecoletaId, 'C1114AAA', 'CPA', 'Recoleta', -34.5889, -58.4012, 1),

        -- Balvanera
        (@BalvaneraId, 'C1200AAA', 'CPA', 'Balvanera', -34.6099, -58.3997, 1),
        (@BalvaneraId, 'C1201AAA', 'CPA', 'Balvanera', -34.6105, -58.4010, 1);

        PRINT 'Códigos postales insertados';
    END

    -- ============================================
    -- 6. INSERTAR CALLES NORMALIZADAS
    -- ============================================
    IF NOT EXISTS (SELECT * FROM Calles WHERE Nombre = 'Av. Corrientes' AND LocalidadId = @BalvaneraId)
    BEGIN
        INSERT INTO Calles (LocalidadId, Nombre, NombreNormalizado, Tipo, AlturaDesde, AlturaHasta, Activo)
        VALUES
        -- Balvanera
        (@BalvaneraId, 'Av. Corrientes', 'CORRIENTES', 'Avenida', 1, 6000, 1),
        (@BalvaneraId, 'Av. Callao', 'CALLAO', 'Avenida', 1, 2000, 1),
        (@BalvaneraId, 'Av. Rivadavia', 'RIVADAVIA', 'Avenida', 1, 10000, 1),
        (@BalvaneraId, 'Pueyrredón', 'PUEYRREDON', 'Avenida', 1, 2000, 1),

        -- Recoleta
        (@RecoletaId, 'Av. Santa Fe', 'SANTA FE', 'Avenida', 1000, 5000, 1),
        (@RecoletaId, 'Av. Las Heras', 'LAS HERAS', 'Avenida', 1, 4000, 1),
        (@RecoletaId, 'Av. del Libertador', 'LIBERTADOR', 'Avenida', 1, 8000, 1),

        -- Retiro
        (@RetiroId, 'Av. 9 de Julio', '9 DE JULIO', 'Avenida', 1, 2000, 1),
        (@RetiroId, 'Av. Leandro N. Alem', 'LEANDRO N ALEM', 'Avenida', 1, 2000, 1),

        -- Puerto Madero
        (@PuertoMaderoId, 'Juana Manso', 'JUANA MANSO', 'Calle', 1, 2000, 1),
        (@PuertoMaderoId, 'Av. Alicia Moreau de Justo', 'ALICIA MOREAU DE JUSTO', 'Avenida', 1, 3000, 1);

        PRINT 'Calles normalizadas insertadas';
    END

    -- ============================================
    -- 7. INSERTAR RELACIONES CALLE-CP
    -- ============================================
    DECLARE @CalleCorreintesId INT = (SELECT Id FROM Calles WHERE Nombre = 'Av. Corrientes' AND LocalidadId = @BalvaneraId);
    DECLARE @CPBalvanera1 INT = (SELECT Id FROM CodigosPostales WHERE CodigoPostal = 'C1200AAA');
    DECLARE @CPBalvanera2 INT = (SELECT Id FROM CodigosPostales WHERE CodigoPostal = 'C1201AAA');

    IF NOT EXISTS (SELECT * FROM CalleCodigoPostal WHERE CalleId = @CalleCorreintesId)
    BEGIN
        INSERT INTO CalleCodigoPostal (CalleId, CodigoPostalId, AlturaDesde, AlturaHasta, Lado)
        VALUES
        -- Av. Corrientes en Balvanera
        (@CalleCorreintesId, @CPBalvanera1, 1, 1999, 'Impar'),
        (@CalleCorreintesId, @CPBalvanera1, 2, 2000, 'Par'),
        (@CalleCorreintesId, @CPBalvanera2, 2001, 3999, 'Impar'),
        (@CalleCorreintesId, @CPBalvanera2, 2002, 4000, 'Par');

        PRINT 'Relaciones Calle-CP insertadas';
    END

    -- ============================================
    -- 8. INSERTAR DIRECCIONES DE EJEMPLO
    -- ============================================
    IF NOT EXISTS (SELECT * FROM Direcciones WHERE Id = 'DIR-EJEMPLO-001')
    BEGIN
        INSERT INTO Direcciones (
            Id, PaisId, ProvinciaEstadoId, DepartamentoId, LocalidadId,
            CodigoPostalId, CalleId, CalleNombre, Altura, Piso, Departamento,
            DireccionCompleta, Latitud, Longitud, PrecisionGeografica,
            Validada, FechaCreacion, Activa
        )
        VALUES
        (
            'DIR-EJEMPLO-001',
            @PaisArgId,
            @CABAId,
            @Comuna3Id,
            @BalvaneraId,
            @CPBalvanera1,
            @CalleCorreintesId,
            'Av. Corrientes',
            1234,
            '5',
            'B',
            'Av. Corrientes 1234, Piso 5, Depto B, Balvanera, CABA (C1200AAA)',
            -34.6099,
            -58.3997,
            'Exacta',
            1,
            GETDATE(),
            1
        ),
        (
            'DIR-EJEMPLO-002',
            @PaisArgId,
            @CABAId,
            @Comuna2Id,
            @RecoletaId,
            (SELECT Id FROM CodigosPostales WHERE CodigoPostal = 'C1113AAA'),
            (SELECT Id FROM Calles WHERE Nombre = 'Av. Santa Fe' AND LocalidadId = @RecoletaId),
            'Av. Santa Fe',
            2500,
            NULL,
            NULL,
            'Av. Santa Fe 2500, Recoleta, CABA (C1113AAA)',
            -34.5875,
            -58.3974,
            'Calle',
            1,
            GETDATE(),
            1
        );

        PRINT 'Direcciones de ejemplo insertadas';
    END

    COMMIT TRANSACTION;
    PRINT '==============================================';
    PRINT 'Datos de prueba cargados exitosamente';
    PRINT '- 1 País (Argentina)';
    PRINT '- 10 Provincias';
    PRINT '- 14 Departamentos/Partidos';
    PRINT '- 10 Localidades';
    PRINT '- 7 Códigos Postales';
    PRINT '- 11 Calles normalizadas';
    PRINT '- 4 Relaciones Calle-CP';
    PRINT '- 2 Direcciones de ejemplo';
    PRINT '==============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT 'Error durante la carga de datos: ' + @ErrorMessage;
    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;
GO
