-- ================================================
-- Migración: Corregir Foreign Key de EntidadDinamicaId en Interacciones
-- Fecha: 2025-11-05
-- Descripción: Corrige FK que apunta incorrectamente a EsquemasPersonalizados
--              debe apuntar a EntidadesDinamicas
-- ================================================

BEGIN TRANSACTION;

BEGIN TRY
    -- Verificar si existe el FK incorrecto
    IF EXISTS (
        SELECT * FROM sys.foreign_keys
        WHERE name = 'FK_Interacciones_EsquemasPersonalizados_EntidadDinamicaId'
        AND parent_object_id = OBJECT_ID(N'[Interacciones]')
    )
    BEGIN
        -- Eliminar FK incorrecto
        ALTER TABLE [Interacciones]
        DROP CONSTRAINT [FK_Interacciones_EsquemasPersonalizados_EntidadDinamicaId];

        PRINT 'FK incorrecto eliminado: FK_Interacciones_EsquemasPersonalizados_EntidadDinamicaId';
    END
    ELSE
    BEGIN
        PRINT 'FK incorrecto no encontrado (puede que ya esté corregido)';
    END

    -- Verificar si existe el FK correcto
    IF NOT EXISTS (
        SELECT * FROM sys.foreign_keys
        WHERE name = 'FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId'
        AND parent_object_id = OBJECT_ID(N'[Interacciones]')
    )
    BEGIN
        -- Crear FK correcto
        ALTER TABLE [Interacciones]
        ADD CONSTRAINT [FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId]
        FOREIGN KEY ([EntidadDinamicaId])
        REFERENCES [EntidadesDinamicas] ([Id]) ON DELETE NO ACTION;

        PRINT 'FK correcto creado: FK_Interacciones_EntidadesDinamicas_EntidadDinamicaId';
    END
    ELSE
    BEGIN
        PRINT 'FK correcto ya existe';
    END

    -- Verificar el índice
    IF NOT EXISTS (
        SELECT * FROM sys.indexes
        WHERE name = 'IX_Interacciones_EntidadDinamicaId'
        AND object_id = OBJECT_ID(N'[Interacciones]')
    )
    BEGIN
        CREATE INDEX [IX_Interacciones_EntidadDinamicaId] ON [Interacciones] ([EntidadDinamicaId]);
        PRINT 'Índice IX_Interacciones_EntidadDinamicaId creado';
    END
    ELSE
    BEGIN
        PRINT 'Índice IX_Interacciones_EntidadDinamicaId ya existe';
    END

    COMMIT TRANSACTION;
    PRINT 'Migración completada exitosamente: FK de EntidadDinamicaId corregido';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT 'Error durante la migración: ' + @ErrorMessage;
    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;
GO
