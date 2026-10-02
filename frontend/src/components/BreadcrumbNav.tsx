import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  view?: string;
  params?: any;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  onNavigate: (view: string, params?: any) => void;
  backLabel?: string;
  backView?: string;
  backParams?: any;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: React.CSSProperties;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  items,
  onNavigate,
  backLabel = 'Back',
  backView,
  backParams,
  onBack,
  rightElement,
  style
}) => {
  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backView) {
      onNavigate(backView, backParams);
      return;
    }
    onNavigate('back');
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        padding: '8px 0',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
          title={backLabel}
        >
          <ArrowLeft size={13} />
          <span>{backLabel}</span>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <button
            onClick={() => onNavigate('landing')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px 4px'
            }}
          >
            Home
          </button>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1 || item.active;
            return (
              <React.Fragment key={idx}>
                <ChevronRight size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                {isLast || (!item.view && !item.onClick) ? (
                  <span
                    style={{
                      color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isLast ? 600 : 400,
                      maxWidth: '260px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else if (item.view) onNavigate(item.view, item.params);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={item.label}
                  >
                    {item.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {rightElement && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {rightElement}
        </div>
      )}
    </div>
  );
};
