import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, Sparkles, Scale, User as UserIcon, LogOut, Calendar, Heart, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComparison } from '../context/ComparisonContext';
import { subscribeBackendStatus } from '../services/api';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAuthenticated, isSalonOwner, logout } = useAuth();
  const { count: compareCount } = useComparison();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendLive, setBackendLive] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return subscribeBackendStatus(setBackendLive);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="header-glass">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Scissors size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>GlamGuide</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: '#eef2ff',
                  color: '#4f46e5',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>INDIA</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>AI Decision & Booking</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            <Link to="/salons" style={{
              fontWeight: 600,
              fontSize: '0.92rem',
              color: isActive('/salons') ? '#4f46e5' : '#334155',
              transition: 'color 0.2s'
            }}>
              Discover Salons
            </Link>

            <Link to="/compare" style={{
              fontWeight: 600,
              fontSize: '0.92rem',
              color: isActive('/compare') ? '#4f46e5' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative'
            }}>
              <Scale size={18} />
              <span>Compare Exact Services</span>
              {compareCount > 0 && (
                <span style={{
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {compareCount}
                </span>
              )}
            </Link>

            <Link to="/ai-preview" style={{
              fontWeight: 600,
              fontSize: '0.92rem',
              color: isActive('/ai-preview') ? '#4f46e5' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={18} style={{ color: '#f43f5e' }} />
              <span>AI Style Preview</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {backendLive === false && (
              <span
                title="FastAPI backend is not running on port 8000. Data is seamlessly served from local demo store. Run start_all.bat to connect live database."
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fcd34d',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'help'
                }}
              >
                ⚡ Demo Mode
              </span>
            )}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSalonOwner ? (
                  <Link to="/owner/dashboard" className="btn btn-primary btn-sm">
                    <LayoutDashboard size={16} />
                    <span>Salon Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/my-bookings" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    <span>My Bookings</span>
                  </Link>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: '#f1f5f9',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  <UserIcon size={15} style={{ color: '#6366f1' }} />
                  <span>{user?.full_name?.split(' ')[0]}</span>
                  <button
                    onClick={logout}
                    title="Logout"
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <Link
              to="/salons"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
            >
              Discover Salons
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, color: '#334155', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Scale size={18} />
              <span>Compare Exact Services ({compareCount})</span>
            </Link>
            <Link
              to="/ai-preview"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, color: '#334155', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={18} style={{ color: '#f43f5e' }} />
              <span>AI Style Preview</span>
            </Link>
            {isAuthenticated && !isSalonOwner && (
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, color: '#334155', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Calendar size={18} />
                <span>My Appointments</span>
              </Link>
            )}
            {isAuthenticated && isSalonOwner && (
              <Link
                to="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, color: '#4f46e5', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LayoutDashboard size={18} />
                <span>Salon Owner Dashboard</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {authModalOpen && <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
}
