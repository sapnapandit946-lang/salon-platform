import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle, Store, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('CUSTOMER');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          phone: phoneNumber,
          role,
        });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoType) => {
    setError('');
    setIsRegister(false);
    if (demoType === 'customer') {
      setEmail('rahul.verma@example.com');
      setPassword('Customer@123');
    } else if (demoType === 'owner') {
      setEmail('arjun@enrichsalon.com');
      setPassword('Owner@123');
    } else if (demoType === 'admin') {
      setEmail('admin@salonplatform.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: 'none',
            background: '#f1f5f9',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        {/* Header Tabs */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {isRegister
              ? 'Join GlamGuide to discover salons, compare exact prices, and book appointments'
              : 'Sign in to access your appointments, favourites, and salon dashboard'}
          </p>

          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '4px',
            marginTop: '16px'
          }}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? '#4f46e5' : '#64748b',
                boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? '#4f46e5' : '#64748b',
                boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Demo Fast-fill Badges for Interview Testing */}
        {!isRegister && (
          <div style={{
            background: '#eef2ff',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} /> Quick Demo Logins (Click to Autofill):
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fillQuickDemo('customer')}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #c7d2fe',
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#3730a3',
                  fontWeight: 600
                }}
              >
                Customer (Rahul)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('owner')}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #c7d2fe',
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#3730a3',
                  fontWeight: 600
                }}
              >
                Salon Owner (Arjun)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #c7d2fe',
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#3730a3',
                  fontWeight: 600
                }}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              {/* Role Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">I want to join as:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: role === 'CUSTOMER' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: role === 'CUSTOMER' ? '#f5f3ff' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: role === 'CUSTOMER' ? '#4f46e5' : '#64748b'
                    }}
                  >
                    <User size={18} />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SALON_OWNER')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: role === 'SALON_OWNER' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: role === 'SALON_OWNER' ? '#f5f3ff' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: role === 'SALON_OWNER' ? '#4f46e5' : '#64748b'
                    }}
                  >
                    <Store size={18} />
                    <span>Salon Owner</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? <div className="spinner" /> : (isRegister ? 'Complete Registration' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
}
