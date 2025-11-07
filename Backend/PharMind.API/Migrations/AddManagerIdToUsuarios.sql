-- Agregar campo ManagerId a la tabla Usuarios
-- Este campo permite vincular un usuario con un Manager

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'ManagerId')
BEGIN
    ALTER TABLE Usuarios
    ADD ManagerId NVARCHAR(450) NULL;

    -- Crear foreign key constraint
    ALTER TABLE Usuarios
    ADD CONSTRAINT FK_Usuarios_Managers_ManagerId
    FOREIGN KEY (ManagerId) REFERENCES Managers(Id);

    PRINT 'Columna ManagerId agregada exitosamente a la tabla Usuarios';
END
ELSE
BEGIN
    PRINT 'La columna ManagerId ya existe en la tabla Usuarios';
END
GO

-- Verificar la columna agregada
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'ManagerId';
GO
