-- Fix column sizes for Audit tables based on actual data
-- Issue: CdgPais truncated at 10 chars, actual data needs more

-- Increase CdgPais size in all audit tables to 100 chars to be safe
ALTER TABLE auditPeriod ALTER COLUMN CdgPais NVARCHAR(100) NULL;
ALTER TABLE auditCategory ALTER COLUMN CdgPais NVARCHAR(100) NULL;
ALTER TABLE auditCustomer ALTER COLUMN CdgPais NVARCHAR(100) NULL;
ALTER TABLE auditMercados ALTER COLUMN CdgPais NVARCHAR(100) NULL;
ALTER TABLE audotProductClass ALTER COLUMN CdgPais NVARCHAR(100) NULL;
ALTER TABLE auditMarketMarcas ALTER COLUMN CdgPais NVARCHAR(100) NULL;

-- Also increase CdgUsuario, CdgPeriodo, and other key fields to be safe
ALTER TABLE auditPeriod ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE auditPeriod ALTER COLUMN CdgPeriodo NVARCHAR(100) NULL;

ALTER TABLE auditCategory ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE auditCategory ALTER COLUMN CdgCategoria NVARCHAR(100) NULL;

ALTER TABLE auditCustomer ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE auditCustomer ALTER COLUMN CdgCliente NVARCHAR(100) NULL;

ALTER TABLE auditMercados ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE auditMercados ALTER COLUMN CdgMercado NVARCHAR(100) NULL;
ALTER TABLE auditMercados ALTER COLUMN CdgLabora NVARCHAR(100) NULL;

ALTER TABLE audotProductClass ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE audotProductClass ALTER COLUMN CdgClaseProducto NVARCHAR(100) NULL;

ALTER TABLE auditMarketMarcas ALTER COLUMN CdgUsuario NVARCHAR(100) NULL;
ALTER TABLE auditMarketMarcas ALTER COLUMN CdgMarca NVARCHAR(100) NULL;
ALTER TABLE auditMarketMarcas ALTER COLUMN CdgLaboratorio NVARCHAR(100) NULL;

PRINT 'Column sizes increased successfully';
