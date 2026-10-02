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
    sm: { box: 28, svg: 22, text: '1.05rem', tagText: '0.65rem' },
    md: { box: 36, svg: 28, text: '1.25rem', tagText: '0.72rem' },
    lg: { box: 44, svg: 34, text: '1.5rem', tagText: '0.8rem' },
    xl: { box: 56, svg: 44, text: '2rem', tagText: '0.9rem' }
  };

  const current = iconSizes[size];

  return (
    <div 
      className={`tnest-logo-container ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: showTagline ? 'flex-start' : 'center', 
        gap: size === 'sm' ? '8px' : '10px',
        userSelect: 'none',
        cursor: 'pointer'
      }}
    >
      {/* 3D Golden Woven Nest Emblem with Rupee Coin & Sprout */}
      <div 
        style={{
          width: `${current.box}px`,
          height: `${current.box}px`,
          borderRadius: '10px',
          background: 'radial-gradient(circle at 30% 25%, #FFFDF9 0%, #FEF3C7 55%, #FDE68A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1.5px solid #FDE68A',
          boxShadow: '0 3px 10px rgba(217, 119, 6, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <svg 
          width={current.svg} 
          height={current.svg} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoCoinGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="logoCoinInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="logoNestOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            <linearGradient id="logoNestLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="logoLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="60%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>

          {/* Soft backglow */}
          <circle cx="24" cy="22" r="14" fill="#FEF3C7" opacity="0.65" />

          {/* Golden Rupee Coin inside Nest */}
          <g>
            <circle cx="24" cy="18.5" r="9.5" fill="url(#logoCoinGrad)" stroke="#FEF3C7" strokeWidth="1.2" />
            <circle cx="24" cy="18.5" r="7.8" fill="url(#logoCoinInner)" opacity="0.85" />
            
            {/* Crisp Rupee Symbol '₹' */}
            <line x1="20.2" y1="14.2" x2="27.8" y2="14.2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20.2" y1="16.8" x2="26.3" y2="16.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M22 14.2 V 19 C 22 20.3 23.2 21 24.8 21 L 27 24" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Emerald Sprout Leaf */}
          <path d="M30 19 C 34 15 37.5 17 35.5 21 C 33.5 22.5 30.8 21.5 30 19 Z" fill="url(#logoLeafGrad)" />
          <path d="M30 19 C 31.5 16.5 33.5 16 33.5 16" stroke="#BBF7D0" strokeWidth="0.7" strokeLinecap="round" />

          {/* Golden Woven Nest Layers */}
          <path d="M7 25.5 C 9 36.5 17 40.5 24 40.5 C 31 40.5 39 36.5 41 25.5 C 36 29.5 30 31.5 24 31.5 C 18 31.5 12 29.5 7 25.5 Z" fill="url(#logoNestOuter)" />
          
          <path d="M9 27.5 C 13 34.5 20 37.5 24 37.5 C 28 37.5 35 34.5 39 27.5" stroke="url(#logoNestLight)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 25 C 15 30.5 20 33.5 24 33.5 C 28 33.5 33 30.5 37 25" stroke="#FEF3C7" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
          <path d="M8 29.5 C 13 36.5 20 39.5 24 39.5 C 28 39.5 35 36.5 40 29.5" stroke="#78350F" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />

          {/* Nest Weave Accent Cross-Hatching */}
          <path d="M13 28.5 L 18.5 35.5" stroke="#FEF3C7" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
          <path d="M22 29.5 L 26 36.5" stroke="#FEF3C7" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
          <path d="M31 29.5 L 27 35.5" stroke="#FEF3C7" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
          <path d="M35 28.5 L 29.5 35.5" stroke="#FEF3C7" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />

          {/* Sparkle Star */}
          <path d="M12 10.5 L 13.2 13.8 L 16.5 15 L 13.2 16.2 L 12 19.5 L 10.8 16.2 L 7.5 15 L 10.8 13.8 Z" fill="#D97706" opacity="0.9" />
          <circle cx="12" cy="15" r="0.9" fill="#FFFDF8" />
        </svg>
      </div>

      {/* Clean Typography Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span 
              style={{ 
                fontFamily: '"Plus Jakarta Sans", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: current.text, 
                fontWeight: 800, 
                letterSpacing: '-0.03em', 
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1px'
              }}
            >
              <span>T</span>
              <span style={{ color: 'var(--accent-primary)' }}>nest</span>
            </span>
            <span 
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                marginLeft: '3px',
                display: 'inline-block'
              }}
            />
          </div>

          {showTagline && (
            <span 
              style={{ 
                fontSize: current.tagText,
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginTop: '3px',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em'
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
