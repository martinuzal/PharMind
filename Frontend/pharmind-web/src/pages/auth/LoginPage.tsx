import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Logo from '../../components/common/Logo';
import '../../styles/Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification, clearAll } = useNotifications();

  // Limpiar notificaciones al cargar la página de login (solo una vez)
  useEffect(() => {
    clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario escribe
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: ''
    };

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData);

      addNotification({
        title: 'Inicio de sesión exitoso',
        message: 'Bienvenido a PharMind',
        type: 'success',
        category: 'auth'
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data ||
        'Credenciales inválidas. Por favor, intenta de nuevo.';

      setGeneralError(errorMessage);

      // No mostrar notificación duplicada, solo el mensaje en el formulario
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <Logo size="lg" showText={true} showTagline={true} />
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '1rem', color: '#64748b' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {generalError && (
          <div className="login-alert error">
            <span className="material-icons">error</span>
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {errors.email}
              </div>
            )}
          </div>

          <div className="login-form-group">
            <label htmlFor="password">
              Contraseña <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            {errors.password && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span className="material-icons">login</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          PharMind &copy; {new Date().getFullYear()}. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
