import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export default function FloatingCompareBar() {
  const { selectedSalons, removeFromCompare, clearCompare, count } = useComparison();

  if (count === 0) return null;

  return (
    <div className="comparison-drawer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.25)',
          color: '#818cf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Scale size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            {count} Salon{count > 1 ? 's' : ''} Selected
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Ready to compare side-by-side
          </div>
        </div>
      </div>

      {/* Mini Thumbnails */}
      <div style={{ display: 'none', sm: 'flex', gap: '6px' }} className="compare-mini-chips">
        {selectedSalons.map(s => (
          <div
            key={s.id}
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1.5px solid #475569'
            }}
          >
            <img src={s.cover_image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => removeFromCompare(s.id)}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              title={`Remove ${s.name}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={clearCompare}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '6px 8px'
          }}
        >
          Clear
        </button>

        <Link
          to="/compare"
          className="btn btn-primary btn-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            padding: '8px 16px'
          }}
        >
          <span>Compare Now</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .compare-mini-chips { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
