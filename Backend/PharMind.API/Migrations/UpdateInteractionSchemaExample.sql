-- Script para actualizar un esquema de interacción con configuración de campos estáticos
-- Este es un EJEMPLO que puedes adaptar a tu esquema específico

USE PharMindDB;
GO

-- Primero, encuentra el ID de tu esquema de interacción
-- Ejecuta esto para ver todos los esquemas de interacción:
SELECT
    Id,
    Nombre,
    SubTipo,
    Schema
FROM EsquemasPersonalizados
WHERE EntidadTipo = 'Interaccion'
    AND Status = 0;
GO

-- Luego, actualiza el esquema específico que quieras configurar
-- IMPORTANTE: Reemplaza 'TU-ESQUEMA-ID-AQUI' con el ID real del esquema

DECLARE @EsquemaId NVARCHAR(450) = 'TU-ESQUEMA-ID-AQUI'; -- ⚠️ CAMBIAR ESTE ID
DECLARE @SchemaActual NVARCHAR(MAX);
DECLARE @SchemaActualizado NVARCHAR(MAX);

-- Obtener el schema actual
SELECT @SchemaActual = [Schema]
FROM EsquemasPersonalizados
WHERE Id = @EsquemaId;

-- Parsear el JSON actual y agregar staticFieldsConfig
-- Este ejemplo OCULTA algunos campos y MODIFICA labels de otros
SET @SchemaActualizado = JSON_MODIFY(
    JSON_MODIFY(
        JSON_MODIFY(
            JSON_MODIFY(
                JSON_MODIFY(
                    JSON_MODIFY(
                        JSON_MODIFY(
                            JSON_MODIFY(
                                JSON_MODIFY(
                                    JSON_MODIFY(
                                        ISNULL(@SchemaActual, '{"fields":[],"version":1}'),
                                        '$.staticFieldsConfig.campos.CodigoInteraccion.visible', CAST(1 AS BIT)
                                    ),
                                    '$.staticFieldsConfig.campos.CodigoInteraccion.requerido', CAST(0 AS BIT)
                                ),
                                '$.staticFieldsConfig.campos.CodigoInteraccion.label', 'Código de Visita'
                            ),
                            '$.staticFieldsConfig.campos.Turno.visible', CAST(0 AS BIT) -- ⚠️ OCULTA el campo Turno
                        ),
                        '$.staticFieldsConfig.campos.DuracionMinutos.visible', CAST(0 AS BIT) -- ⚠️ OCULTA Duración
                    ),
                    '$.staticFieldsConfig.campos.Latitud.visible', CAST(0 AS BIT) -- ⚠️ OCULTA Latitud
                ),
                '$.staticFieldsConfig.campos.Longitud.visible', CAST(0 AS BIT) -- ⚠️ OCULTA Longitud
            ),
            '$.staticFieldsConfig.campos.ObjetivoVisita.visible', CAST(1 AS BIT)
        ),
        '$.staticFieldsConfig.campos.ObjetivoVisita.requerido', CAST(1 AS BIT) -- ⚠️ HACE OBLIGATORIO
    ),
    '$.staticFieldsConfig.campos.ObjetivoVisita.label', 'Objetivo de la Visita Médica'
);

-- Actualizar el esquema en la base de datos
UPDATE EsquemasPersonalizados
SET [Schema] = @SchemaActualizado,
    FechaModificacion = GETDATE(),
    ModificadoPor = 'System-Migration-StaticFields',
    Version = Version + 1
WHERE Id = @EsquemaId;

-- Verificar el resultado
SELECT
    Id,
    Nombre,
    [Schema],
    Version
FROM EsquemasPersonalizados
WHERE Id = @EsquemaId;

PRINT '✅ Schema actualizado correctamente';
PRINT '';
PRINT 'Campos OCULTOS: Turno, DuracionMinutos, Latitud, Longitud';
PRINT 'Campos OBLIGATORIOS: ObjetivoVisita';
PRINT 'Labels MODIFICADOS: CodigoInteraccion -> "Código de Visita", ObjetivoVisita -> "Objetivo de la Visita Médica"';
GO

-- ============================================================================
-- EJEMPLO 2: Schema más completo con todos los campos configurados
-- ============================================================================

/*
-- Descomenta esta sección si quieres un ejemplo más completo

DECLARE @EsquemaId2 NVARCHAR(450) = 'TU-ESQUEMA-ID-AQUI'; -- ⚠️ CAMBIAR ESTE ID

UPDATE EsquemasPersonalizados
SET [Schema] = '{
  "fields": [],
  "version": 1,
  "staticFieldsConfig": {
    "campos": {
      "CodigoInteraccion": {
        "visible": true,
        "requerido": false,
        "label": "Código de Visita"
      },
      "RelacionId": {
        "visible": true,
        "requerido": true,
        "label": "Relación"
      },
      "AgenteId": {
        "visible": true,
        "requerido": true,
        "label": "Visitador Médico"
      },
      "ClienteId": {
        "visible": true,
        "requerido": true,
        "label": "Médico"
      },
      "Fecha": {
        "visible": true,
        "requerido": true,
        "label": "Fecha de Visita"
      },
      "Turno": {
        "visible": false
      },
      "TipoInteraccion": {
        "visible": true,
        "requerido": false,
        "label": "Tipo de Visita"
      },
      "DuracionMinutos": {
        "visible": false
      },
      "Resultado": {
        "visible": true,
        "requerido": true,
        "label": "Resultado de la Visita"
      },
      "ObjetivoVisita": {
        "visible": true,
        "requerido": true,
        "label": "Objetivo de la Visita Médica"
      },
      "ResumenVisita": {
        "visible": true,
        "requerido": true,
        "label": "Resumen de la Visita"
      },
      "ProximaAccion": {
        "visible": true,
        "requerido": false,
        "label": "Próxima Acción"
      },
      "FechaProximaAccion": {
        "visible": true,
        "requerido": false,
        "label": "Fecha Próxima Visita"
      },
      "Latitud": {
        "visible": false
      },
      "Longitud": {
        "visible": false
      },
      "Observaciones": {
        "visible": true,
        "requerido": false,
        "label": "Observaciones"
      }
    }
  }
}',
    FechaModificacion = GETDATE(),
    ModificadoPor = 'System-Migration-StaticFields-Full',
    Version = Version + 1
WHERE Id = @EsquemaId2;

PRINT '✅ Schema COMPLETO actualizado correctamente';
*/
