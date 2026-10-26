import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Star, Clock, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Scissors, Scale, Heart, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useComparison } from '../context/ComparisonContext';

export default function SalonDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Flow State
  const [selectedServiceId, setSelectedServiceId] = useState(
    searchParams.get('selected_service_id') ? parseInt(searchParams.get('selected_service_id')) : null
  );
  const [bookingDate, setBookingDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(searchParams.get('time') || '');
  const [customerNotes, setCustomerNotes] = useState('');

  // Available Slots Fetching
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.salons.getById(id)
      .then(res => {
        setSalon(res);
        // Default select first service if none selected from query
        if (!selectedServiceId && res.services?.length > 0) {
          setSelectedServiceId(res.services[0].id);
        }
      })
      .catch(err => setError(err.message || 'Could not load salon details.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch real-time available slots whenever salon, service, or date changes
  useEffect(() => {
    if (!salon || !selectedServiceId || !bookingDate) return;

    setLoadingSlots(true);
    setSelectedTimeSlot('');
    api.bookings.getSlots(salon.id, selectedServiceId, bookingDate)
      .then(res => setSlots(res))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [salon?.id, selectedServiceId, bookingDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in or register to book an appointment.');
      return;
    }
    if (!selectedServiceId || !selectedTimeSlot || !bookingDate) {
      setBookingError('Please select a service, date, and available time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await api.bookings.create({
        salon_id: salon.id,
        service_id: selectedServiceId,
        booking_date: bookingDate,
        start_time: selectedTimeSlot,
        customer_notes: customerNotes,
      });
      setBookingSuccess(res);
    } catch (err) {
      setBookingError(err.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
        <div>Loading salon profile and services...</div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
          <h3>Salon Not Found</h3>
          <p style={{ color: '#64748b', marginTop: '8px' }}>{error || 'This salon listing does not exist.'}</p>
          <Link to="/salons" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const selectedService = salon.services?.find(s => s.id === selectedServiceId);
  const comparing = isInCompare(salon.id);

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '80px' }}>
      {/* Back Link */}
      <Link to="/salons" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Salons
      </Link>

      {/* Hero Salon Banner */}
      <div className="card" style={{ marginBottom: '36px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '280px', background: '#0f172a' }}>
          <img
            src={salon.cover_image}
            alt={salon.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '8px'
              }}>
                <MapPin size={13} /> {salon.locality}, {salon.city}
              </div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#ffffff', fontWeight: 800 }}>
                {salon.name}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => comparing ? removeFromCompare(salon.id) : addToCompare(salon)}
                className={`btn btn-sm ${comparing ? 'btn-secondary' : 'btn-outline'}`}
                style={{ background: 'rgba(255, 255, 255, 0.95)' }}
              >
                <Scale size={15} />
                <span>{comparing ? 'In Comparison' : 'Add to Compare'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div style={{
          padding: '16px 24px',
          background: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{salon.rating > 0 ? salon.rating.toFixed(1) : 'New'}</strong>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({salon.review_count} verified reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.875rem' }}>
            <Phone size={16} style={{ color: '#6366f1' }} />
            <span>{salon.phone}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.875rem' }}>
            <MapPin size={16} style={{ color: '#6366f1' }} />
            <span>{salon.address}, PIN {salon.pincode}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Services & Reviews, Right Booking Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'flex-start' }} className="salon-detail-grid">
        {/* Left Column: Services & Reviews */}
        <div>
          {/* About */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>About the Salon</h2>
            <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {salon.description || 'Welcome to our studio. We pride ourselves on professional hair styling, organic grooming products, and personalized care.'}
            </p>
          </div>

          {/* Categorized Services Menu */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Services & Transparent Pricing</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select a service to schedule</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {salon.services?.map(svc => {
                const isSelected = svc.id === selectedServiceId;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    style={{
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scissors size={15} style={{ color: isSelected ? '#6366f1' : '#94a3b8' }} />
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{svc.name}</span>
                        {svc.category && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{svc.category.name}</span>
                        )}
                      </div>
                      {svc.description && (
                        <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>{svc.description}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                        <Clock size={12} /> {svc.duration_minutes} minutes
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                        ₹{svc.price.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        style={{ marginTop: '6px' }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operating Hours Table */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Operating Hours</h2>
            <div className="card" style={{ padding: '16px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                  const sched = salon.schedules?.find(s => s.day_of_week === idx);
                  const isClosed = sched?.is_closed;
                  return (
                    <div key={dayName} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{dayName}</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '2px', color: isClosed ? '#ef4444' : '#059669', fontWeight: 600 }}>
                        {isClosed ? 'Closed' : `${sched?.open_time?.slice(0, 5)} - ${sched?.close_time?.slice(0, 5)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              Verified Client Reviews ({salon.reviews?.length || 0})
            </h2>
            {salon.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {salon.reviews.map(r => (
                  <div key={r.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.customer_name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < r.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                      "{r.comment}"
                    </p>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px' }}>
                      Verified Appointment • {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                No reviews yet. Be the first client to book and review this salon!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Appointment Booking Box */}
        <div style={{ position: 'sticky', top: '92px' }}>
          <div className="card" style={{ padding: '28px', border: '2px solid #e0e7ff', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Book Appointment</h3>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>
                  Appointment Confirmed!
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '16px' }}>
                  Your slot has been reserved. Please show your reference code upon arrival at the salon.
                </p>

                <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Booking Reference</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.05em' }}>
                    {bookingSuccess.booking_reference}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                    {bookingSuccess.service_name} • ₹{bookingSuccess.total_price}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {bookingSuccess.booking_date} at {bookingSuccess.start_time}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/my-bookings" className="btn btn-primary" style={{ width: '100%' }}>
                    View in My Appointments
                  </Link>
                  <button
                    onClick={() => { setBookingSuccess(null); setSelectedTimeSlot(''); }}
                    className="btn btn-secondary btn-sm"
                  >
                    Book Another Service
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookingError && (
                  <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {bookingError}
                  </div>
                )}

                {/* Selected Service Summary */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Chosen Service</div>
                  {selectedService ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedService.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedService.duration_minutes} mins duration</div>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                        ₹{selectedService.price}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Please select a service above</div>
                  )}
                </div>

                {/* Date Picker */}
                <div>
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                {/* Live Slot Time Selector */}
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Available Time Slots</span>
                    {loadingSlots && <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>Checking capacity...</span>}
                  </label>

                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
                      <div className="spinner" style={{ margin: '0 auto 8px', color: '#6366f1' }} />
                      Calculating remaining chairs...
                    </div>
                  ) : slots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
                      {slots.map(slot => (
                        <button
                          key={slot.time_str}
                          type="button"
                          disabled={!slot.is_available}
                          onClick={() => setSelectedTimeSlot(slot.time_str)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: selectedTimeSlot === slot.time_str ? '2px solid #6366f1' : '1px solid #cbd5e1',
                            background: selectedTimeSlot === slot.time_str ? '#6366f1' : (slot.is_available ? '#ffffff' : '#f1f5f9'),
                            color: selectedTimeSlot === slot.time_str ? '#ffffff' : (slot.is_available ? '#0f172a' : '#94a3b8'),
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: slot.is_available ? 'pointer' : 'not-allowed',
                            textAlign: 'center',
                            transition: 'all 0.15s'
                          }}
                          title={slot.is_available ? `${slot.remaining_capacity} chairs open` : 'Fully booked or passed'}
                        >
                          {slot.time_str}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                      No open slots on this date. The salon may be closed or all stylist slots are full.
                    </div>
                  )}
                </div>

                {/* Customer Notes */}
                <div>
                  <label className="form-label">Special Requests / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Skin fade with low taper..."
                    className="form-textarea"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedTimeSlot || !selectedServiceId}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {bookingLoading ? (
                    <div className="spinner" />
                  ) : (
                    `Confirm Appointment (₹${selectedService ? selectedService.price : '0'})`
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', justifyContent: 'center' }}>
                  <ShieldCheck size={14} style={{ color: '#10b981' }} />
                  <span>Free cancellation up to 2 hours before appointment</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .salon-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
