-- ================================================
-- Script de configuración completa para Tiempo Utilizado
-- Ejecuta en orden: TiempoUtilizado -> Relación con TiposActividad
-- ================================================

-- 1. Crear tabla TiempoUtilizado (si no existe)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[TiempoUtilizado]') AND type in (N'U'))
BEGIN
    CREATE TABLE [TiempoUtilizado] (
        [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
        [RepresentanteId] NVARCHAR(450) NOT NULL,
        [Fecha] DATETIME2 NOT NULL,
        [TipoActividadId] NVARCHAR(450) NOT NULL,  -- Ya creado con FK desde el inicio
        [Descripcion] NVARCHAR(500) NULL,
        [HorasUtilizadas] DECIMAL(18,2) NOT NULL,
        [MinutosUtilizados] INT NOT NULL,
        [EsRecurrente] BIT NOT NULL DEFAULT 0,
        [Observaciones] NVARCHAR(1000) NULL,
        [FechaCreacion] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [CreadoPor] NVARCHAR(255) NULL,
        [FechaModificacion] DATETIME2 NULL,
        [ModificadoPor] NVARCHAR(255) NULL,
        [Status] BIT NULL DEFAULT 0,
        CONSTRAINT [FK_TiempoUtilizado_Usuarios_RepresentanteId] FOREIGN KEY ([RepresentanteId])
            REFERENCES [Usuarios] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TiempoUtilizado_TiposActividad_TipoActividadId] FOREIGN KEY ([TipoActividadId])
            REFERENCES [TiposActividad] ([Id]) ON DELETE NO ACTION
    );

    -- Crear índices
    CREATE INDEX [IX_TiempoUtilizado_RepresentanteId] ON [TiempoUtilizado] ([RepresentanteId]);
    CREATE INDEX [IX_TiempoUtilizado_Fecha] ON [TiempoUtilizado] ([Fecha]);
    CREATE INDEX [IX_TiempoUtilizado_TipoActividadId] ON [TiempoUtilizado] ([TipoActividadId]);
    CREATE INDEX [IX_TiempoUtilizado_Status] ON [TiempoUtilizado] ([Status]);

    PRINT 'Tabla TiempoUtilizado creada exitosamente con TipoActividadId';
END
ELSE
BEGIN
    PRINT 'La tabla TiempoUtilizado ya existe';
END
GO

-- 2. Verificar que TiposActividad tenga datos iniciales
IF NOT EXISTS (SELECT * FROM TiposActividad WHERE EsSistema = 1)
BEGIN
    PRINT 'Insertando tipos de actividad del sistema...';

    -- Tipos Laborales
    INSERT INTO TiposActividad (Id, Codigo, Nombre, Descripcion, Clasificacion, Color, Icono, Activo, EsSistema, Orden, Status, FechaCreacion, CreadoPor)
    VALUES
        (NEWID(), 'CAP', 'Capacitación', 'Tiempo dedicado a capacitaciones y formación', 'Laboral', '#1976d2', 'school', 1, 1, 1, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'REU', 'Reuniones Internas', 'Reuniones con equipo y gerencia', 'Laboral', '#388e3c', 'groups', 1, 1, 2, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'ADM', 'Tareas Administrativas', 'Reportes, planificación y tareas administrativas', 'Laboral', '#f57c00', 'assignment', 1, 1, 3, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'DES', 'Desplazamiento', 'Tiempo de viaje entre visitas', 'Laboral', '#7b1fa2', 'commute', 1, 1, 4, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'OTR', 'Otros', 'Otras actividades laborales', 'Laboral', '#757575', 'work', 1, 1, 5, 0, GETDATE(), 'Sistema');

    -- Tipos Extra-Laborales
    INSERT INTO TiposActividad (Id, Codigo, Nombre, Descripcion, Clasificacion, Color, Icono, Activo, EsSistema, Orden, Status, FechaCreacion, CreadoPor)
    VALUES
        (NEWID(), 'ALM', 'Almuerzo/Refrigerio', 'Tiempo de almuerzo y refrigerios', 'ExtraLaboral', '#4caf50', 'restaurant', 1, 1, 6, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'PER', 'Permisos Personales', 'Permisos y trámites personales', 'ExtraLaboral', '#ff9800', 'event', 1, 1, 7, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'ENF', 'Enfermedad', 'Ausencias por enfermedad', 'ExtraLaboral', '#f44336', 'local_hospital', 1, 1, 8, 0, GETDATE(), 'Sistema'),
        (NEWID(), 'VAC', 'Vacaciones', 'Período de vacaciones', 'ExtraLaboral', '#03a9f4', 'beach_access', 1, 1, 9, 0, GETDATE(), 'Sistema');

    PRINT 'Tipos de actividad del sistema insertados correctamente';
END
ELSE
BEGIN
    PRINT 'Los tipos de actividad del sistema ya existen';
END
GO

PRINT 'Configuración completa de Tiempo Utilizado finalizada exitosamente';
