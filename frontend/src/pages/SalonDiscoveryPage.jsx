import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Crosshair, Scissors, Star, IndianRupee } from 'lucide-react';
import { api } from '../services/api';
import SalonCard from '../components/SalonCard';

export default function SalonDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [serviceName, setServiceName] = useState(searchParams.get('service_name') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'relevance');

  // Geolocation
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState(searchParams.get('max_distance_km') || '');
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch salons whenever active filters change
  const fetchSalons = () => {
    setLoading(true);
    setError('');

    const params = {
      query: query || undefined,
      service_name: serviceName || undefined,
      city: city || undefined,
      locality: locality || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
      min_rating: minRating ? parseFloat(minRating) : undefined,
      user_lat: userLat || undefined,
      user_lon: userLon || undefined,
      max_distance_km: maxDistanceKm ? parseFloat(maxDistanceKm) : undefined,
      sort_by: sortBy,
    };

    api.salons.getAll(params)
      .then(res => setSalons(res))
      .catch(err => setError(err.message || 'Failed to fetch salons.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSalons();
  }, [city, locality, minRating, sortBy, userLat, userLon]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchSalons();
  };

  const handleReset = () => {
    setQuery('');
    setServiceName('');
    setCity('');
    setLocality('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxDistanceKm('');
    setUserLat(null);
    setUserLon(null);
    setLocationStatus('');
    setSortBy('relevance');
    setSearchParams({});
    api.salons.getAll().then(res => setSalons(res)).catch(() => {});
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationStatus('Acquiring your location with browser permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLon(position.coords.longitude);
        setLocating(false);
        setLocationStatus(`Location acquired (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}). Distance calculating.`);
      },
      (err) => {
        setLocating(false);
        setLocationStatus(`Could not acquire location (${err.message}). You can still filter by city or locality manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Discover & Evaluate Salons
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Search independent verified salons across Indian cities. Filter by service, exact pricing, verified ratings, and proximity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '32px', alignItems: 'flex-start' }} className="discovery-layout">
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '24px', position: 'sticky', top: '92px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              <SlidersHorizontal size={18} style={{ color: '#6366f1' }} />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                border: 'none',
                background: 'none',
                color: '#64748b',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilter} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Keyword */}
            <div>
              <label className="form-label">Search Keyword</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Salon name or landmark..."
                  className="form-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Target Service Filter */}
            <div>
              <label className="form-label">Specific Service</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Haircut, Hair Spa..."
                  className="form-input"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Scissors size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                Filters prices strictly for this exact service
              </span>
            </div>

            {/* City Selection */}
            <div>
              <label className="form-label">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-select"
              >
                <option value="">All Indian Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* Locality Input */}
            <div>
              <label className="form-label">Locality / Area</label>
              <input
                type="text"
                placeholder="e.g. Bandra, Indiranagar..."
                className="form-input"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>

            {/* Geolocation Button */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Proximity Calculation
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Crosshair size={14} style={{ color: userLat ? '#10b981' : '#6366f1' }} />
                <span>{userLat ? 'Location Active' : (locating ? 'Acquiring...' : 'Use My GPS Location')}</span>
              </button>
              {locationStatus && (
                <div style={{ fontSize: '0.72rem', color: userLat ? '#059669' : '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                  {locationStatus}
                </div>
              )}
            </div>

            {/* Budget Range (INR) */}
            <div>
              <label className="form-label">Service Budget Range (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min ₹"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="form-label">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="form-select"
              >
                <option value="">Any Rating</option>
                <option value="4.0">4.0 ★ & above</option>
                <option value="4.5">4.5 ★ & above (High satisfaction)</option>
                <option value="4.8">4.8 ★ & above (Top tier)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Results Main Area */}
        <main>
          {/* Top Sort & Count Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '14px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              {error ? (
                <span style={{ color: '#dc2626' }}>Service connection issue</span>
              ) : loading ? (
                <span>Searching salons...</span>
              ) : (
                <>
                  Found <strong style={{ color: '#0f172a' }}>{salons.length}</strong> matching salon{salons.length === 1 ? '' : 's'}
                  {serviceName && <span> for <em>"{serviceName}"</em></span>}
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="relevance">Relevance & Balance</option>
                <option value="price_asc">Service Price: Low to High</option>
                <option value="price_desc">Service Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="distance">Shortest Travel Distance</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
              <div>Filtering and ranking salons...</div>
            </div>
          ) : error ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#991b1b', background: '#fee2e2' }}>
              <p>{error}</p>
              <button onClick={fetchSalons} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                Retry
              </button>
            </div>
          ) : salons.length > 0 ? (
            <div className="grid-salons">
              {salons.map(salon => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  onFavouriteToggle={(id) => {
                    setSalons(prev => prev.map(s => s.id === id ? { ...s, is_favourite: !s.is_favourite } : s));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#94a3b8'
              }}>
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                No salons matched your exact filter combination
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                Salons are only returned if they genuinely offer your chosen service and meet your budget and distance criteria.
              </p>
              <button onClick={handleReset} className="btn btn-primary btn-sm">
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .discovery-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
