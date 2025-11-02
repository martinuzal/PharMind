interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

const Logo = ({ size = 'md', showText = true, showTagline = false }: LogoProps) => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 80
  };

  const logoSize = sizes[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: showTagline ? '0.5rem' : '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pharMindGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3ba9a5', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2d8a87', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Fondo con bordes redondeados (simulando el cuadrado redondeado del icono) */}
          <rect x="10" y="10" width="100" height="100" rx="20" fill="#1a4a5c" />

          {/* Cabeza de perfil - más detallada y precisa */}
          <path
            d="M35 45 C35 38, 40 32, 48 32 C52 32, 55 33, 57 35 C58 36, 59 38, 59 40 L59 42 C59 44, 60 45, 61 46 L62 48 C63 49, 64 50, 64 52 L64 68 C64 72, 63 76, 60 79 C58 81, 55 83, 52 84 C48 86, 44 86, 41 85 C38 84, 36 82, 35 80 L35 78 C34 76, 34 74, 34 72 L34 68 L35 45 Z"
            fill="url(#pharMindGradient)"
          />

          {/* Detalles faciales - nariz, boca */}
          <path
            d="M64 56 C65 57, 66 58, 66 60 C66 61, 65 62, 64 62"
            stroke="#2d8a87"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M64 68 C64 70, 62 71, 60 71"
            stroke="#2d8a87"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Red neuronal dentro de la cabeza - 4 nodos en forma de diamante */}
          <g transform="translate(50, 58)">
            {/* Conexiones en forma de diamante */}
            <line x1="0" y1="-12" x2="10" y2="0" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="10" y1="0" x2="0" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="12" x2="-10" y2="0" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="-10" y1="0" x2="0" y2="-12" stroke="white" strokeWidth="3" strokeLinecap="round" />

            {/* Nodos - círculos blancos con anillo */}
            <circle cx="0" cy="-12" r="6" fill="white" stroke="white" strokeWidth="2" />
            <circle cx="0" cy="-12" r="3" fill="#3ba9a5" />

            <circle cx="10" cy="0" r="6" fill="white" stroke="white" strokeWidth="2" />
            <circle cx="10" cy="0" r="3" fill="#3ba9a5" />

            <circle cx="0" cy="12" r="6" fill="white" stroke="white" strokeWidth="2" />
            <circle cx="0" cy="12" r="3" fill="#3ba9a5" />

            <circle cx="-10" cy="0" r="6" fill="white" stroke="white" strokeWidth="2" />
            <circle cx="-10" cy="0" r="3" fill="#3ba9a5" />
          </g>
        </svg>
        {showText && (
          <span style={{
            fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : '2.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4db8b8 0%, #2d8a8a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Reps-PharMind
          </span>
        )}
      </div>
      {showTagline && (
        <span style={{
          fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : '1.125rem',
          color: '#4db8b8',
          fontWeight: 500,
          letterSpacing: '0.025em'
        }}>
          Conecta, Analiza. Entiende Mejor
        </span>
      )}
    </div>
  );
};

export default Logo;
