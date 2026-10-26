import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, CheckCircle2, AlertCircle, Clock, MapPin, Star, Sparkles, ArrowRight, Info, IndianRupee, Calendar, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useComparison } from '../context/ComparisonContext';

export default function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const { selectedSalons, targetService: contextService, removeFromCompare, clearCompare } = useComparison();

  const [serviceName, setServiceName] = useState(searchParams.get('service_name') || contextService || 'Haircut & Styling');
  const [city, setCity] = useState(searchParams.get('city') || 'Mumbai');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('max_budget') || '500');
  const [preferredDate, setPreferredDate] = useState(
    searchParams.get('preferred_date') || new Date().toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState(searchParams.get('preferred_time') || '11:00');

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const executeComparison = () => {
    setLoading(true);
    setError('');

    const salonIds = selectedSalons.length > 0 ? selectedSalons.map(s => s.id) : undefined;

    api.compare.getComparison({
      service_name: serviceName,
      city: city || undefined,
      max_budget: maxBudget ? parseFloat(maxBudget) : undefined,
      preferred_date: preferredDate || undefined,
      preferred_time: preferredTime || undefined,
      salon_ids: salonIds,
    })
      .then(res => setComparisonData(res))
      .catch(err => setError(err.message || 'Failed to compare salons.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    executeComparison();
  }, [city, serviceName]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeComparison();
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Title & Explanation */}
      <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#eef2ff',
          color: '#4338ca',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '10px'
        }}>
          <Scale size={14} /> CENTRAL DECISION SUPPORT MATRIX
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Compare Salons for "{serviceName}"
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          We compare the <strong>exact service price</strong> at each salon—not the salon's cheapest service. Rankings are transparently calculated across Budget Fit, Verified Ratings, Proximity, and Appointment Availability.
        </p>
      </div>

      {/* Comparison Control Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '32px', background: '#ffffff' }}>
        <form onSubmit={handleFormSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'flex-end'
        }}>
          {/* Target Service */}
          <div>
            <label className="form-label">Service to Compare</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="form-select"
            >
              <option value="Haircut & Styling">Haircut & Styling</option>
              <option value="Beard Trim & Grooming">Beard Trim & Grooming</option>
              <option value="Hair Spa & Deep Conditioning">Hair Spa Treatment</option>
              <option value="Global Hair Colour">Hair Colouring</option>
              <option value="Keratin Treatment">Keratin Treatment</option>
              <option value="Balayage Highlights">Balayage Highlights</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="form-label">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-select"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          {/* Target Budget */}
          <div>
            <label className="form-label">My Budget (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              className="form-input"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>

          {/* Preferred Date */}
          <div>
            <label className="form-label">Preferred Date</label>
            <input
              type="date"
              className="form-input"
              value={preferredDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label className="form-label">Preferred Time</label>
            <input
              type="time"
              className="form-input"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Scale size={16} />
              <span>Update Matrix</span>
            </button>
          </div>
        </form>

        {/* Selected Salons Filter Notice */}
        {selectedSalons.length > 0 && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#4338ca', fontWeight: 600 }}>
              Comparing your {selectedSalons.length} manually shortlisted salon{selectedSalons.length > 1 ? 's' : ''}:
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {selectedSalons.map(s => (
                <span
                  key={s.id}
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {s.name}
                  <button
                    onClick={() => removeFromCompare(s.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4338ca' }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={clearCompare}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Compare all in city instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transparent Algorithm Weight Banner */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.85rem',
        color: '#475569'
      }}>
        <Info size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#0f172a' }}>Decision Scoring Formula:</strong> Budget Fit (35%) + Travel Distance (25%) + Bayesian Rating (25%) + Schedule Availability (15%). No salon can pay for higher placement.
        </div>
      </div>

      {/* Main Comparison Results View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
          <div>Evaluating candidates and computing multi-factor decision scores...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#991b1b', background: '#fee2e2' }}>
          <p>{error}</p>
        </div>
      ) : comparisonData?.items?.length > 0 ? (
        <div>
          {/* Desktop Table View */}
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', width: '220px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Comparison Criterion
                  </th>
                  {comparisonData.items.map((item, idx) => (
                    <th key={item.salon_id} style={{ padding: '16px', minWidth: '220px', verticalAlign: 'top' }}>
                      {idx === 0 && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#ecfdf5',
                          color: '#065f46',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          marginBottom: '6px'
                        }}>
                          <Sparkles size={12} /> TOP MATCH
                        </div>
                      )}
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.salon_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <MapPin size={12} /> {item.locality}, {item.city}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* 1. Exact Service & Price */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155', background: '#fafafa' }}>
                    Exact Service Price
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.score_breakdown.budget_fit ? '#4f46e5' : '#e11d48' }}>
                        ₹{item.exact_service_price.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        For <strong>{item.exact_service_name}</strong>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 2. Service Duration */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155', background: '#fafafa' }}>
                    Service Duration
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={15} style={{ color: '#64748b' }} />
                        <span>{item.exact_service_duration} minutes</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. Distance from Customer */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155', background: '#fafafa' }}>
                    Travel Distance
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>
                      {item.distance_km !== null ? (
                        <span style={{ fontWeight: 600 }}>{item.distance_km} km</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>City match</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 4. Customer Rating & Reviews */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155', background: '#fafafa' }}>
                    Verified Rating
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                        <Star size={15} fill="#f59e0b" color="#f59e0b" />
                        <span>{item.rating.toFixed(1)}</span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                          ({item.review_count} reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. Schedule & Preferred Slot Availability */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155', background: '#fafafa' }}>
                    Slot Availability
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px' }}>
                      {item.has_preferred_slot ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#065f46', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Open at {preferredTime}
                        </div>
                      ) : item.is_available_for_date ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#92400e', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <AlertCircle size={14} /> Slot busy; other times open
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#991b1b', background: '#fee2e2', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <X size={14} /> Closed on this date
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                        {item.opening_hours_text}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6. Overall Decision Support Score */}
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Match Score & Recommendation
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5' }}>
                          {item.score_breakdown.total_composite_score}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 100</span>
                      </div>

                      {/* Explanation Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                        {item.score_breakdown.reasons.map((r, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{ color: '#6366f1', marginTop: '2px' }}>•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 7. Action Row */}
                <tr>
                  <td style={{ padding: '20px', background: '#fafafa' }}>
                    Proceed to Booking
                  </td>
                  {comparisonData.items.map(item => (
                    <td key={item.salon_id} style={{ padding: '20px' }}>
                      <Link
                        to={`/salons/${item.salon_id}?selected_service_id=${item.exact_service_id}&date=${preferredDate}&time=${preferredTime}`}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '0.875rem' }}
                      >
                        <span>Book at ₹{item.exact_service_price}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No salons offer "{serviceName}" in this location</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try increasing your budget or selecting an alternative service such as Haircut or Hair Spa.
          </p>
          <button onClick={() => setServiceName('Haircut & Styling')} className="btn btn-primary btn-sm">
            Reset to Haircut & Styling
          </button>
        </div>
      )}
    </div>
  );
}
