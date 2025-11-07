-- Manual creation of Audit Prescripciones tables
-- Created to bypass migration conflict with existing Clientes table

-- Drop tables if they exist (for clean re-run)
IF OBJECT_ID('auditMarketMarcas', 'U') IS NOT NULL DROP TABLE auditMarketMarcas;
IF OBJECT_ID('audotProductClass', 'U') IS NOT NULL DROP TABLE audotProductClass;
IF OBJECT_ID('auditPeriod', 'U') IS NOT NULL DROP TABLE auditPeriod;
IF OBJECT_ID('auditCustomer', 'U') IS NOT NULL DROP TABLE auditCustomer;
IF OBJECT_ID('auditCategory', 'U') IS NOT NULL DROP TABLE auditCategory;
IF OBJECT_ID('auditMercados', 'U') IS NOT NULL DROP TABLE auditMercados;

-- Create auditMercados table
CREATE TABLE auditMercados (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgMercado NVARCHAR(50) NULL,
    Descripcion NVARCHAR(500) NULL,
    Closeup NVARCHAR(1) NULL,
    Audit NVARCHAR(1) NULL,
    Feedback NVARCHAR(1) NULL,
    Recetario NVARCHAR(1) NULL,
    Generado NVARCHAR(1) NULL,
    Controlado NVARCHAR(1) NULL,
    Abreviatura NVARCHAR(50) NULL,
    CdgLabora NVARCHAR(50) NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL
);

-- Create auditCategory table
CREATE TABLE auditCategory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgCategoria NVARCHAR(50) NULL,
    Descripcion NVARCHAR(500) NULL,
    Abreviatura NVARCHAR(50) NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL,
    RawData NVARCHAR(1000) NULL
);

-- Create auditCustomer table
CREATE TABLE auditCustomer (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgCliente NVARCHAR(50) NULL,
    NombreCliente NVARCHAR(500) NULL,
    Direccion NVARCHAR(500) NULL,
    Ciudad NVARCHAR(200) NULL,
    Provincia NVARCHAR(200) NULL,
    CodigoPostal NVARCHAR(20) NULL,
    Telefono NVARCHAR(50) NULL,
    Email NVARCHAR(200) NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL,
    RawData NVARCHAR(1000) NULL
);

-- Create auditPeriod table
CREATE TABLE auditPeriod (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgPeriodo NVARCHAR(50) NULL,
    Descripcion NVARCHAR(500) NULL,
    FechaInicio DATETIME NULL,
    FechaFin DATETIME NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL,
    RawData NVARCHAR(1000) NULL
);

-- Create audotProductClass table (note: keeping typo as specified by user)
CREATE TABLE audotProductClass (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgClaseProducto NVARCHAR(50) NULL,
    Descripcion NVARCHAR(500) NULL,
    Abreviatura NVARCHAR(50) NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL,
    RawData NVARCHAR(1000) NULL
);

-- Create auditMarketMarcas table
CREATE TABLE auditMarketMarcas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CdgUsuario NVARCHAR(50) NULL,
    CdgPais NVARCHAR(10) NULL,
    CdgMarca NVARCHAR(50) NULL,
    NombreMarca NVARCHAR(500) NULL,
    CdgLaboratorio NVARCHAR(50) NULL,
    NombreLaboratorio NVARCHAR(500) NULL,
    Edicion NVARCHAR(20) NULL,
    FechaHoraProc NVARCHAR(50) NULL,
    Path NVARCHAR(500) NULL,
    RawData NVARCHAR(1000) NULL
);

PRINT 'All Audit Prescripciones tables created successfully';
