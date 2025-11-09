-- =============================================
-- Script: AddAuditFields.sql
-- Descripción: Agrega campos para cruce con auditoría
-- Fecha: 2025-01-07
-- =============================================

USE [PharMind];
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 1. Agregar campo CruceAudit a EsquemasPersonalizados
-- =============================================

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[EsquemasPersonalizados]')
    AND name = 'CruceAudit'
)
BEGIN
    PRINT 'Agregando columna CruceAudit a EsquemasPersonalizados...'

    ALTER TABLE [dbo].[EsquemasPersonalizados]
    ADD [CruceAudit] BIT NOT NULL DEFAULT 0;

    PRINT 'Columna CruceAudit agregada exitosamente.'
END
ELSE
BEGIN
    PRINT 'La columna CruceAudit ya existe en EsquemasPersonalizados.'
END
GO

-- =============================================
-- 2. Agregar campo CodigoAudit a Clientes
-- =============================================

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[Clientes]')
    AND name = 'CodigoAudit'
)
BEGIN
    PRINT 'Agregando columna CodigoAudit a Clientes...'

    ALTER TABLE [dbo].[Clientes]
    ADD [CodigoAudit] VARCHAR(20) NULL;

    PRINT 'Columna CodigoAudit agregada exitosamente.'
END
ELSE
BEGIN
    PRINT 'La columna CodigoAudit ya existe en Clientes.'
END
GO

-- =============================================
-- 3. Crear índice en CodigoAudit para búsquedas rápidas
-- =============================================

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Clientes_CodigoAudit'
    AND object_id = OBJECT_ID(N'[dbo].[Clientes]')
)
BEGIN
    PRINT 'Creando índice IX_Clientes_CodigoAudit...'

    CREATE NONCLUSTERED INDEX [IX_Clientes_CodigoAudit]
    ON [dbo].[Clientes] ([CodigoAudit])
    WHERE [CodigoAudit] IS NOT NULL;

    PRINT 'Índice IX_Clientes_CodigoAudit creado exitosamente.'
END
ELSE
BEGIN
    PRINT 'El índice IX_Clientes_CodigoAudit ya existe.'
END
GO

-- =============================================
-- 4. Actualizar tipos de cliente existentes con cruce de auditoría
-- =============================================

PRINT 'Actualizando tipos de cliente con cruce de auditoría...'

-- Marcar el tipo "Medico" como que tiene cruce con auditoría
UPDATE [dbo].[EsquemasPersonalizados]
SET [CruceAudit] = 1
WHERE [EntidadTipo] = 'Cliente'
  AND [SubTipo] = 'Medico';

-- Si tienes otros tipos que deban tener cruce, agrégalos aquí
-- Ejemplo:
-- UPDATE [dbo].[EsquemasPersonalizados]
-- SET [CruceAudit] = 1
-- WHERE [EntidadTipo] = 'Cliente'
--   AND [SubTipo] = 'Institucion';

PRINT 'Tipos de cliente actualizados exitosamente.'
GO

-- =============================================
-- 5. Verificación final
-- =============================================

PRINT '==========================================='
PRINT 'VERIFICACIÓN DE CAMBIOS:'
PRINT '==========================================='

-- Verificar EsquemasPersonalizados
SELECT
    COUNT(*) AS TotalEsquemas,
    SUM(CASE WHEN CruceAudit = 1 THEN 1 ELSE 0 END) AS EsquemasConCruceAudit
FROM [dbo].[EsquemasPersonalizados]
WHERE [EntidadTipo] = 'Cliente';

-- Verificar estructura de Clientes
SELECT
    COUNT(*) AS TotalClientes,
    SUM(CASE WHEN CodigoAudit IS NOT NULL THEN 1 ELSE 0 END) AS ClientesConCodigoAudit
FROM [dbo].[Clientes];

PRINT '==========================================='
PRINT 'Migración completada exitosamente.'
PRINT '==========================================='
GO
