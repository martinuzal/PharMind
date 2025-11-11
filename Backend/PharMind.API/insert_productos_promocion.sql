-- Script para insertar productos de promoción (NO muestras)
-- Estos productos se pueden usar para promocionar en interacciones

-- Insertar productos de promoción variados
INSERT INTO Productos (
    Id,
    CodigoProducto,
    Nombre,
    NombreComercial,
    Descripcion,
    Presentacion,
    Categoria,
    Laboratorio,
    PrincipioActivo,
    Concentracion,
    ViaAdministracion,
    PrecioReferencia,
    Activo,
    EsMuestra,
    RequiereReceta,
    Status,
    FechaCreacion
)
VALUES
-- Analgésicos y antiinflamatorios
(NEWID(), 'PROMO-001', 'Paracetamol', 'Panadol', 'Analgésico y antipirético', 'Tabletas x 20', 'Analgésicos', 'GSK', 'Paracetamol', '500mg', 'Oral', 5000, 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-002', 'Ibuprofeno', 'Advil', 'Antiinflamatorio no esteroideo', 'Tabletas x 20', 'Antiinflamatorios', 'Pfizer', 'Ibuprofeno', '400mg', 'Oral', 8000, 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-003', 'Naproxeno', 'Flanax', 'Antiinflamatorio y analgésico', 'Tabletas x 20', 'Antiinflamatorios', 'Bayer', 'Naproxeno Sódico', '550mg', 'Oral', 12000, 1, 0, 0, 0, GETDATE()),

-- Antibióticos
(NEWID(), 'PROMO-004', 'Amoxicilina', 'Amoxil', 'Antibiótico de amplio espectro', 'Cápsulas x 21', 'Antibióticos', 'GSK', 'Amoxicilina', '500mg', 'Oral', 15000, 1, 0, 1, 0, GETDATE()),
(NEWID(), 'PROMO-005', 'Azitromicina', 'Zitromax', 'Antibiótico macrólido', 'Tabletas x 6', 'Antibióticos', 'Pfizer', 'Azitromicina', '500mg', 'Oral', 25000, 1, 0, 1, 0, GETDATE()),

-- Protectores gástricos
(NEWID(), 'PROMO-006', 'Omeprazol', 'Losec', 'Inhibidor de bomba de protones', 'Cápsulas x 14', 'Protectores Gástricos', 'AstraZeneca', 'Omeprazol', '20mg', 'Oral', 18000, 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-007', 'Ranitidina', 'Zantac', 'Antagonista H2', 'Tabletas x 30', 'Protectores Gástricos', 'GSK', 'Ranitidina', '150mg', 'Oral', 14000, 1, 0, 0, 0, GETDATE()),

-- Antihistamínicos
(NEWID(), 'PROMO-008', 'Loratadina', 'Clarityne', 'Antihistamínico de segunda generación', 'Tabletas x 10', 'Antihistamínicos', 'Bayer', 'Loratadina', '10mg', 'Oral', 10000, 1, 0, 0, 0, GETDATE()),
(NEWID(), 'PROMO-009', 'Cetirizina', 'Zyrtec', 'Antihistamínico para alergias', 'Tabletas x 10', 'Antihistamínicos', 'Johnson & Johnson', 'Cetirizina', '10mg', 'Oral', 11000, 1, 0, 0, 0, GETDATE()),

-- Antihipertensivos
(NEWID(), 'PROMO-010', 'Losartán', 'Cozaar', 'Antihipertensivo', 'Tabletas x 30', 'Antihipertensivos', 'MSD', 'Losartán Potásico', '50mg', 'Oral', 22000, 1, 0, 1, 0, GETDATE()),
(NEWID(), 'PROMO-011', 'Enalapril', 'Renitec', 'Inhibidor de ECA', 'Tabletas x 30', 'Antihipertensivos', 'MSD', 'Enalapril Maleato', '10mg', 'Oral', 16000, 1, 0, 1, 0, GETDATE()),

-- Hipoglicemiantes
(NEWID(), 'PROMO-012', 'Metformina', 'Glucophage', 'Antidiabético oral', 'Tabletas x 60', 'Hipoglicemiantes', 'Merck', 'Metformina HCl', '850mg', 'Oral', 20000, 1, 0, 1, 0, GETDATE()),

-- Hipolipemiantes
(NEWID(), 'PROMO-013', 'Atorvastatina', 'Lipitor', 'Estatina para colesterol', 'Tabletas x 30', 'Hipolipemiantes', 'Pfizer', 'Atorvastatina Cálcica', '20mg', 'Oral', 28000, 1, 0, 1, 0, GETDATE()),
(NEWID(), 'PROMO-014', 'Simvastatina', 'Zocor', 'Reductor de colesterol', 'Tabletas x 30', 'Hipolipemiantes', 'MSD', 'Simvastatina', '20mg', 'Oral', 18000, 1, 0, 1, 0, GETDATE()),

-- Vitaminas y suplementos
(NEWID(), 'PROMO-015', 'Complejo B', 'Bedoyecta', 'Complejo vitamínico B', 'Cápsulas x 30', 'Vitaminas', 'Genomma Lab', 'Complejo B', 'Multi', 'Oral', 25000, 1, 0, 0, 0, GETDATE());

-- Verificar la inserción
SELECT
    EsMuestra,
    Activo,
    COUNT(*) as Cantidad
FROM Productos
WHERE Status = 0
GROUP BY EsMuestra, Activo;

PRINT '';
PRINT 'Productos de promoción insertados exitosamente!';
PRINT '';
