-- Agregar columna agenteId a la tabla Usuarios
-- Esta columna relaciona un usuario con un agente (representante)

USE PharMind;
GO

-- Agregar la columna agenteId si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE Name = N'agenteId'
    AND Object_ID = Object_ID(N'Usuarios')
)
BEGIN
    ALTER TABLE Usuarios
    ADD agenteId NVARCHAR(450) NULL;

    PRINT 'Columna agenteId agregada exitosamente a la tabla Usuarios';
END
ELSE
BEGIN
    PRINT 'La columna agenteId ya existe en la tabla Usuarios';
END
GO

-- Agregar foreign key constraint si no existe
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys
    WHERE name = 'FK_Usuarios_Agentes_agenteId'
)
BEGIN
    ALTER TABLE Usuarios
    ADD CONSTRAINT FK_Usuarios_Agentes_agenteId
    FOREIGN KEY (agenteId) REFERENCES Agentes(Id)
    ON DELETE SET NULL;

    PRINT 'Foreign key FK_Usuarios_Agentes_agenteId agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Foreign key FK_Usuarios_Agentes_agenteId ya existe';
END
GO

-- Actualizar usuarios existentes que sean representantes
-- Vincular cada usuario con su agente correspondiente basado en el email
UPDATE u
SET u.agenteId = a.Id
FROM Usuarios u
INNER JOIN Agentes a ON u.email = a.Email
WHERE u.agenteId IS NULL;

PRINT 'Usuarios actualizados con sus respectivos agenteId';
GO

-- Verificar resultados
SELECT
    u.id,
    u.email,
    u.agenteId,
    a.Nombre + ' ' + a.Apellido as NombreAgente
FROM Usuarios u
LEFT JOIN Agentes a ON u.agenteId = a.Id
WHERE u.email LIKE '%@pharmind.com';
GO
