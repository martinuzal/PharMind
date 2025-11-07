-- =============================================
-- Stored Procedures para Análisis Geográfico de Prescripciones
-- =============================================

-- 1. Obtener prescripciones agregadas por código postal
IF OBJECT_ID('GetPrescripcionesPorCEP', 'P') IS NOT NULL
    DROP PROCEDURE GetPrescripcionesPorCEP;
GO

CREATE PROCEDURE GetPrescripcionesPorCEP
    @Periodo VARCHAR(50) = NULL,
    @CdgMercado VARCHAR(100) = NULL,
    @TopN INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    WITH PrescripcionesCEP AS (
        SELECT
            c.CEP,
            c.LOCAL as Ciudad,
            c.BAIRRO as Barrio,
            COUNT(DISTINCT p.CDGMED_REG) as TotalMedicos,
            COUNT(*) as TotalPrescripciones,
            SUM(CASE WHEN mm.EsBEB = 1 THEN 1 ELSE 0 END) as PrescripcionesBEB,
            COUNT(DISTINCT p.CDG_RAIZ) as ProductosDistintos,
            COUNT(DISTINCT p.CDG_LABORATORIO) as LaboratoriosDistintos,
            -- Calcular market share BEB local
            CASE
                WHEN COUNT(*) > 0
                THEN CAST(SUM(CASE WHEN mm.EsBEB = 1 THEN 1 ELSE 0 END) AS DECIMAL(10,2)) / COUNT(*) * 100
                ELSE 0
            END as MarketShareBEB
        FROM auditCategory p
        INNER JOIN auditCustomer c ON p.CDGMED_REG = c.CDGMED_REG
        INNER JOIN auditMercados m ON p.CDG_MERCADO = m.CdgMercado
        LEFT JOIN auditMarketMarcas mm ON p.CDG_RAIZ = mm.CDG_RAIZ AND p.CDG_MERCADO = mm.CdgMercado
        WHERE
            c.CEP IS NOT NULL
            AND c.CEP <> ''
            AND c.CEP <> '0000000000'
            AND (@Periodo IS NULL OR p.CDG_PERUSER = @Periodo)
            AND (@CdgMercado IS NULL OR p.CDG_MERCADO = @CdgMercado)
        GROUP BY c.CEP, c.LOCAL, c.BAIRRO
    )
    SELECT TOP (@TopN)
        CEP,
        Ciudad,
        Barrio,
        TotalMedicos,
        TotalPrescripciones,
        PrescripcionesBEB,
        ProductosDistintos,
        LaboratoriosDistintos,
        MarketShareBEB,
        -- Ranking por prescripciones
        ROW_NUMBER() OVER (ORDER BY TotalPrescripciones DESC) as Ranking
    FROM PrescripcionesCEP
    WHERE TotalPrescripciones > 0
    ORDER BY TotalPrescripciones DESC;
END
GO

-- 2. Obtener top ciudades con más actividad
IF OBJECT_ID('GetTopCiudadesBEB', 'P') IS NOT NULL
    DROP PROCEDURE GetTopCiudadesBEB;
GO

CREATE PROCEDURE GetTopCiudadesBEB
    @Periodo VARCHAR(50) = NULL,
    @CdgMercado VARCHAR(100) = NULL,
    @TopN INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    WITH CiudadesData AS (
        SELECT
            c.LOCAL as Ciudad,
            COUNT(DISTINCT c.CEP) as CodigosPostales,
            COUNT(DISTINCT c.BAIRRO) as Barrios,
            COUNT(DISTINCT p.CDGMED_REG) as TotalMedicos,
            COUNT(*) as TotalPrescripciones,
            SUM(CASE WHEN mm.EsBEB = 1 THEN 1 ELSE 0 END) as PrescripcionesBEB,
            CASE
                WHEN COUNT(*) > 0
                THEN CAST(SUM(CASE WHEN mm.EsBEB = 1 THEN 1 ELSE 0 END) AS DECIMAL(10,2)) / COUNT(*) * 100
                ELSE 0
            END as MarketShareBEB
        FROM auditCategory p
        INNER JOIN auditCustomer c ON p.CDGMED_REG = c.CDGMED_REG
        LEFT JOIN auditMarketMarcas mm ON p.CDG_RAIZ = mm.CDG_RAIZ AND p.CDG_MERCADO = mm.CdgMercado
        WHERE
            c.LOCAL IS NOT NULL
            AND c.LOCAL <> ''
            AND (@Periodo IS NULL OR p.CDG_PERUSER = @Periodo)
            AND (@CdgMercado IS NULL OR p.CDG_MERCADO = @CdgMercado)
        GROUP BY c.LOCAL
    )
    SELECT TOP (@TopN)
        Ciudad,
        CodigosPostales,
        Barrios,
        TotalMedicos,
        TotalPrescripciones,
        PrescripcionesBEB,
        MarketShareBEB,
        ROW_NUMBER() OVER (ORDER BY TotalPrescripciones DESC) as Ranking
    FROM CiudadesData
    WHERE TotalPrescripciones > 0
    ORDER BY TotalPrescripciones DESC;
END
GO

PRINT 'Geographic analysis stored procedures created successfully';
