-- Agregar módulos faltantes al sistema
-- Estos módulos están hardcodeados en el frontend pero no existen en la BD

-- =============================================
-- MÓDULO: GESTIÓN
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'GESTION')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'GESTION',
        'Gestión',
        'Módulo de gestión de tiempo y actividades',
        'business_center',
        NULL,
        40,
        1,
        NULL,
        0,
        GETDATE()
    );
END

-- Submódulos de Gestión
DECLARE @GestionId NVARCHAR(450) = (SELECT Id FROM Modulos WHERE Codigo = 'GESTION');

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'GESTION_TIEMPO')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'GESTION_TIEMPO',
        'Tiempo Utilizado',
        'Gestión y seguimiento del tiempo utilizado',
        'schedule',
        '/gestion/tiempo-utilizado',
        1,
        1,
        @GestionId,
        0,
        GETDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'GESTION_TIPOS_ACTIVIDAD')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'GESTION_TIPOS_ACTIVIDAD',
        'Tipos de Actividad',
        'Gestión de tipos de actividad',
        'category',
        '/gestion/tipos-actividad',
        2,
        1,
        @GestionId,
        0,
        GETDATE()
    );
END

-- =============================================
-- MÓDULO: ATLAS
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS',
        'Atlas',
        'Módulo de gestión geográfica y direcciones',
        'travel_explore',
        NULL,
        50,
        1,
        NULL,
        0,
        GETDATE()
    );
END

-- Submódulos de Atlas
DECLARE @AtlasId NVARCHAR(450) = (SELECT Id FROM Modulos WHERE Codigo = 'ATLAS');

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS_PAISES')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS_PAISES',
        'Países',
        'Gestión de países',
        'public',
        '/atlas/paises',
        1,
        1,
        @AtlasId,
        0,
        GETDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS_PROVINCIAS')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS_PROVINCIAS',
        'Provincias/Estados',
        'Gestión de provincias y estados',
        'map',
        '/atlas/provincias',
        2,
        1,
        @AtlasId,
        0,
        GETDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS_LOCALIDADES')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS_LOCALIDADES',
        'Localidades',
        'Gestión de localidades',
        'location_city',
        '/atlas/localidades',
        3,
        1,
        @AtlasId,
        0,
        GETDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS_CALLES')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS_CALLES',
        'Calles',
        'Gestión de calles',
        'signpost',
        '/atlas/calles',
        4,
        1,
        @AtlasId,
        0,
        GETDATE()
    );
END

IF NOT EXISTS (SELECT 1 FROM Modulos WHERE Codigo = 'ATLAS_CODIGOS_POSTALES')
BEGIN
    INSERT INTO Modulos (Id, Codigo, Nombre, Descripcion, Icono, Ruta, OrdenMenu, Activo, ModuloPadreId, Status, FechaCreacion)
    VALUES (
        NEWID(),
        'ATLAS_CODIGOS_POSTALES',
        'Códigos Postales',
        'Gestión de códigos postales',
        'markunread_mailbox',
        '/atlas/codigos-postales',
        5,
        1,
        @AtlasId,
        0,
        GETDATE()
    );
END

-- Verificar módulos insertados
SELECT 'Módulos agregados exitosamente' AS Resultado;

SELECT
    m.Codigo,
    m.Nombre,
    m.Icono,
    m.Ruta,
    m.OrdenMenu,
    mp.Nombre AS ModuloPadre
FROM Modulos m
LEFT JOIN Modulos mp ON m.ModuloPadreId = mp.Id
WHERE m.Codigo IN ('GESTION', 'GESTION_TIEMPO', 'GESTION_TIPOS_ACTIVIDAD',
                   'ATLAS', 'ATLAS_PAISES', 'ATLAS_PROVINCIAS', 'ATLAS_LOCALIDADES',
                   'ATLAS_CALLES', 'ATLAS_CODIGOS_POSTALES')
ORDER BY m.OrdenMenu;
