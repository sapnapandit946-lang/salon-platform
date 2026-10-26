import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, MapPin, AlertCircle, CheckCircle2, XCircle, Heart, MessageSquarePlus, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SalonCard from '../components/SalonCard';

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'favourites'

  const [bookings, setBookings] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');

    Promise.all([
      api.bookings.getMy().catch(() => []),
      api.salons.getMyFavourites().catch(() => [])
    ])
      .then(([bList, fList]) => {
        setBookings(bList);
        setFavourites(fList);
      })
      .catch(err => setError(err.message || 'Could not load your bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please enter a reason for cancellation (Optional):', 'Change of schedule');
    if (reason === null) return;

    try {
      await api.bookings.cancel(bookingId, reason);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setReviewSubmitting(true);
    setReviewError('');

    try {
      await api.reviews.submit({
        booking_id: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      loadData();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <Calendar size={48} style={{ color: '#6366f1', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Sign In to View Appointments</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Please sign in to your customer account to view your scheduled appointments, past service history, and saved salons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          My Account & Activity
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage your booked salon appointments, leave verified reviews, and view saved salons.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Calendar size={15} />
            <span>My Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favourites')}
            className={`btn ${activeTab === 'favourites' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Heart size={15} />
            <span>Saved Favourites ({favourites.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
          <div>Loading your appointment records...</div>
        </div>
      ) : activeTab === 'bookings' ? (
        bookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => {
              const isPast = new Date(b.booking_date) < new Date(new Date().toDateString());
              return (
                <div key={b.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{b.salon_name}</h3>
                        <span className={`badge ${
                          b.status === 'CONFIRMED' ? 'badge-success' :
                          b.status === 'COMPLETED' ? 'badge-primary' :
                          b.status === 'CANCELLED' ? 'badge-danger' : 'badge-amber'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        Booking Reference: <strong style={{ color: '#4f46e5', letterSpacing: '0.04em' }}>{b.booking_reference}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                      ₹{b.total_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    color: '#334155'
                  }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Service:</span> <strong>{b.service_name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} style={{ color: '#6366f1' }} />
                      <span>{b.booking_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} style={{ color: '#6366f1' }} />
                      <span>{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</span>
                    </div>
                  </div>

                  {b.customer_notes && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <strong>Your Notes:</strong> {b.customer_notes}
                    </div>
                  )}

                  {b.cancellation_reason && (
                    <div style={{ fontSize: '0.8rem', color: '#991b1b', background: '#fee2e2', padding: '6px 12px', borderRadius: '6px' }}>
                      <strong>Cancellation Note:</strong> {b.cancellation_reason}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                    {b.status === 'CONFIRMED' && !isPast && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#991b1b', borderColor: '#fca5a5' }}
                      >
                        Cancel Appointment
                      </button>
                    )}

                    {b.can_review && (
                      <button
                        onClick={() => openReviewModal(b)}
                        className="btn btn-primary btn-sm"
                      >
                        <MessageSquarePlus size={14} />
                        <span>Leave Verified Review</span>
                      </button>
                    )}

                    {b.has_reviewed && (
                      <span style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <CheckCircle2 size={15} /> Review Submitted
                      </span>
                    )}

                    <Link to={`/salons/${b.salon_id}`} className="btn btn-outline btn-sm">
                      View Salon Page
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No Appointments Booked Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Explore salons, compare exact service prices, and schedule your first visit!
            </p>
            <Link to="/salons" className="btn btn-primary btn-sm">
              Explore Salons
            </Link>
          </div>
        )
      ) : (
        /* Favourites Tab */
        favourites.length > 0 ? (
          <div className="grid-salons">
            {favourites.map(salon => (
              <SalonCard
                key={salon.id}
                salon={salon}
                onFavouriteToggle={() => loadData()}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Heart size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No Saved Salons</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Click the heart icon on any salon card to save it for quick access here.
            </p>
            <Link to="/salons" className="btn btn-primary btn-sm">
              Discover Salons
            </Link>
          </div>
        )
      )}

      {/* Review Modal Dialog */}
      {reviewModalOpen && reviewBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setReviewModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>Review Your Appointment</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              {reviewBooking.salon_name} • {reviewBooking.service_name}
            </p>

            {reviewError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Your Rating</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map(starVal => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setReviewRating(starVal)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star
                        size={32}
                        fill={starVal <= reviewRating ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Feedback / Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about the hygiene, stylist skill, and timeliness..."
                  className="form-textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {reviewSubmitting ? <div className="spinner" /> : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
