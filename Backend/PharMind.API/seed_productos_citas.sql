-- Script para insertar datos de prueba de Productos y Citas
USE PharMind;
GO

-- Obtener IDs existentes para relaciones
DECLARE @LineaNegocioId NVARCHAR(450);
DECLARE @AgenteId NVARCHAR(450);
DECLARE @ClienteId NVARCHAR(450);
DECLARE @RelacionId NVARCHAR(450);

SELECT TOP 1 @LineaNegocioId = Id FROM LineasNegocio WHERE Activo = 1;
SELECT TOP 1 @AgenteId = Id FROM Agentes WHERE Status = 0;
SELECT TOP 1 @ClienteId = Id FROM Clientes WHERE Status = 0;
SELECT TOP 1 @RelacionId = Id FROM Relaciones WHERE Status = 0;

PRINT 'IDs obtenidos:';
PRINT 'LineaNegocio: ' + ISNULL(@LineaNegocioId, 'NULL');
PRINT 'Agente: ' + ISNULL(@AgenteId, 'NULL');
PRINT 'Cliente: ' + ISNULL(@ClienteId, 'NULL');
PRINT 'Relacion: ' + ISNULL(@RelacionId, 'NULL');

-- Insertar Productos
IF @LineaNegocioId IS NOT NULL
BEGIN
    PRINT 'Insertando productos...';

    INSERT INTO Productos (Id, CodigoProducto, Nombre, NombreComercial, Descripcion, Presentacion, Categoria,
                          Laboratorio, PrincipioActivo, Concentracion, ViaAdministracion, Indicaciones,
                          PrecioReferencia, Activo, EsMuestra, RequiereReceta, LineaNegocioId, FechaCreacion, Status)
    VALUES
    (NEWID(), 'PROD-001', 'Paracetamol', 'Tylenol', 'Analgesico y antipiretico', 'Caja x 20 tabletas', 'Analgesico',
     'Laboratorio XYZ', 'Paracetamol', '500mg', 'Oral', 'Dolor leve a moderado, fiebre', 5.50, 1, 1, 0, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-002', 'Ibuprofeno', 'Advil', 'Antiinflamatorio no esteroideo', 'Caja x 30 capsulas', 'Antiinflamatorio',
     'Laboratorio ABC', 'Ibuprofeno', '400mg', 'Oral', 'Dolor, inflamacion, fiebre', 8.75, 1, 1, 0, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-003', 'Amoxicilina', 'Amoxil', 'Antibiotico de amplio espectro', 'Caja x 14 capsulas', 'Antibiotico',
     'Laboratorio DEF', 'Amoxicilina', '500mg', 'Oral', 'Infecciones bacterianas', 12.00, 1, 1, 1, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-004', 'Omeprazol', 'Prilosec', 'Inhibidor de bomba de protones', 'Caja x 28 capsulas', 'Gastrico',
     'Laboratorio GHI', 'Omeprazol', '20mg', 'Oral', 'Ulcera peptica, reflujo gastroesofagico', 15.50, 1, 1, 0, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-005', 'Losartan', 'Cozaar', 'Antihipertensivo', 'Caja x 30 tabletas', 'Cardiovascular',
     'Laboratorio JKL', 'Losartan', '50mg', 'Oral', 'Hipertension arterial', 18.00, 1, 1, 1, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-006', 'Metformina', 'Glucophage', 'Antidiabetico oral', 'Caja x 60 tabletas', 'Diabetes',
     'Laboratorio MNO', 'Metformina', '850mg', 'Oral', 'Diabetes tipo 2', 10.00, 1, 1, 1, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-007', 'Loratadina', 'Claritin', 'Antihistaminico', 'Caja x 10 tabletas', 'Alergias',
     'Laboratorio PQR', 'Loratadina', '10mg', 'Oral', 'Rinitis alergica, urticaria', 6.50, 1, 1, 0, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-008', 'Atorvastatina', 'Lipitor', 'Hipolipemiante', 'Caja x 30 tabletas', 'Cardiovascular',
     'Laboratorio STU', 'Atorvastatina', '20mg', 'Oral', 'Hipercolesterolemia', 22.00, 1, 1, 1, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-009', 'Diclofenaco', 'Voltaren', 'Antiinflamatorio', 'Caja x 20 tabletas', 'Antiinflamatorio',
     'Laboratorio VWX', 'Diclofenaco', '50mg', 'Oral', 'Dolor musculoesqueletico', 9.00, 1, 1, 0, @LineaNegocioId, GETDATE(), 0),

    (NEWID(), 'PROD-010', 'Salbutamol', 'Ventolin', 'Broncodilatador', 'Inhalador 200 dosis', 'Respiratorio',
     'Laboratorio YZA', 'Salbutamol', '100mcg/dosis', 'Inhalatoria', 'Asma, EPOC', 14.50, 1, 1, 1, @LineaNegocioId, GETDATE(), 0);

    PRINT 'Productos insertados: 10';
END
ELSE
BEGIN
    PRINT 'No se puede insertar productos: LineaNegocioId es NULL';
END

-- Insertar Inventario para el Agente
IF @AgenteId IS NOT NULL
BEGIN
    PRINT 'Insertando inventario para agente...';

    DECLARE @ProductoId1 NVARCHAR(450), @ProductoId2 NVARCHAR(450), @ProductoId3 NVARCHAR(450);

    SELECT TOP 1 @ProductoId1 = Id FROM Productos WHERE CodigoProducto = 'PROD-001';
    SELECT TOP 1 @ProductoId2 = Id FROM Productos WHERE CodigoProducto = 'PROD-002';
    SELECT TOP 1 @ProductoId3 = Id FROM Productos WHERE CodigoProducto = 'PROD-003';

    IF @ProductoId1 IS NOT NULL
    BEGIN
        INSERT INTO InventariosAgente (Id, AgenteId, ProductoId, CantidadDisponible, CantidadInicial, CantidadEntregada,
                                       FechaUltimaRecarga, LoteActual, FechaVencimiento, FechaCreacion, Status)
        VALUES
        (NEWID(), @AgenteId, @ProductoId1, 50, 50, 0, GETDATE(), 'LOTE-2024-001', DATEADD(YEAR, 2, GETDATE()), GETDATE(), 0);

        PRINT 'Inventario insertado para Producto 1';
    END

    IF @ProductoId2 IS NOT NULL
    BEGIN
        INSERT INTO InventariosAgente (Id, AgenteId, ProductoId, CantidadDisponible, CantidadInicial, CantidadEntregada,
                                       FechaUltimaRecarga, LoteActual, FechaVencimiento, FechaCreacion, Status)
        VALUES
        (NEWID(), @AgenteId, @ProductoId2, 30, 40, 10, GETDATE(), 'LOTE-2024-002', DATEADD(YEAR, 2, GETDATE()), GETDATE(), 0);

        PRINT 'Inventario insertado para Producto 2';
    END

    IF @ProductoId3 IS NOT NULL
    BEGIN
        INSERT INTO InventariosAgente (Id, AgenteId, ProductoId, CantidadDisponible, CantidadInicial, CantidadEntregada,
                                       FechaUltimaRecarga, LoteActual, FechaVencimiento, FechaCreacion, Status)
        VALUES
        (NEWID(), @AgenteId, @ProductoId3, 20, 25, 5, GETDATE(), 'LOTE-2024-003', DATEADD(YEAR, 1, GETDATE()), GETDATE(), 0);

        PRINT 'Inventario insertado para Producto 3';
    END
END
ELSE
BEGIN
    PRINT 'No se puede insertar inventario: AgenteId es NULL';
END

-- Insertar Citas
IF @AgenteId IS NOT NULL
BEGIN
    PRINT 'Insertando citas...';

    INSERT INTO Citas (Id, CodigoCita, AgenteId, RelacionId, ClienteId, Titulo, Descripcion,
                       FechaInicio, FechaFin, TodoElDia, TipoCita, Estado, Prioridad,
                       Recordatorio, MinutosAntes, FechaCreacion, Status)
    VALUES
    -- Cita para hoy
    (NEWID(), 'CITA-' + CONVERT(VARCHAR(8), GETDATE(), 112) + '-001', @AgenteId, @RelacionId, @ClienteId,
     'Visita Dr. Gonzalez', 'Presentacion de nuevos productos cardiovasculares',
     DATEADD(HOUR, 2, GETDATE()), DATEADD(HOUR, 3, GETDATE()), 0, 'Visita', 'Programada', 'Alta',
     1, 30, GETDATE(), 0),

    -- Cita para mañana mañana
    (NEWID(), 'CITA-' + CONVERT(VARCHAR(8), DATEADD(DAY, 1, GETDATE()), 112) + '-001', @AgenteId, @RelacionId, @ClienteId,
     'Visita Hospital Central', 'Entrega de muestras medicas',
     DATEADD(DAY, 1, DATEADD(HOUR, 9, CAST(CAST(GETDATE() AS DATE) AS DATETIME))),
     DATEADD(DAY, 1, DATEADD(HOUR, 10, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 0, 'Visita', 'Programada', 'Alta',
     1, 15, GETDATE(), 0),

    -- Cita para mañana tarde
    (NEWID(), 'CITA-' + CONVERT(VARCHAR(8), DATEADD(DAY, 1, GETDATE()), 112) + '-002', @AgenteId, @RelacionId, @ClienteId,
     'Reunion Dra. Martinez', 'Seguimiento de casos clinicos',
     DATEADD(DAY, 1, DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME))),
     DATEADD(DAY, 1, DATEADD(HOUR, 15, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 0, 'Reunion', 'Programada', 'Media',
     1, 30, GETDATE(), 0),

    -- Cita para la proxima semana
    (NEWID(), 'CITA-' + CONVERT(VARCHAR(8), DATEADD(DAY, 7, GETDATE()), 112) + '-001', @AgenteId, NULL, NULL,
     'Congreso Medico Regional', 'Participacion en stand farmaceutico',
     DATEADD(DAY, 7, DATEADD(HOUR, 8, CAST(CAST(GETDATE() AS DATE) AS DATETIME))),
     DATEADD(DAY, 7, DATEADD(HOUR, 18, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 1, 'Evento', 'Programada', 'Alta',
     1, 60, GETDATE(), 0),

    -- Cita completada (ayer)
    (NEWID(), 'CITA-' + CONVERT(VARCHAR(8), DATEADD(DAY, -1, GETDATE()), 112) + '-001', @AgenteId, @RelacionId, @ClienteId,
     'Visita Dr. Rodriguez', 'Presentacion producto diabetes',
     DATEADD(DAY, -1, DATEADD(HOUR, 10, CAST(CAST(GETDATE() AS DATE) AS DATETIME))),
     DATEADD(DAY, -1, DATEADD(HOUR, 11, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 0, 'Visita', 'Completada', 'Alta',
     1, 30, DATEADD(DAY, -2, GETDATE()), 0);

    PRINT 'Citas insertadas: 5';
END
ELSE
BEGIN
    PRINT 'No se puede insertar citas: AgenteId es NULL';
END

PRINT '';
PRINT 'Script de datos de prueba completado exitosamente!';
PRINT '';

-- Mostrar resumen
SELECT 'Productos' AS Tabla, COUNT(*) AS Total FROM Productos
UNION ALL
SELECT 'InventariosAgente', COUNT(*) FROM InventariosAgente
UNION ALL
SELECT 'Citas', COUNT(*) FROM Citas;
