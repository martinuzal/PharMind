-- =============================================
-- Índices para optimizar consultas de auditoría
-- Fecha: 2025-11-06
-- =============================================

USE PharMind;
GO

PRINT 'Creando índices para tablas de auditoría...';
GO

-- =============================================
-- Índices para auditCategory (tabla principal con 6.7M registros)
-- =============================================

-- Índice compuesto para filtrar por mercado y período
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCategory_Mercado_Periodo' AND object_id = OBJECT_ID('auditCategory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCategory_Mercado_Periodo
    ON auditCategory(CDG_MERCADO, CDG_PERUSER)
    INCLUDE (CDG_RAIZ, CDGMED_REG, PX, PX_MER, PX_MS, CAT);
    PRINT '✓ Creado índice IX_auditCategory_Mercado_Periodo';
END
GO

-- Índice para filtrar por producto (CDG_RAIZ)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCategory_Producto' AND object_id = OBJECT_ID('auditCategory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCategory_Producto
    ON auditCategory(CDG_RAIZ)
    INCLUDE (CDG_MERCADO, CDG_PERUSER, CDGMED_REG, PX, PX_MER);
    PRINT '✓ Creado índice IX_auditCategory_Producto';
END
GO

-- Índice para filtrar por médico
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCategory_Medico' AND object_id = OBJECT_ID('auditCategory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCategory_Medico
    ON auditCategory(CDGMED_REG)
    INCLUDE (CDG_MERCADO, CDG_RAIZ, CDG_PERUSER, PX);
    PRINT '✓ Creado índice IX_auditCategory_Medico';
END
GO

-- Índice para filtrar por período
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCategory_Periodo' AND object_id = OBJECT_ID('auditCategory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCategory_Periodo
    ON auditCategory(CDG_PERUSER)
    INCLUDE (CDG_MERCADO, CDG_RAIZ, CDGMED_REG);
    PRINT '✓ Creado índice IX_auditCategory_Periodo';
END
GO

-- =============================================
-- Índices para auditMarketMarcas
-- =============================================

-- Índice para join con auditCategory
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditMarketMarcas_CodigoPMIX' AND object_id = OBJECT_ID('auditMarketMarcas'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditMarketMarcas_CodigoPMIX
    ON auditMarketMarcas(CODIGO_PMIX)
    INCLUDE (NOME, SIGLALAB, CODIGO);
    PRINT '✓ Creado índice IX_auditMarketMarcas_CodigoPMIX';
END
GO

-- Índice para filtrar por laboratorio
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditMarketMarcas_Lab' AND object_id = OBJECT_ID('auditMarketMarcas'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditMarketMarcas_Lab
    ON auditMarketMarcas(SIGLALAB)
    INCLUDE (CODIGO_PMIX, NOME);
    PRINT '✓ Creado índice IX_auditMarketMarcas_Lab';
END
GO

-- =============================================
-- Índices para auditMercados
-- =============================================

-- Índice para join con auditCategory
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditMercados_CdgMercado' AND object_id = OBJECT_ID('auditMercados'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditMercados_CdgMercado
    ON auditMercados(CdgMercado)
    INCLUDE (Descripcion, Abreviatura);
    PRINT '✓ Creado índice IX_auditMercados_CdgMercado';
END
GO

-- =============================================
-- Índices para auditCustomer
-- =============================================

-- Índice para join con auditCategory
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCustomer_CdgMedReg' AND object_id = OBJECT_ID('auditCustomer'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCustomer_CdgMedReg
    ON auditCustomer(CDGMED_REG)
    INCLUDE (NOME, CDGESP1, CDGESP2, LOCAL, BAIRRO);
    PRINT '✓ Creado índice IX_auditCustomer_CdgMedReg';
END
GO

-- Índice para filtrar por especialidad
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditCustomer_Especialidad' AND object_id = OBJECT_ID('auditCustomer'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditCustomer_Especialidad
    ON auditCustomer(CDGESP1)
    INCLUDE (CDGMED_REG, NOME, LOCAL);
    PRINT '✓ Creado índice IX_auditCustomer_Especialidad';
END
GO

-- =============================================
-- Índices para auditPeriod
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_auditPeriod_CdgPeriodo' AND object_id = OBJECT_ID('auditPeriod'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_auditPeriod_CdgPeriodo
    ON auditPeriod(CDG_PERUSER)
    INCLUDE ([DESC], BLANK);
    PRINT '✓ Creado índice IX_auditPeriod_CdgPeriodo';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Índices creados exitosamente';
PRINT '========================================';
GO
