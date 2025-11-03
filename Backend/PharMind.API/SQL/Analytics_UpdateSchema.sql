-- Agregar nuevas columnas a analytics_medicos para más dimensiones de análisis
USE PharMind;
GO

-- Agregar columnas de categorización adicional a médicos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'analytics_medicos') AND name = 'Categoria')
BEGIN
    ALTER TABLE analytics_medicos ADD Categoria NVARCHAR(50) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'analytics_medicos') AND name = 'TipoInstitucion')
BEGIN
    ALTER TABLE analytics_medicos ADD TipoInstitucion NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'analytics_medicos') AND name = 'Sector')
BEGIN
    ALTER TABLE analytics_medicos ADD Sector NVARCHAR(50) NULL;
END

-- Agregar columnas a representantes para zona
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'analytics_representantes') AND name = 'Zona')
BEGIN
    ALTER TABLE analytics_representantes ADD Zona NVARCHAR(100) NULL;
END

-- Agregar columnas a visitas para turno
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'analytics_visitas') AND name = 'Turno')
BEGIN
    ALTER TABLE analytics_visitas ADD Turno NVARCHAR(20) NULL;
END

-- Actualizar datos existentes con las nuevas dimensiones
UPDATE analytics_medicos
SET
    Categoria = CASE
        WHEN Segmento = 'A' THEN 'Premium'
        WHEN Segmento = 'B' THEN 'Estándar'
        ELSE 'Básico'
    END,
    TipoInstitucion = CASE
        WHEN TipoAtencion = 'Institución' THEN 'Hospital'
        WHEN TipoAtencion = 'Consultorio Privado' THEN 'Consultorio'
        ELSE 'Mixto'
    END,
    Sector = CASE
        WHEN TipoAtencion = 'Institución' THEN 'Público'
        ELSE 'Privado'
    END
WHERE Categoria IS NULL;

-- Actualizar representantes con zonas
UPDATE analytics_representantes
SET Zona = Distrito
WHERE Zona IS NULL;

-- Actualizar visitas con turnos (basado en hora simulada)
UPDATE analytics_visitas
SET Turno = CASE
    WHEN DATEPART(HOUR, FechaVisita) < 13 THEN 'Mañana'
    ELSE 'Tarde'
END
WHERE Turno IS NULL;

PRINT 'Schema actualizado correctamente con nuevas dimensiones de análisis';
