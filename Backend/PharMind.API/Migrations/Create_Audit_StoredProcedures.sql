-- =============================================
-- Stored Procedures para Análisis de Auditoría
-- Fecha: 2025-11-06
-- Laboratorio BEB (propios)
-- =============================================

USE PharMind;
GO

PRINT 'Creando stored procedures de reporting...';
GO

-- =============================================
-- SP 1: rpt_GetPortfolioBEB
-- Obtiene el portfolio completo de BEB por mercado
-- =============================================
IF OBJECT_ID('rpt_GetPortfolioBEB', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetPortfolioBEB;
GO

CREATE PROCEDURE rpt_GetPortfolioBEB
    @Periodo NVARCHAR(50) = NULL  -- NULL = todos los períodos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mer.CdgMercado,
        mer.Descripcion AS MercadoNombre,
        mer.Abreviatura AS MercadoAbrev,
        -- Datos de BEB en este mercado
        COUNT(DISTINCT CASE WHEN m.SIGLALAB = 'BEB' THEN c.CDG_RAIZ END) AS ProductosBEB,
        COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) AS PrescripcionesBEB,
        COUNT(DISTINCT CASE WHEN m.SIGLALAB = 'BEB' THEN c.CDGMED_REG END) AS MedicosBEB,
        SUM(CASE WHEN m.SIGLALAB = 'BEB' AND ISNUMERIC(c.PX) = 1 THEN CAST(c.PX AS INT) ELSE 0 END) AS PX_BEB,

        -- Datos totales del mercado
        COUNT(DISTINCT c.CDG_RAIZ) AS ProductosTotales,
        COUNT(c.Id) AS PrescripcionesTotales,
        COUNT(DISTINCT c.CDGMED_REG) AS MedicosTotales,
        COUNT(DISTINCT m2.SIGLALAB) AS LaboratoriosTotales,

        -- Market share BEB
        CAST(
            CASE
                WHEN COUNT(c.Id) > 0
                THEN (COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) * 100.0 / COUNT(c.Id))
                ELSE 0
            END AS DECIMAL(10,2)
        ) AS MarketShareBEB,

        -- Ranking de BEB en el mercado
        (
            SELECT COUNT(*) + 1
            FROM (
                SELECT m3.SIGLALAB, COUNT(c3.Id) AS Total
                FROM auditCategory c3
                JOIN auditMarketMarcas m3 ON c3.CDG_RAIZ = m3.CODIGO_PMIX
                WHERE c3.CDG_MERCADO = CAST(mer.CdgMercado AS NVARCHAR)
                    AND (@Periodo IS NULL OR c3.CDG_PERUSER = @Periodo)
                GROUP BY m3.SIGLALAB
                HAVING COUNT(c3.Id) > (
                    SELECT COUNT(c4.Id)
                    FROM auditCategory c4
                    JOIN auditMarketMarcas m4 ON c4.CDG_RAIZ = m4.CODIGO_PMIX
                    WHERE c4.CDG_MERCADO = CAST(mer.CdgMercado AS NVARCHAR)
                        AND m4.SIGLALAB = 'BEB'
                        AND (@Periodo IS NULL OR c4.CDG_PERUSER = @Periodo)
                )
            ) AS RankingCalc
        ) AS RankingBEB

    FROM auditMercados mer
    LEFT JOIN auditCategory c ON CAST(mer.CdgMercado AS NVARCHAR) = c.CDG_MERCADO
        AND (@Periodo IS NULL OR c.CDG_PERUSER = @Periodo)
    LEFT JOIN auditMarketMarcas m ON c.CDG_RAIZ = m.CODIGO_PMIX
    LEFT JOIN auditMarketMarcas m2 ON c.CDG_RAIZ = m2.CODIGO_PMIX
    WHERE EXISTS (
        -- Solo mercados donde BEB tiene presencia
        SELECT 1
        FROM auditCategory c2
        JOIN auditMarketMarcas m2 ON c2.CDG_RAIZ = m2.CODIGO_PMIX
        WHERE CAST(mer.CdgMercado AS NVARCHAR) = c2.CDG_MERCADO
            AND m2.SIGLALAB = 'BEB'
            AND (@Periodo IS NULL OR c2.CDG_PERUSER = @Periodo)
    )
    GROUP BY mer.CdgMercado, mer.Descripcion, mer.Abreviatura
    ORDER BY PrescripcionesBEB DESC;
END
GO

PRINT '✓ Creado SP rpt_GetPortfolioBEB';
GO

-- =============================================
-- SP 2: rpt_GetMercadoOverview
-- Obtiene el overview de un mercado específico
-- =============================================
IF OBJECT_ID('rpt_GetMercadoOverview', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetMercadoOverview;
GO

CREATE PROCEDURE rpt_GetMercadoOverview
    @CdgMercado NVARCHAR(50),
    @Periodo NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mer.CdgMercado,
        mer.Descripcion AS MercadoNombre,
        mer.Abreviatura,

        -- Totales del mercado
        COUNT(c.Id) AS TotalPrescripciones,
        COUNT(DISTINCT c.CDGMED_REG) AS TotalMedicos,
        COUNT(DISTINCT c.CDG_RAIZ) AS TotalProductos,
        COUNT(DISTINCT m.SIGLALAB) AS TotalLaboratorios,

        -- Performance BEB
        COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) AS PrescripcionesBEB,
        COUNT(DISTINCT CASE WHEN m.SIGLALAB = 'BEB' THEN c.CDGMED_REG END) AS MedicosBEB,
        COUNT(DISTINCT CASE WHEN m.SIGLALAB = 'BEB' THEN c.CDG_RAIZ END) AS ProductosBEB,

        CAST(
            CASE
                WHEN COUNT(c.Id) > 0
                THEN (COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) * 100.0 / COUNT(c.Id))
                ELSE 0
            END AS DECIMAL(10,2)
        ) AS MarketShareBEB

    FROM auditMercados mer
    LEFT JOIN auditCategory c ON CAST(mer.CdgMercado AS NVARCHAR) = c.CDG_MERCADO
        AND (@Periodo IS NULL OR c.CDG_PERUSER = @Periodo)
    LEFT JOIN auditMarketMarcas m ON c.CDG_RAIZ = m.CODIGO_PMIX
    WHERE mer.CdgMercado = CAST(@CdgMercado AS INT)
    GROUP BY mer.CdgMercado, mer.Descripcion, mer.Abreviatura;
END
GO

PRINT '✓ Creado SP rpt_GetMercadoOverview';
GO

-- =============================================
-- SP 3: rpt_GetLaboratoriosPorMercado
-- Obtiene ranking de laboratorios en un mercado
-- =============================================
IF OBJECT_ID('rpt_GetLaboratoriosPorMercado', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetLaboratoriosPorMercado;
GO

CREATE PROCEDURE rpt_GetLaboratoriosPorMercado
    @CdgMercado NVARCHAR(50),
    @Periodo NVARCHAR(50) = NULL,
    @TopN INT = NULL  -- NULL = todos
AS
BEGIN
    SET NOCOUNT ON;

    WITH LabStats AS (
        SELECT
            m.SIGLALAB AS Laboratorio,
            COUNT(c.Id) AS Prescripciones,
            COUNT(DISTINCT c.CDGMED_REG) AS MedicosUnicos,
            COUNT(DISTINCT c.CDG_RAIZ) AS ProductosDelLab,
            SUM(CASE WHEN ISNUMERIC(c.PX) = 1 THEN CAST(c.PX AS INT) ELSE 0 END) AS TotalPX,
            CASE WHEN m.SIGLALAB = 'BEB' THEN 1 ELSE 0 END AS EsBEB
        FROM auditCategory c
        JOIN auditMarketMarcas m ON c.CDG_RAIZ = m.CODIGO_PMIX
        WHERE c.CDG_MERCADO = @CdgMercado
            AND (@Periodo IS NULL OR c.CDG_PERUSER = @Periodo)
        GROUP BY m.SIGLALAB
    ),
    TotalMercado AS (
        SELECT SUM(Prescripciones) AS Total
        FROM LabStats
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY ls.Prescripciones DESC) AS Ranking,
        ls.Laboratorio,
        ls.EsBEB,
        ls.Prescripciones,
        ls.MedicosUnicos,
        ls.ProductosDelLab,
        ls.TotalPX,
        CAST((ls.Prescripciones * 100.0 / tm.Total) AS DECIMAL(10,2)) AS MarketShare
    FROM LabStats ls
    CROSS JOIN TotalMercado tm
    ORDER BY ls.Prescripciones DESC
    OFFSET 0 ROWS
    FETCH NEXT COALESCE(@TopN, 1000000) ROWS ONLY;
END
GO

PRINT '✓ Creado SP rpt_GetLaboratoriosPorMercado';
GO

-- =============================================
-- SP 4: rpt_GetProductosPorMercado
-- Obtiene productos en un mercado con opción de filtrar por lab
-- =============================================
IF OBJECT_ID('rpt_GetProductosPorMercado', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetProductosPorMercado;
GO

CREATE PROCEDURE rpt_GetProductosPorMercado
    @CdgMercado NVARCHAR(50),
    @Periodo NVARCHAR(50) = NULL,
    @Laboratorio NVARCHAR(50) = NULL,  -- NULL = todos, 'BEB' = solo BEB
    @TopN INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH ProductStats AS (
        SELECT
            c.CDG_RAIZ,
            m.CODIGO_PMIX,
            m.NOME AS ProductoNombre,
            m.SIGLALAB AS Laboratorio,
            COUNT(c.Id) AS Prescripciones,
            COUNT(DISTINCT c.CDGMED_REG) AS MedicosUnicos,
            SUM(CASE WHEN ISNUMERIC(c.PX) = 1 THEN CAST(c.PX AS INT) ELSE 0 END) AS TotalPX,
            AVG(CASE WHEN ISNUMERIC(c.PX_MER) = 1 THEN CAST(c.PX_MER AS FLOAT) ELSE 0 END) AS PromedioPX_MER,
            CASE WHEN m.SIGLALAB = 'BEB' THEN 1 ELSE 0 END AS EsBEB
        FROM auditCategory c
        JOIN auditMarketMarcas m ON c.CDG_RAIZ = m.CODIGO_PMIX
        WHERE c.CDG_MERCADO = @CdgMercado
            AND (@Periodo IS NULL OR c.CDG_PERUSER = @Periodo)
            AND (@Laboratorio IS NULL OR m.SIGLALAB = @Laboratorio)
        GROUP BY c.CDG_RAIZ, m.CODIGO_PMIX, m.NOME, m.SIGLALAB
    ),
    TotalMercado AS (
        SELECT SUM(Prescripciones) AS Total
        FROM ProductStats
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY ps.Prescripciones DESC) AS Ranking,
        ps.CDG_RAIZ,
        ps.CODIGO_PMIX,
        ps.ProductoNombre,
        ps.Laboratorio,
        ps.EsBEB,
        ps.Prescripciones,
        ps.MedicosUnicos,
        ps.TotalPX,
        CAST(ps.PromedioPX_MER AS DECIMAL(10,2)) AS PromedioPX_MER,
        CAST((ps.Prescripciones * 100.0 / tm.Total) AS DECIMAL(10,2)) AS MarketShare
    FROM ProductStats ps
    CROSS JOIN TotalMercado tm
    ORDER BY ps.Prescripciones DESC
    OFFSET 0 ROWS
    FETCH NEXT COALESCE(@TopN, 1000000) ROWS ONLY;
END
GO

PRINT '✓ Creado SP rpt_GetProductosPorMercado';
GO

-- =============================================
-- SP 5: rpt_GetMedicosPorMercado
-- Obtiene médicos en un mercado con su relación con BEB
-- =============================================
IF OBJECT_ID('rpt_GetMedicosPorMercado', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetMedicosPorMercado;
GO

CREATE PROCEDURE rpt_GetMedicosPorMercado
    @CdgMercado NVARCHAR(50),
    @Periodo NVARCHAR(50) = NULL,
    @FiltroLealtad NVARCHAR(20) = NULL,  -- 'SOLO_BEB', 'CON_BEB', 'SIN_BEB', NULL = todos
    @TopN INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    WITH MedicoStats AS (
        SELECT
            c.CDGMED_REG,
            cu.NOME AS MedicoNombre,
            cu.CDGESP1 AS Especialidad,
            cu.LOCAL AS Ciudad,
            cu.BAIRRO AS Barrio,

            COUNT(c.Id) AS TotalPrescripciones,
            COUNT(DISTINCT c.CDG_RAIZ) AS ProductosDistintos,
            COUNT(DISTINCT m.SIGLALAB) AS LaboratoriosDistintos,

            COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) AS PrescripcionesBEB,
            COUNT(DISTINCT CASE WHEN m.SIGLALAB = 'BEB' THEN c.CDG_RAIZ END) AS ProductosBEB,

            CAST(
                CASE
                    WHEN COUNT(c.Id) > 0
                    THEN (COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) * 100.0 / COUNT(c.Id))
                    ELSE 0
                END AS DECIMAL(10,2)
            ) AS PorcentajeBEB,

            CASE
                WHEN COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) = COUNT(c.Id) THEN 'SOLO_BEB'
                WHEN COUNT(CASE WHEN m.SIGLALAB = 'BEB' THEN c.Id END) > 0 THEN 'CON_BEB'
                ELSE 'SIN_BEB'
            END AS CategoriaMedico

        FROM auditCategory c
        LEFT JOIN auditCustomer cu ON c.CDGMED_REG = cu.CDGMED_REG
        JOIN auditMarketMarcas m ON c.CDG_RAIZ = m.CODIGO_PMIX
        WHERE c.CDG_MERCADO = @CdgMercado
            AND (@Periodo IS NULL OR c.CDG_PERUSER = @Periodo)
        GROUP BY c.CDGMED_REG, cu.NOME, cu.CDGESP1, cu.LOCAL, cu.BAIRRO
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY TotalPrescripciones DESC) AS Ranking,
        CDGMED_REG,
        MedicoNombre,
        Especialidad,
        Ciudad,
        Barrio,
        TotalPrescripciones,
        ProductosDistintos,
        LaboratoriosDistintos,
        PrescripcionesBEB,
        ProductosBEB,
        PorcentajeBEB,
        CategoriaMedico
    FROM MedicoStats
    WHERE (@FiltroLealtad IS NULL OR CategoriaMedico = @FiltroLealtad)
    ORDER BY TotalPrescripciones DESC
    OFFSET 0 ROWS
    FETCH NEXT @TopN ROWS ONLY;
END
GO

PRINT '✓ Creado SP rpt_GetMedicosPorMercado';
GO

-- =============================================
-- SP 6: rpt_GetListaMercados
-- Obtiene lista de mercados disponibles
-- =============================================
IF OBJECT_ID('rpt_GetListaMercados', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetListaMercados;
GO

CREATE PROCEDURE rpt_GetListaMercados
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CdgMercado,
        Descripcion AS Nombre,
        Abreviatura,
        CdgUsuario,
        Edicion
    FROM auditMercados
    ORDER BY Descripcion;
END
GO

PRINT '✓ Creado SP rpt_GetListaMercados';
GO

-- =============================================
-- SP 7: rpt_GetListaPeriodos
-- Obtiene lista de períodos disponibles
-- =============================================
IF OBJECT_ID('rpt_GetListaPeriodos', 'P') IS NOT NULL
    DROP PROCEDURE rpt_GetListaPeriodos;
GO

CREATE PROCEDURE rpt_GetListaPeriodos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CDG_PERUSER AS Codigo,
        [DESC] AS Descripcion,
        BLANK
    FROM auditPeriod
    ORDER BY CDG_PERUSER DESC;
END
GO

PRINT '✓ Creado SP rpt_GetListaPeriodos';
GO

PRINT '';
PRINT '========================================';
PRINT 'Stored Procedures creados exitosamente';
PRINT '========================================';
GO
