import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  showTagline = false,
  tagline = 'Where Needs Meet Skills',
  className = '' 
}) => {
  const iconSizes = {
    sm: { box: 26, svg: 15, text: '1.05rem', tagText: '0.65rem' },
    md: { box: 32, svg: 18, text: '1.25rem', tagText: '0.72rem' },
    lg: { box: 40, svg: 22, text: '1.5rem', tagText: '0.8rem' },
    xl: { box: 52, svg: 28, text: '2rem', tagText: '0.9rem' }
  };

  const current = iconSizes[size];

  return (
    <div 
      className={`tnest-logo-container ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: showTagline ? 'flex-start' : 'center', 
        gap: size === 'sm' ? '8px' : '10px',
        userSelect: 'none'
      }}
    >
      {/* Clean Apple-inspired T-Nest Emblem */}
      <div 
        style={{
          width: `${current.box}px`,
          height: `${current.box}px`,
          borderRadius: size === 'sm' ? '6px' : size === 'xl' ? '12px' : '8px',
          backgroundColor: '#0071E3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0, 113, 227, 0.2)'
        }}
      >
        <svg 
          width={current.svg} 
          height={current.svg} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Crisp nest arc */}
          <path 
            d="M4 14.5C4 18.0899 7.58172 20.5 12 20.5C16.4183 20.5 20 18.0899 20 14.5" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
          />
          {/* Top T-bar */}
          <path 
            d="M4.5 5.5H19.5" 
            stroke="#FFFFFF" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
          />
          {/* T-stem */}
          <path 
            d="M12 5.5V16" 
            stroke="#FFFFFF" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {/* Clean Typography Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", "Plus Jakarta Sans", sans-serif',
                fontSize: current.text, 
                fontWeight: 700, 
                letterSpacing: '-0.025em', 
                color: 'var(--text-primary)'
              }}
            >
              Tnest
            </span>
          </div>

          {showTagline && (
            <span 
              style={{ 
                fontSize: current.tagText,
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginTop: '2px',
                whiteSpace: 'nowrap'
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
