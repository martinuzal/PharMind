import React, { useState } from 'react';
import DireccionForm from '../../components/direccion/DireccionForm';
import type { DireccionData } from '../../components/direccion/DireccionForm';
import './PruebaDireccionPage.css';

const PruebaDireccionPage: React.FC = () => {
  const [direccion1, setDireccion1] = useState<DireccionData>({});
  const [direccion2, setDireccion2] = useState<DireccionData>({
    // Ejemplo pre-poblado
    paisId: 1,
    provinciaEstadoId: 1, // CABA
    localidadId: 5, // Balvanera
    codigoPostal: 'C1200AAA',
    calleId: 1,
    calleNombre: 'Avenida Corrientes',
    altura: 1234,
    piso: '5',
    departamento: 'B',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Direcciones guardadas:');
    console.log('Dirección 1:', direccion1);
    console.log('Dirección 2:', direccion2);
    alert('Direcciones guardadas! Ver consola para detalles.');
  };

  return (
    <div className="prueba-direccion-page">
      <div className="page-header">
        <h1>Prueba de Componente de Dirección</h1>
        <p>Este es un ejemplo de uso del componente centralizado de direcciones con datos de prueba.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="direccion-section">
          <h2>Dirección Fiscal</h2>
          <p className="section-description">Ejemplo con formulario vacío (entrada desde cero)</p>
          <DireccionForm
            value={direccion1}
            onChange={setDireccion1}
            required={true}
          />
        </div>

        <div className="direccion-section">
          <h2>Dirección Comercial</h2>
          <p className="section-description">Ejemplo con datos pre-poblados (edición)</p>
          <DireccionForm
            value={direccion2}
            onChange={setDireccion2}
            required={false}
          />
        </div>

        <div className="direccion-section">
          <h2>Dirección Deshabilitada</h2>
          <p className="section-description">Ejemplo de solo lectura (disabled)</p>
          <DireccionForm
            value={direccion2}
            onChange={() => {}}
            disabled={true}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Guardar Direcciones
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setDireccion1({});
              setDireccion2({});
            }}
          >
            Limpiar Todo
          </button>
        </div>
      </form>

      <div className="json-preview">
        <h3>Estado actual de las direcciones (JSON)</h3>
        <div className="json-container">
          <h4>Dirección 1:</h4>
          <pre>{JSON.stringify(direccion1, null, 2)}</pre>
        </div>
        <div className="json-container">
          <h4>Dirección 2:</h4>
          <pre>{JSON.stringify(direccion2, null, 2)}</pre>
        </div>
      </div>

      <div className="uso-info">
        <h3>Cómo usar este componente</h3>
        <div className="code-example">
          <h4>1. Importar el componente:</h4>
          <pre>{`import DireccionForm, { DireccionData } from '../../components/direccion/DireccionForm';`}</pre>

          <h4>2. Definir state:</h4>
          <pre>{`const [direccion, setDireccion] = useState<DireccionData>({});`}</pre>

          <h4>3. Usar en el formulario:</h4>
          <pre>{`<DireccionForm
  value={direccion}
  onChange={setDireccion}
  required={true}
  disabled={false}
/>`}</pre>

          <h4>4. Características:</h4>
          <ul>
            <li>✅ Datos de prueba integrados (provincias, localidades, calles de Argentina)</li>
            <li>✅ Autocompletado en cascada (provincia → localidad → calle)</li>
            <li>✅ Selección de calle desde lista normalizada o entrada manual</li>
            <li>✅ Auto-completado de código postal al seleccionar localidad</li>
            <li>✅ Vista previa de dirección formateada</li>
            <li>✅ Validación de campos requeridos</li>
            <li>✅ Modo deshabilitado para solo lectura</li>
            <li>✅ Responsive design</li>
          </ul>

          <h4>5. Datos retornados:</h4>
          <pre>{`{
  paisId: number,
  provinciaEstadoId: number,
  localidadId: number,
  codigoPostal: string,
  calleId: number,
  calleNombre: string,
  altura: number,
  piso: string,
  departamento: string,
  torre: string,
  entreCalles: string,
  barrio: string,
  referencias: string
}`}</pre>
        </div>
      </div>
    </div>
  );
};

export default PruebaDireccionPage;
