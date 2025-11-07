import React, { useState, useEffect, useMemo } from 'react';
import './DireccionForm.css';

// Datos de prueba - Provincias de Argentina
const PROVINCIAS_ARG = [
  { id: 1, codigo: 'CABA', nombre: 'Ciudad Autónoma de Buenos Aires' },
  { id: 2, codigo: 'BA', nombre: 'Buenos Aires' },
  { id: 3, codigo: 'CBA', nombre: 'Córdoba' },
  { id: 4, codigo: 'SF', nombre: 'Santa Fe' },
  { id: 5, codigo: 'MZA', nombre: 'Mendoza' },
  { id: 6, codigo: 'TUC', nombre: 'Tucumán' },
  { id: 7, codigo: 'ER', nombre: 'Entre Ríos' },
  { id: 8, codigo: 'SAL', nombre: 'Salta' },
  { id: 9, codigo: 'CHA', nombre: 'Chaco' },
  { id: 10, codigo: 'COR', nombre: 'Corrientes' },
];

// Datos de prueba - Localidades por provincia
const LOCALIDADES_ARG: Record<number, Array<{id: number, nombre: string, codigoPostal: string}>> = {
  1: [ // CABA
    { id: 1, nombre: 'Retiro', codigoPostal: 'C1001' },
    { id: 2, nombre: 'San Nicolás', codigoPostal: 'C1002' },
    { id: 3, nombre: 'Puerto Madero', codigoPostal: 'C1107' },
    { id: 4, nombre: 'Recoleta', codigoPostal: 'C1113' },
    { id: 5, nombre: 'Balvanera', codigoPostal: 'C1200' },
    { id: 6, nombre: 'San Cristóbal', codigoPostal: 'C1204' },
    { id: 7, nombre: 'Palermo', codigoPostal: 'C1414' },
    { id: 8, nombre: 'Belgrano', codigoPostal: 'C1426' },
    { id: 9, nombre: 'Caballito', codigoPostal: 'C1406' },
    { id: 10, nombre: 'Villa Urquiza', codigoPostal: 'C1430' },
  ],
  2: [ // Buenos Aires
    { id: 11, nombre: 'La Plata', codigoPostal: 'B1900' },
    { id: 12, nombre: 'Vicente López', codigoPostal: 'B1638' },
    { id: 13, nombre: 'San Isidro', codigoPostal: 'B1642' },
    { id: 14, nombre: 'Tigre', codigoPostal: 'B1648' },
    { id: 15, nombre: 'Pilar', codigoPostal: 'B1629' },
    { id: 16, nombre: 'Quilmes', codigoPostal: 'B1878' },
    { id: 17, nombre: 'Lomas de Zamora', codigoPostal: 'B1832' },
    { id: 18, nombre: 'Avellaneda', codigoPostal: 'B1870' },
  ],
  3: [ // Córdoba
    { id: 19, nombre: 'Córdoba Capital', codigoPostal: 'X5000' },
    { id: 20, nombre: 'Villa Carlos Paz', codigoPostal: 'X5152' },
    { id: 21, nombre: 'Río Cuarto', codigoPostal: 'X5800' },
  ],
  4: [ // Santa Fe
    { id: 22, nombre: 'Rosario', codigoPostal: 'S2000' },
    { id: 23, nombre: 'Santa Fe Capital', codigoPostal: 'S3000' },
  ],
  5: [ // Mendoza
    { id: 24, nombre: 'Mendoza Capital', codigoPostal: 'M5500' },
    { id: 25, nombre: 'Godoy Cruz', codigoPostal: 'M5501' },
  ],
};

// Datos de prueba - Calles por localidad
const CALLES_ARG: Record<number, Array<{id: number, nombre: string, tipo: string}>> = {
  5: [ // Balvanera
    { id: 1, nombre: 'Corrientes', tipo: 'Avenida' },
    { id: 2, nombre: 'Callao', tipo: 'Avenida' },
    { id: 3, nombre: 'Rivadavia', tipo: 'Avenida' },
    { id: 4, nombre: 'Pueyrredón', tipo: 'Avenida' },
  ],
  4: [ // Recoleta
    { id: 5, nombre: 'Santa Fe', tipo: 'Avenida' },
    { id: 6, nombre: 'Las Heras', tipo: 'Avenida' },
    { id: 7, nombre: 'del Libertador', tipo: 'Avenida' },
  ],
  1: [ // Retiro
    { id: 8, nombre: '9 de Julio', tipo: 'Avenida' },
    { id: 9, nombre: 'Leandro N. Alem', tipo: 'Avenida' },
  ],
  3: [ // Puerto Madero
    { id: 10, nombre: 'Juana Manso', tipo: 'Calle' },
    { id: 11, nombre: 'Alicia Moreau de Justo', tipo: 'Avenida' },
  ],
  7: [ // Palermo
    { id: 12, nombre: 'Santa Fe', tipo: 'Avenida' },
    { id: 13, nombre: 'Córdoba', tipo: 'Avenida' },
    { id: 14, nombre: 'Juan B. Justo', tipo: 'Avenida' },
  ],
  11: [ // La Plata
    { id: 15, nombre: 'Calle 7', tipo: 'Calle' },
    { id: 16, nombre: 'Calle 51', tipo: 'Calle' },
    { id: 17, nombre: 'Diagonal 74', tipo: 'Diagonal' },
  ],
  19: [ // Córdoba Capital
    { id: 18, nombre: 'Colón', tipo: 'Avenida' },
    { id: 19, nombre: 'General Paz', tipo: 'Avenida' },
    { id: 20, nombre: 'Vélez Sarsfield', tipo: 'Avenida' },
  ],
  22: [ // Rosario
    { id: 21, nombre: 'San Martín', tipo: 'Bulevar' },
    { id: 22, nombre: 'Oroño', tipo: 'Bulevar' },
    { id: 23, nombre: 'Pellegrini', tipo: 'Avenida' },
  ],
};

export interface DireccionData {
  paisId?: number;
  provinciaEstadoId?: number;
  localidadId?: number;
  codigoPostal?: string;
  calleId?: number;
  calleNombre?: string;
  altura?: number;
  piso?: string;
  departamento?: string;
  torre?: string;
  entreCalles?: string;
  barrio?: string;
  referencias?: string;
}

interface DireccionFormProps {
  value: DireccionData;
  onChange: (direccion: DireccionData) => void;
  disabled?: boolean;
  required?: boolean;
}

const DireccionForm: React.FC<DireccionFormProps> = ({
  value,
  onChange,
  disabled = false,
  required = false
}) => {
  const [localidades, setLocalidades] = useState<Array<{id: number, nombre: string, codigoPostal: string}>>([]);
  const [calles, setCalles] = useState<Array<{id: number, nombre: string, tipo: string}>>([]);
  const [calleNombreManual, setCalleNombreManual] = useState<string>('');
  const [usarCalleManual, setUsarCalleManual] = useState<boolean>(false);

  // Cargar localidades cuando cambia la provincia
  useEffect(() => {
    if (value.provinciaEstadoId) {
      const localidadesProvincia = LOCALIDADES_ARG[value.provinciaEstadoId] || [];
      setLocalidades(localidadesProvincia);

      // Si la localidad actual no pertenece a la nueva provincia, limpiarla
      if (value.localidadId) {
        const localidadExiste = localidadesProvincia.find(l => l.id === value.localidadId);
        if (!localidadExiste) {
          onChange({
            ...value,
            localidadId: undefined,
            codigoPostal: undefined,
            calleId: undefined,
            calleNombre: undefined,
          });
        }
      }
    } else {
      setLocalidades([]);
    }
  }, [value.provinciaEstadoId]);

  // Cargar calles cuando cambia la localidad
  useEffect(() => {
    if (value.localidadId) {
      const callesLocalidad = CALLES_ARG[value.localidadId] || [];
      setCalles(callesLocalidad);

      // Auto-completar código postal
      const localidadSeleccionada = localidades.find(l => l.id === value.localidadId);
      if (localidadSeleccionada && localidadSeleccionada.codigoPostal !== value.codigoPostal) {
        onChange({
          ...value,
          codigoPostal: localidadSeleccionada.codigoPostal,
        });
      }

      // Si no hay calles normalizadas, permitir entrada manual
      if (callesLocalidad.length === 0) {
        setUsarCalleManual(true);
      }
    } else {
      setCalles([]);
    }
  }, [value.localidadId, localidades]);

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinciaId = e.target.value ? parseInt(e.target.value) : undefined;
    onChange({
      ...value,
      provinciaEstadoId: provinciaId,
      localidadId: undefined,
      codigoPostal: undefined,
      calleId: undefined,
      calleNombre: undefined,
    });
  };

  const handleLocalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localidadId = e.target.value ? parseInt(e.target.value) : undefined;
    onChange({
      ...value,
      localidadId,
      calleId: undefined,
      calleNombre: undefined,
    });
  };

  const handleCalleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const calleId = e.target.value ? parseInt(e.target.value) : undefined;
    const calleSeleccionada = calles.find(c => c.id === calleId);

    onChange({
      ...value,
      calleId,
      calleNombre: calleSeleccionada ? `${calleSeleccionada.tipo} ${calleSeleccionada.nombre}` : undefined,
    });
  };

  const handleCalleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombreCalle = e.target.value;
    setCalleNombreManual(nombreCalle);
    onChange({
      ...value,
      calleId: undefined,
      calleNombre: nombreCalle,
    });
  };

  const toggleCalleManual = () => {
    setUsarCalleManual(!usarCalleManual);
    if (!usarCalleManual) {
      // Cambiar a manual: limpiar calle seleccionada
      onChange({
        ...value,
        calleId: undefined,
        calleNombre: calleNombreManual,
      });
    } else {
      // Cambiar a selector: limpiar entrada manual
      setCalleNombreManual('');
      onChange({
        ...value,
        calleId: undefined,
        calleNombre: undefined,
      });
    }
  };

  const direccionCompleta = useMemo(() => {
    const partes: string[] = [];

    if (value.calleNombre) {
      partes.push(value.calleNombre);
    }
    if (value.altura) {
      partes.push(value.altura.toString());
    }
    if (value.piso) {
      partes.push(`Piso ${value.piso}`);
    }
    if (value.departamento) {
      partes.push(`Depto ${value.departamento}`);
    }

    const localidad = localidades.find(l => l.id === value.localidadId);
    if (localidad) {
      partes.push(localidad.nombre);
    }

    const provincia = PROVINCIAS_ARG.find(p => p.id === value.provinciaEstadoId);
    if (provincia) {
      partes.push(provincia.nombre);
    }

    if (value.codigoPostal) {
      partes.push(`(${value.codigoPostal})`);
    }

    return partes.join(', ');
  }, [value, localidades]);

  return (
    <div className="direccion-form">
      <div className="form-row">
        <div className="form-group">
          <label>
            Provincia {required && <span className="required">*</span>}
          </label>
          <select
            value={value.provinciaEstadoId || ''}
            onChange={handleProvinciaChange}
            disabled={disabled}
            required={required}
            className="form-control"
          >
            <option value="">Seleccione provincia...</option>
            {PROVINCIAS_ARG.map(provincia => (
              <option key={provincia.id} value={provincia.id}>
                {provincia.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Localidad {required && <span className="required">*</span>}
          </label>
          <select
            value={value.localidadId || ''}
            onChange={handleLocalidadChange}
            disabled={disabled || !value.provinciaEstadoId}
            required={required}
            className="form-control"
          >
            <option value="">Seleccione localidad...</option>
            {localidades.map(localidad => (
              <option key={localidad.id} value={localidad.id}>
                {localidad.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Código Postal</label>
          <input
            type="text"
            value={value.codigoPostal || ''}
            onChange={(e) => onChange({ ...value, codigoPostal: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="Ej: C1200AAA"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-grow">
          <label>
            Calle {required && <span className="required">*</span>}
            {calles.length > 0 && (
              <button
                type="button"
                className="btn-link btn-sm"
                onClick={toggleCalleManual}
                disabled={disabled}
              >
                {usarCalleManual ? 'Seleccionar de lista' : 'Ingresar manualmente'}
              </button>
            )}
          </label>

          {usarCalleManual || calles.length === 0 ? (
            <input
              type="text"
              value={calleNombreManual || value.calleNombre || ''}
              onChange={handleCalleManualChange}
              disabled={disabled || !value.localidadId}
              required={required}
              className="form-control"
              placeholder="Ej: Av. Corrientes"
            />
          ) : (
            <select
              value={value.calleId || ''}
              onChange={handleCalleChange}
              disabled={disabled || !value.localidadId}
              required={required}
              className="form-control"
            >
              <option value="">Seleccione calle...</option>
              {calles.map(calle => (
                <option key={calle.id} value={calle.id}>
                  {calle.tipo} {calle.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group" style={{width: '150px'}}>
          <label>
            Altura {required && <span className="required">*</span>}
          </label>
          <input
            type="number"
            value={value.altura || ''}
            onChange={(e) => onChange({ ...value, altura: e.target.value ? parseInt(e.target.value) : undefined })}
            disabled={disabled}
            required={required}
            className="form-control"
            placeholder="1234"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Piso</label>
          <input
            type="text"
            value={value.piso || ''}
            onChange={(e) => onChange({ ...value, piso: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="5"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Depto</label>
          <input
            type="text"
            value={value.departamento || ''}
            onChange={(e) => onChange({ ...value, departamento: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="B"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Torre</label>
          <input
            type="text"
            value={value.torre || ''}
            onChange={(e) => onChange({ ...value, torre: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="1"
            maxLength={20}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-grow">
          <label>Entre calles</label>
          <input
            type="text"
            value={value.entreCalles || ''}
            onChange={(e) => onChange({ ...value, entreCalles: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="Ej: Entre Av. Callao y Av. Pueyrredón"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-grow">
          <label>Referencias adicionales</label>
          <textarea
            value={value.referencias || ''}
            onChange={(e) => onChange({ ...value, referencias: e.target.value })}
            disabled={disabled}
            className="form-control"
            placeholder="Ej: Edificio de ladrillo rojo, portón azul"
            rows={2}
          />
        </div>
      </div>

      {direccionCompleta && (
        <div className="direccion-preview">
          <label>Vista previa:</label>
          <div className="direccion-completa">{direccionCompleta}</div>
        </div>
      )}
    </div>
  );
};

export default DireccionForm;
