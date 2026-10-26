import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Scissors, Scale, Sparkles, ArrowRight, ShieldCheck, Clock, Star, CheckCircle, IndianRupee } from 'lucide-react';
import { api } from '../services/api';
import SalonCard from '../components/SalonCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Bar Form State
  const [serviceName, setServiceName] = useState('Haircut & Styling');
  const [city, setCity] = useState('Mumbai');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    // Fetch featured salons from actual database
    api.salons.getAll({ service_name: 'Haircut', city: 'Mumbai' })
      .then(res => {
        setSalons(res.slice(0, 6));
      })
      .catch(() => {
        // Fallback to general salons
        api.salons.getAll().then(res => setSalons(res.slice(0, 6))).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceName) params.append('service_name', serviceName);
    if (city) params.append('city', city);
    if (maxBudget) params.append('max_price', maxBudget);
    navigate(`/salons?${params.toString()}`);
  };

  const handleCompareDirect = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceName) params.append('service_name', serviceName);
    if (city) params.append('city', city);
    if (maxBudget) params.append('max_budget', maxBudget);
    navigate(`/compare?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)',
        paddingTop: '60px',
        paddingBottom: '80px',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#e0e7ff',
            color: '#3730a3',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <Sparkles size={16} style={{ color: '#4f46e5' }} />
            <span>Exact Pricing Comparison & AI Hairstyle Decision Platform</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '850px',
            margin: '0 auto 20px'
          }}>
            Discover, Compare <span style={{ color: '#4f46e5' }}>Exact Service Prices</span>, and Book the Right Salon
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Stop guessing with generic "starting from" prices. Find which salons offer your exact service, compare honest prices side-by-side, preview styles with AI, and book verified appointments.
          </p>

          {/* Primary Discovery & Comparison Search Box */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            maxWidth: '920px',
            margin: '0 auto'
          }}>
            <form onSubmit={handleSearch} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              textAlign: 'left'
            }}>
              {/* Target Service Selection */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scissors size={15} style={{ color: '#6366f1' }} /> Service Required
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="form-select"
                >
                  <option value="Haircut & Styling">Haircut & Styling</option>
                  <option value="Beard Trim & Grooming">Beard Trim & Grooming</option>
                  <option value="Hair Spa & Deep Conditioning">Hair Spa Treatment</option>
                  <option value="Global Hair Colour">Hair Colouring</option>
                  <option value="Keratin Treatment">Keratin Smoothing</option>
                  <option value="Balayage Highlights">Balayage Highlights</option>
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} style={{ color: '#6366f1' }} /> City / Hub
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-select"
                >
                  <option value="Mumbai">Mumbai (Bandra, Andheri)</option>
                  <option value="Bengaluru">Bengaluru (Indiranagar, Koramangala)</option>
                  <option value="Delhi">Delhi (Connaught Place, GK)</option>
                  <option value="Pune">Pune (Kothrud, KP)</option>
                </select>
              </div>

              {/* Max Budget (INR) */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IndianRupee size={15} style={{ color: '#6366f1' }} /> Max Budget (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="form-input"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Search size={16} />
                    <span>Find Salons</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCompareDirect}
                    className="btn btn-accent"
                    title="Compare Exact Prices Side-by-Side"
                  >
                    <Scale size={16} />
                    <span>Compare</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Service Category Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>Quick search:</span>
            {['Haircut', 'Hair Spa', 'Beard Trim', 'Hair Colour', 'Keratin'].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  setServiceName(chip);
                  navigate(`/compare?service_name=${encodeURIComponent(chip)}&city=${encodeURIComponent(city)}`);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.background = '#e0e7ff'; e.target.style.color = '#4338ca'; }}
                onMouseLeave={e => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#334155'; }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured AI Preview CTA Banner */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 20px 25px -5px rgba(49, 46, 129, 0.3)'
        }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(244, 63, 94, 0.25)',
              color: '#fda4af',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              <Sparkles size={14} /> VIRTUAL STYLE EXPERIMENT
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
              Want to see how that haircut looks before booking?
            </h2>
            <p style={{ color: '#c7d2fe', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Upload your photo with full privacy consent, test modern fade cuts, balayage hair colors, or textured bangs in real-time, and discover nearby salons that specialize in that style.
            </p>
          </div>

          <Link to="/ai-preview" className="btn btn-accent btn-lg" style={{ boxShadow: '0 8px 20px rgba(244, 63, 94, 0.4)' }}>
            <Sparkles size={18} />
            <span>Try AI Style Preview</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* How GlamGuide Decision Support Works */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Engineered for Informed Customer Decisions
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            We solve the frustrations of existing listing portals by focusing on exact service details.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Scale size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Exact Service Pricing</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              When you search for a Haircut, we compare the exact haircut price across salons. We never substitute a cheaper hair spa price or obscure package rates.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Live Capacity & Slots</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Real-time slot engine checks operating schedules, chair capacities, and existing bookings to guarantee available appointment windows.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Star size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Bayesian-Weighted Ratings</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Our ranking formula accounts for verified review counts to prevent a 1-review 5-star salon from dominating established high-reputation salons.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Database Salons */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              VERIFIED SALONS
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              Featured Salons Offering Haircuts & Styling
            </h2>
          </div>

          <Link to="/salons" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Explore All Salons</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
            <div>Loading verified salon records...</div>
          </div>
        ) : salons.length > 0 ? (
          <div className="grid-salons">
            {salons.map(s => (
              <SalonCard key={s.id} salon={s} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p>No salons currently found for this filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
