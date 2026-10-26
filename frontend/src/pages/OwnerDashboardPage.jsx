import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Scissors, Clock, Store, Plus, Check, X, Star, IndianRupee, AlertCircle, Save } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboardPage() {
  const { user, isSalonOwner, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, services, schedule, profile

  const [salonData, setSalonData] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategoryId, setNewServiceCategoryId] = useState('');
  const [addingService, setAddingService] = useState(false);

  // New Salon Creation Form State (if owner has no salon yet)
  const [createSalonName, setCreateSalonName] = useState('');
  const [createSalonCity, setCreateSalonCity] = useState('Mumbai');
  const [createSalonLocality, setCreateSalonLocality] = useState('');
  const [createSalonAddress, setCreateSalonAddress] = useState('');
  const [createSalonPincode, setCreateSalonPincode] = useState('');
  const [createSalonPhone, setCreateSalonPhone] = useState('');
  const [createSalonCover, setCreateSalonCover] = useState('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80');
  const [creatingSalon, setCreatingSalon] = useState(false);

  const loadOwnerData = () => {
    setLoading(true);
    setError('');

    api.owner.getMySalon()
      .then(res => {
        setSalonData(res);
        if (res.has_salon) {
          return Promise.all([
            api.owner.getStats().catch(() => null),
            api.owner.getBookings().catch(() => []),
            api.services.getCategories().catch(() => [])
          ]);
        }
        return [null, [], []];
      })
      .then(([statsRes, bookingsRes, catsRes]) => {
        if (statsRes) setStats(statsRes);
        setBookings(bookingsRes);
        setCategories(catsRes);
        if (catsRes?.length > 0 && !newServiceCategoryId) {
          setNewServiceCategoryId(catsRes[0].id);
        }
      })
      .catch(err => setError(err.message || 'Could not load salon details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOwnerData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.owner.updateBookingStatus(bookingId, { status: newStatus });
      loadOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !newServiceCategoryId) return;

    setAddingService(true);
    try {
      await api.owner.addService({
        name: newServiceName,
        price: parseFloat(newServicePrice),
        duration_minutes: parseInt(newServiceDuration),
        category_id: parseInt(newServiceCategoryId),
      });
      setNewServiceName('');
      setNewServicePrice('');
      loadOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to add service.');
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service from your salon menu?')) return;
    try {
      await api.owner.deleteService(serviceId);
      loadOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  const handleCreateSalonProfile = async (e) => {
    e.preventDefault();
    setCreatingSalon(true);
    try {
      await api.owner.createSalon({
        name: createSalonName,
        city: createSalonCity,
        locality: createSalonLocality,
        address: createSalonAddress,
        pincode: createSalonPincode,
        phone: createSalonPhone,
        cover_image: createSalonCover,
      });
      loadOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to create salon profile.');
    } finally {
      setCreatingSalon(false);
    }
  };

  if (!isAuthenticated || (!isSalonOwner && !isAdmin)) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <Store size={48} style={{ color: '#6366f1', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Salon Owner Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Please sign in with a registered Salon Owner account to manage your business services, opening schedules, and appointments.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
        <div>Loading your salon dashboard...</div>
      </div>
    );
  }

  // If salon owner has not registered their salon profile yet
  if (!salonData?.has_salon) {
    return (
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '640px' }}>
        <div className="card" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Store size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Register Your Salon Profile</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Create your business profile to start accepting appointments and managing services on GlamGuide.
            </p>
          </div>

          <form onSubmit={handleCreateSalonProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Salon Business Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Unisex Salon & Studio"
                className="form-input"
                value={createSalonName}
                onChange={(e) => setCreateSalonName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <select
                  value={createSalonCity}
                  onChange={(e) => setCreateSalonCity(e.target.value)}
                  className="form-select"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Locality / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra West, Indiranagar"
                  className="form-input"
                  value={createSalonLocality}
                  onChange={(e) => setCreateSalonLocality(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input
                type="text"
                required
                placeholder="Shop No. / Street Address"
                className="form-input"
                value={createSalonAddress}
                onChange={(e) => setCreateSalonAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400050"
                  className="form-input"
                  value={createSalonPincode}
                  onChange={(e) => setCreateSalonPincode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salon Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9820011223"
                  className="form-input"
                  value={createSalonPhone}
                  onChange={(e) => setCreateSalonPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                type="url"
                required
                className="form-input"
                value={createSalonCover}
                onChange={(e) => setCreateSalonCover(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={creatingSalon}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {creatingSalon ? <div className="spinner" /> : 'Create Salon Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentSalon = salonData.salon;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {currentSalon.name}
            </h1>
            <span className="badge badge-success">Active Listing</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>
            {currentSalon.locality}, {currentSalon.city} • Owner Portal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={14} /> Appointments ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Scissors size={14} /> Services & Prices
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`btn btn-sm ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Clock size={14} /> Operating Hours
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="card" style={{ padding: '20px', background: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Appointments</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {stats.total_bookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
              {stats.upcoming_bookings} upcoming
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Completed Bookings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>
              {stats.completed_bookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Services delivered
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Revenue (Completed)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              ₹{stats.total_revenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Verified earnings
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Average Rating</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={24} fill="#f59e0b" color="#f59e0b" />
              <span>{stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Across {stats.review_count} client reviews
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Client Appointments
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Click to confirm or mark appointments completed
            </span>
          </div>

          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bookings.map(b => (
                <div key={b.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{b.customer_name}</span>
                        <span className={`badge ${
                          b.status === 'CONFIRMED' ? 'badge-success' :
                          b.status === 'COMPLETED' ? 'badge-primary' :
                          b.status === 'CANCELLED' ? 'badge-danger' : 'badge-amber'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                        Phone: <strong>{b.customer_phone}</strong> • Ref: <strong>{b.booking_reference}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                        ₹{b.total_price.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {b.service_duration} mins
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    fontSize: '0.85rem'
                  }}>
                    <div>Service: <strong>{b.service_name}</strong></div>
                    <div>Date: <strong>{b.booking_date}</strong></div>
                    <div>Time: <strong>{b.start_time} - {b.end_time}</strong></div>
                    {b.customer_notes && (
                      <div style={{ width: '100%', color: '#64748b' }}>
                        Note: <em>"{b.customer_notes}"</em>
                      </div>
                    )}
                  </div>

                  {/* Owner Status Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                    {b.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleBookingStatus(b.id, 'COMPLETED')}
                          className="btn btn-sm btn-primary"
                        >
                          <Check size={14} /> Mark Completed
                        </button>
                        <button
                          onClick={() => handleBookingStatus(b.id, 'CANCELLED')}
                          className="btn btn-sm btn-secondary"
                          style={{ color: '#991b1b', borderColor: '#fca5a5' }}
                        >
                          <X size={14} /> Cancel / Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              No bookings received yet for your salon.
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Services & Pricing Management */}
      {activeTab === 'services' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px', alignItems: 'flex-start' }} className="owner-services-grid">
            {/* Left: Services List */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Active Salon Services ({currentSalon.services?.length || 0})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentSalon.services?.map(s => (
                  <div key={s.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        {s.duration_minutes} mins • {s.category?.name || 'General'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                        ₹{s.price.toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        style={{
                          border: 'none',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add New Service Form */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={18} style={{ color: '#6366f1' }} /> Add Service with Exact Pricing
              </h3>

              <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balayage Color Treatment"
                    className="form-input"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newServiceCategoryId}
                    onChange={(e) => setNewServiceCategoryId(e.target.value)}
                    className="form-select"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Exact Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 850"
                      className="form-input"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (mins)</label>
                    <select
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      className="form-select"
                    >
                      <option value="20">20 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                      <option value="90">90 mins</option>
                      <option value="120">120 mins</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingService}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {addingService ? <div className="spinner" /> : 'Add to Salon Menu'}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Operating Schedule */}
      {activeTab === 'schedule' && (
        <section className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Weekly Operating Schedule & Chair Capacity
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
            Configure when your salon is open and how many simultaneous stylist chairs are active to prevent overbooking.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName, idx) => {
              const sched = currentSalon.schedules?.find(s => s.day_of_week === idx);
              return (
                <div
                  key={dayName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ width: '120px', fontWeight: 700, color: '#1e293b' }}>
                    {dayName}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                    <span>Hours: <strong>{sched?.open_time || '09:00'} - {sched?.close_time || '20:00'}</strong></span>
                    <span>Capacity: <strong>{sched?.concurrent_capacity || 2} chairs</strong></span>
                    <span className={`badge ${sched?.is_closed ? 'badge-danger' : 'badge-success'}`}>
                      {sched?.is_closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 800px) {
          .owner-services-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
