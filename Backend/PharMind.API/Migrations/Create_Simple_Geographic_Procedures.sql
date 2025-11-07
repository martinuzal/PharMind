-- =============================================
-- Stored Procedures Simplificados para Análisis Geográfico
-- =============================================

-- 1. Obtener prescripciones por CEP (simplificado)
IF OBJECT_ID('GetPrescripcionesPorCEP', 'P') IS NOT NULL
    DROP PROCEDURE GetPrescripcionesPorCEP;
GO

CREATE PROCEDURE GetPrescripcionesPorCEP
    @Periodo VARCHAR(50) = NULL,
    @CdgMercado VARCHAR(100) = NULL,
    @TopN INT = 500
AS
BEGIN
    SET NOCOUNT ON;

    WITH PrescripcionesCEP AS (
        SELECT
            LTRIM(RTRIM(c.CEP)) as CEP,
            LTRIM(RTRIM(c.LOCAL)) as Ciudad,
            LTRIM(RTRIM(c.BAIRRO)) as Barrio,
            COUNT(DISTINCT p.CDGMED_REG) as TotalMedicos,
            COUNT(*) as TotalPrescripciones,
            COUNT(DISTINCT p.CDG_RAIZ) as ProductosDistintos
        FROM auditCategory p
        INNER JOIN auditCustomer c ON p.CDGMED_REG = c.CDGMED_REG
        WHERE
            c.CEP IS NOT NULL
            AND LEN(LTRIM(RTRIM(c.CEP))) >= 4
            AND c.CEP <> '0000000000'
            AND (@Periodo IS NULL OR p.CDG_PERUSER = @Periodo)
            AND (@CdgMercado IS NULL OR p.CDG_MERCADO = @CdgMercado)
        GROUP BY LTRIM(RTRIM(c.CEP)), LTRIM(RTRIM(c.LOCAL)), LTRIM(RTRIM(c.BAIRRO))
    )
    SELECT TOP (@TopN)
        CEP,
        Ciudad,
        Barrio,
        TotalMedicos,
        TotalPrescripciones,
        ProductosDistintos,
        ROW_NUMBER() OVER (ORDER BY TotalPrescripciones DESC) as Ranking
    FROM PrescripcionesCEP
    WHERE TotalPrescripciones > 0
    ORDER BY TotalPrescripciones DESC;
END
GO

-- 2. Obtener top ciudades
IF OBJECT_ID('GetTopCiudades', 'P') IS NOT NULL
    DROP PROCEDURE GetTopCiudades;
GO

CREATE PROCEDURE GetTopCiudades
    @Periodo VARCHAR(50) = NULL,
    @CdgMercado VARCHAR(100) = NULL,
    @TopN INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    WITH CiudadesData AS (
        SELECT
            LTRIM(RTRIM(c.LOCAL)) as Ciudad,
            COUNT(DISTINCT LTRIM(RTRIM(c.CEP))) as CodigosPostales,
            COUNT(DISTINCT LTRIM(RTRIM(c.BAIRRO))) as Barrios,
            COUNT(DISTINCT p.CDGMED_REG) as TotalMedicos,
            COUNT(*) as TotalPrescripciones,
            COUNT(DISTINCT p.CDG_RAIZ) as ProductosDistintos
        FROM auditCategory p
        INNER JOIN auditCustomer c ON p.CDGMED_REG = c.CDGMED_REG
        WHERE
            c.LOCAL IS NOT NULL
            AND LEN(LTRIM(RTRIM(c.LOCAL))) > 0
            AND (@Periodo IS NULL OR p.CDG_PERUSER = @Periodo)
            AND (@CdgMercado IS NULL OR p.CDG_MERCADO = @CdgMercado)
        GROUP BY LTRIM(RTRIM(c.LOCAL))
    )
    SELECT TOP (@TopN)
        Ciudad,
        CodigosPostales,
        Barrios,
        TotalMedicos,
        TotalPrescripciones,
        ProductosDistintos,
        ROW_NUMBER() OVER (ORDER BY TotalPrescripciones DESC) as Ranking
    FROM CiudadesData
    WHERE TotalPrescripciones > 0
    ORDER BY TotalPrescripciones DESC;
END
GO

PRINT 'Geographic analysis stored procedures created successfully';
