-- Script para verificar y crear productos de promoción (no muestras)

-- 1. Ver cuántos productos hay por tipo
SELECT
    EsMuestra,
    Activo,
    COUNT(*) as Cantidad
FROM Productos
WHERE Status = 0
GROUP BY EsMuestra, Activo;

-- 2. Ver todos los productos que NO son muestras
SELECT
    Id,
    CodigoProducto,
    Nombre,
    NombreComercial,
    EsMuestra,
    Activo,
    Categoria
FROM Productos
WHERE Status = 0
  AND EsMuestra = 0
ORDER BY Activo DESC, Nombre;

-- 3. Si no hay productos de promoción, insertar algunos ejemplos
-- (Descomentar si es necesario)
/*
INSERT INTO Productos (Id, CodigoProducto, Nombre, NombreComercial, Categoria, Activo, EsMuestra, RequiereReceta, Status, FechaCreacion)
VALUES
(NEWID(), 'PROMO-001', 'Paracetamol 500mg', 'Panadol', 'Analgésicos', 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-002', 'Ibuprofeno 400mg', 'Advil', 'Antiinflamatorios', 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-003', 'Amoxicilina 500mg', 'Amoxil', 'Antibióticos', 1, 0, 1, 0, GETDATE()),
(NEWID(), 'PROMO-004', 'Omeprazol 20mg', 'Losec', 'Protectores Gástricos', 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-005', 'Loratadina 10mg', 'Clarityne', 'Antihistamínicos', 1, 0, 0, 0, GETDATE());
*/
