SET QUOTED_IDENTIFIER ON;
GO

-- Update Vendedor schema with assignment fields
UPDATE EsquemasPersonalizados
SET [Schema] = JSON_MODIFY(
    JSON_MODIFY(
        JSON_MODIFY(
            JSON_MODIFY(
                JSON_MODIFY(
                    [Schema],
                    '$.staticFieldsConfig.campos.RegionId',
                    JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Región"}')
                ),
                '$.staticFieldsConfig.campos.LineaNegocioId',
                JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Línea de Negocio"}')
            ),
            '$.staticFieldsConfig.campos.ManagerId',
            JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Manager"}')
        ),
        '$.staticFieldsConfig.campos.TimelineId',
        JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Timeline"}')
    ),
    '$.staticFieldsConfig.campos.Observaciones',
    JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Observaciones"}')
)
WHERE Nombre = 'Vendedor' AND EntidadTipo = 'Agente';

-- Update Representante schema with assignment fields
UPDATE EsquemasPersonalizados
SET [Schema] = JSON_MODIFY(
    JSON_MODIFY(
        JSON_MODIFY(
            JSON_MODIFY(
                JSON_MODIFY(
                    [Schema],
                    '$.staticFieldsConfig.campos.RegionId',
                    JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Región"}')
                ),
                '$.staticFieldsConfig.campos.LineaNegocioId',
                JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Línea de Negocio"}')
            ),
            '$.staticFieldsConfig.campos.ManagerId',
            JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Manager"}')
        ),
        '$.staticFieldsConfig.campos.TimelineId',
        JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Timeline"}')
    ),
    '$.staticFieldsConfig.campos.Observaciones',
    JSON_QUERY('{"visible": true, "requerido": false, "autoload": false, "label": "Observaciones"}')
)
WHERE Nombre = 'Representante' AND EntidadTipo = 'Agente';

SELECT 'Schemas updated successfully' as Result;
