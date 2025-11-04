SET QUOTED_IDENTIFIER ON;

DECLARE @Id NVARCHAR(450) = NEWID();

IF NOT EXISTS (SELECT * FROM EsquemasPersonalizados WHERE EntidadTipo = 'Relacion' AND SubTipo = 'Cartera')
BEGIN
    -- Obtener IDs de esquemas de Cliente existentes
    DECLARE @MedicoId NVARCHAR(450) = (SELECT TOP 1 Id FROM EsquemasPersonalizados WHERE EntidadTipo = 'Cliente' AND SubTipo = 'medico-general');
    DECLARE @FarmaciaId NVARCHAR(450) = (SELECT TOP 1 Id FROM EsquemasPersonalizados WHERE EntidadTipo = 'Cliente' AND SubTipo = 'farmacia');

    -- Construir el schema con clientesConfig
    DECLARE @SchemaJson NVARCHAR(MAX) = '{
        "campos": [],
        "clientesConfig": {
            "clientePrincipal": {
                "visible": true,
                "requerido": true,
                "tiposPermitidos": [' +
                ISNULL('"' + @MedicoId + '"', '') +
                '],
                "etiqueta": "Médico"
            },
            "clienteSecundario1": {
                "visible": true,
                "requerido": false,
                "tiposPermitidos": [' +
                ISNULL('"' + @FarmaciaId + '"', '') +
                '],
                "etiqueta": "Farmacia / Institución"
            },
            "clienteSecundario2": {
                "visible": false,
                "requerido": false,
                "tiposPermitidos": [],
                "etiqueta": "Cliente Adicional"
            }
        }
    }';

    INSERT INTO EsquemasPersonalizados (
        Id, Nombre, Descripcion, EntidadTipo, SubTipo,
        [Schema], [Version], Icono, Color, Activo, Orden,
        FechaCreacion, CreadoPor, [Status]
    )
    VALUES (
        @Id,
        'Cartera de Clientes',
        'Relación de cartera entre agentes y clientes',
        'Relacion',
        'Cartera',
        @SchemaJson,
        1,
        'link',
        '#3B82F6',
        1,
        0,
        GETDATE(),
        'System',
        0
    );

    PRINT 'Esquema Relacion-Cartera creado exitosamente con ID: ' + @Id;
    PRINT 'Configuración de clientes:';
    PRINT '  - Cliente Principal (Médico): ' + ISNULL(@MedicoId, 'NO ENCONTRADO');
    PRINT '  - Cliente Secundario 1 (Farmacia): ' + ISNULL(@FarmaciaId, 'NO ENCONTRADO');
END
ELSE
BEGIN
    PRINT 'Esquema Relacion-Cartera ya existe';
END
