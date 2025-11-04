-- Script para crear tablas de Gestión: Regiones, Distritos, Managers y Líneas de Negocio
-- PharMind - Sistema de Gestión Farmacéutica

USE PharMind;
GO

-- Tabla: Regiones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Regiones')
BEGIN
    CREATE TABLE Regiones (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        Codigo NVARCHAR(50) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        LegacyCode NVARCHAR(100) NULL,
        Legajo NVARCHAR(100) NULL,
        Color NVARCHAR(20) NULL,
        Icono NVARCHAR(50) NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Orden INT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0
    );
    PRINT 'Tabla Regiones creada exitosamente';
END
ELSE
    PRINT 'Tabla Regiones ya existe';
GO

-- Tabla: Distritos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Distritos')
BEGIN
    CREATE TABLE Distritos (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        RegionId NVARCHAR(450) NOT NULL,
        Codigo NVARCHAR(50) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        LegacyCode NVARCHAR(100) NULL,
        Legajo NVARCHAR(100) NULL,
        Color NVARCHAR(20) NULL,
        Icono NVARCHAR(50) NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Orden INT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0,
        -- Foreign Key
        CONSTRAINT FK_Distritos_Regiones FOREIGN KEY (RegionId) REFERENCES Regiones(Id)
    );
    PRINT 'Tabla Distritos creada exitosamente';
END
ELSE
    PRINT 'Tabla Distritos ya existe';
GO

-- Tabla: LineasNegocio
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LineasNegocio')
BEGIN
    CREATE TABLE LineasNegocio (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        Codigo NVARCHAR(50) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        LegacyCode NVARCHAR(100) NULL,
        Legajo NVARCHAR(100) NULL,
        Color NVARCHAR(20) NULL,
        Icono NVARCHAR(50) NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Orden INT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0
    );
    PRINT 'Tabla LineasNegocio creada exitosamente';
END
ELSE
    PRINT 'Tabla LineasNegocio ya existe';
GO

-- Tabla: Managers
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Managers')
BEGIN
    CREATE TABLE Managers (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        UsuarioId NVARCHAR(450) NOT NULL,
        Codigo NVARCHAR(50) NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        Apellido NVARCHAR(200) NULL,
        Email NVARCHAR(255) NULL,
        Telefono NVARCHAR(50) NULL,
        Cargo NVARCHAR(100) NULL,
        FechaIngreso DATETIME NULL,
        LegacyCode NVARCHAR(100) NULL,
        Legajo NVARCHAR(100) NULL,
        Activo BIT NOT NULL DEFAULT 1,
        Observaciones NVARCHAR(1000) NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0,
        -- Foreign Key
        CONSTRAINT FK_Managers_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id)
    );
    PRINT 'Tabla Managers creada exitosamente';
END
ELSE
    PRINT 'Tabla Managers ya existe';
GO

-- Tabla de relación: ManagerRegiones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ManagerRegiones')
BEGIN
    CREATE TABLE ManagerRegiones (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        ManagerId NVARCHAR(450) NOT NULL,
        RegionId NVARCHAR(450) NOT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0,
        -- Foreign Keys
        CONSTRAINT FK_ManagerRegiones_Managers FOREIGN KEY (ManagerId) REFERENCES Managers(Id),
        CONSTRAINT FK_ManagerRegiones_Regiones FOREIGN KEY (RegionId) REFERENCES Regiones(Id)
    );
    PRINT 'Tabla ManagerRegiones creada exitosamente';
END
ELSE
    PRINT 'Tabla ManagerRegiones ya existe';
GO

-- Tabla de relación: ManagerDistritos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ManagerDistritos')
BEGIN
    CREATE TABLE ManagerDistritos (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        ManagerId NVARCHAR(450) NOT NULL,
        DistritoId NVARCHAR(450) NOT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0,
        -- Foreign Keys
        CONSTRAINT FK_ManagerDistritos_Managers FOREIGN KEY (ManagerId) REFERENCES Managers(Id),
        CONSTRAINT FK_ManagerDistritos_Distritos FOREIGN KEY (DistritoId) REFERENCES Distritos(Id)
    );
    PRINT 'Tabla ManagerDistritos creada exitosamente';
END
ELSE
    PRINT 'Tabla ManagerDistritos ya existe';
GO

-- Tabla de relación: ManagerLineasNegocio
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ManagerLineasNegocio')
BEGIN
    CREATE TABLE ManagerLineasNegocio (
        Id NVARCHAR(450) NOT NULL PRIMARY KEY,
        ManagerId NVARCHAR(450) NOT NULL,
        LineaNegocioId NVARCHAR(450) NOT NULL,
        -- Campos de auditoría
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CreadoPor NVARCHAR(255) NULL,
        FechaModificacion DATETIME NULL,
        ModificadoPor NVARCHAR(255) NULL,
        Status BIT NOT NULL DEFAULT 0,
        -- Foreign Keys
        CONSTRAINT FK_ManagerLineasNegocio_Managers FOREIGN KEY (ManagerId) REFERENCES Managers(Id),
        CONSTRAINT FK_ManagerLineasNegocio_LineasNegocio FOREIGN KEY (LineaNegocioId) REFERENCES LineasNegocio(Id)
    );
    PRINT 'Tabla ManagerLineasNegocio creada exitosamente';
END
ELSE
    PRINT 'Tabla ManagerLineasNegocio ya existe';
GO

PRINT 'Script completado. Todas las tablas de Gestión han sido verificadas/creadas';
GO
