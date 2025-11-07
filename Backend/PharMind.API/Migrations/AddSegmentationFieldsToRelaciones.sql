-- Agregar campos de segmentación a la tabla Relaciones
-- Estos campos permiten clasificar las relaciones por especialidad, categoría y hasta 5 segmentos personalizables

ALTER TABLE Relaciones
ADD EspecialidadId UNIQUEIDENTIFIER NULL,
    CategoriaId UNIQUEIDENTIFIER NULL,
    Segment1Id UNIQUEIDENTIFIER NULL,
    Segment2Id UNIQUEIDENTIFIER NULL,
    Segment3Id UNIQUEIDENTIFIER NULL,
    Segment4Id UNIQUEIDENTIFIER NULL,
    Segment5Id UNIQUEIDENTIFIER NULL;

-- Nota: Estas columnas no tienen FK constraints porque las tablas maestras son dinámicas
-- y se configuran a través del esquema JSON de cada tipo de relación
