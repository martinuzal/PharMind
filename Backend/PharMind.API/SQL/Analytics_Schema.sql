-- =========================================
-- PHARMIND ANALYTICS - SCHEMA & DEMO DATA
-- Tablas para Dashboard de Actividad de Visitas
-- =========================================

USE [PharMindDB];
GO

-- ==================== TABLAS ====================

-- Tabla de Médicos (Panel Médico)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='analytics_medicos' and xtype='U')
CREATE TABLE analytics_medicos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(200) NOT NULL,
    Apellido NVARCHAR(200) NOT NULL,
    Especialidad NVARCHAR(100) NOT NULL,
    Matricula NVARCHAR(50) NOT NULL UNIQUE,
    Segmento CHAR(1) NOT NULL CHECK (Segmento IN ('A', 'B', 'C')), -- A: Alto, B: Medio, C: Bajo potencial
    TipoAtencion NVARCHAR(50) NOT NULL CHECK (TipoAtencion IN ('Consultorio Privado', 'Institución', 'Ambos')),
    Direccion NVARCHAR(300),
    Ciudad NVARCHAR(100) NOT NULL,
    Provincia NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(50),
    Email NVARCHAR(200),
    FechaAlta DATETIME NOT NULL DEFAULT GETDATE(),
    Activo BIT NOT NULL DEFAULT 1
);
GO

-- Tabla de Representantes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='analytics_representantes' and xtype='U')
CREATE TABLE analytics_representantes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    Distrito NVARCHAR(100) NOT NULL,
    Region NVARCHAR(100) NOT NULL,
    FechaIngreso DATETIME NOT NULL,
    Activo BIT NOT NULL DEFAULT 1
);
GO

-- Tabla de Visitas Médicas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='analytics_visitas' and xtype='U')
CREATE TABLE analytics_visitas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MedicoId INT NOT NULL FOREIGN KEY REFERENCES analytics_medicos(Id),
    RepresentanteId INT NOT NULL FOREIGN KEY REFERENCES analytics_representantes(Id),
    FechaVisita DATETIME NOT NULL,
    DuracionMinutos INT NOT NULL,
    TipoVisita NVARCHAR(50) NOT NULL CHECK (TipoVisita IN ('Presencial', 'Virtual', 'Grupal')),
    ObjetivoVisita NVARCHAR(MAX),
    ProductosPromovidos NVARCHAR(MAX), -- JSON con IDs de productos
    MuestrasMedicasEntregadas BIT DEFAULT 0,
    MaterialEntregado NVARCHAR(MAX), -- JSON con materiales
    Notas NVARCHAR(MAX),
    Exitosa BIT NOT NULL DEFAULT 1,
    ProximaVisitaPlaneada DATETIME NULL
);
GO

-- Tabla de Productos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='analytics_productos' and xtype='U')
CREATE TABLE analytics_productos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(200) NOT NULL,
    LineaProducto NVARCHAR(100) NOT NULL,
    Principio NVARCHAR(200),
    Presentacion NVARCHAR(200),
    Activo BIT NOT NULL DEFAULT 1
);
GO

-- Tabla de Objetivos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='analytics_objetivos' and xtype='U')
CREATE TABLE analytics_objetivos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RepresentanteId INT NOT NULL FOREIGN KEY REFERENCES analytics_representantes(Id),
    Periodo NVARCHAR(20) NOT NULL, -- Ejemplo: '2025-01', '2025-Q1'
    TipoObjetivo NVARCHAR(50) NOT NULL CHECK (TipoObjetivo IN ('Visitas', 'Cobertura', 'Frecuencia')),
    Meta INT NOT NULL,
    Alcanzado INT NOT NULL DEFAULT 0,
    Porcentaje AS (CAST(Alcanzado AS DECIMAL(10,2)) / CAST(Meta AS DECIMAL(10,2)) * 100)
);
GO

CREATE INDEX IX_Visitas_Fecha ON analytics_visitas(FechaVisita);
CREATE INDEX IX_Visitas_Medico ON analytics_visitas(MedicoId);
CREATE INDEX IX_Visitas_Representante ON analytics_visitas(RepresentanteId);
CREATE INDEX IX_Medicos_Segmento ON analytics_medicos(Segmento);
CREATE INDEX IX_Medicos_Provincia ON analytics_medicos(Provincia);
GO

PRINT 'Tablas de Analytics creadas exitosamente';
GO
