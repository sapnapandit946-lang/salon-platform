import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ShieldCheck, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto',
      paddingTop: '50px',
      paddingBottom: '30px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Scissors size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>GlamGuide</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px' }}>
              India's first AI-powered salon decision & booking platform. Compare exact service pricing, evaluate real-time availability, and test virtual hairstyle previews before you book.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#1e293b',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#38bdf8'
            }}>
              <ShieldCheck size={14} />
              <span>Verified Indian Salons & Transparent Pricing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '16px', letterSpacing: '0.02em' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/salons" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Discover Salons</Link></li>
              <li><Link to="/compare" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Service Comparison Matrix</Link></li>
              <li><Link to="/ai-preview" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Virtual Hairstyle Simulation</Link></li>
              <li><Link to="/my-bookings" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>My Appointments & Reviews</Link></li>
              <li><Link to="/owner/dashboard" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Salon Partner Portal</Link></li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '16px' }}>Supported Cities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8125rem' }}>
              {['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'].map(city => (
                <Link
                  key={city}
                  to={`/salons?city=${encodeURIComponent(city)}`}
                  style={{
                    padding: '4px 10px',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    borderRadius: '6px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#334155'}
                  onMouseLeave={e => e.target.style.background = '#1e293b'}
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* Privacy & Safety Policy Notice */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '16px' }}>Privacy & Image Ethics</h4>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: '#64748b' }}>
              Photos provided for virtual hairstyle transformations require explicit consent, are processed in transient memory, and are never retained for model training or shared with advertisers.
            </p>
            <div style={{ marginTop: '14px', fontSize: '0.8125rem', color: '#94a3b8' }}>
              <div>Currency: Indian Rupee (INR ₹)</div>
              <div>Decision Engine: Transparent Weighted Scoring</div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: '#64748b'
        }}>
          <div>© {new Date().getFullYear()} GlamGuide Platform. Built for engineering excellence and transparent customer decision support.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Clean Architecture</span>
            <span>FastAPI & React</span>
            <span>PostgreSQL Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
