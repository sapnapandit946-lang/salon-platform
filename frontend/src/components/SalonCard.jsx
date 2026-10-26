import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Scale, Heart, Check, Scissors } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SalonCard({ salon, onFavouriteToggle }) {
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  const { isAuthenticated } = useAuth();
  const comparing = isInCompare(salon.id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (comparing) {
      removeFromCompare(salon.id);
    } else {
      addToCompare(salon);
    }
  };

  const handleFavClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to save salons to your favourites.');
      return;
    }
    try {
      await api.salons.toggleFavourite(salon.id);
      if (onFavouriteToggle) onFavouriteToggle(salon.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden', background: '#e2e8f0' }}>
        <img
          src={salon.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
          alt={salon.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Locality Pill */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          color: '#f8fafc',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <MapPin size={12} style={{ color: '#38bdf8' }} />
          <span>{salon.locality}, {salon.city}</span>
        </div>

        {/* Distance Badge if calculable */}
        {salon.distance_km !== null && salon.distance_km !== undefined && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(99, 102, 241, 0.95)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            {salon.distance_km} km away
          </div>
        )}

        {/* Favourite Button */}
        <button
          onClick={handleFavClick}
          title={salon.is_favourite ? 'Remove from favourites' : 'Save to favourites'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s'
          }}
        >
          <Heart
            size={18}
            fill={salon.is_favourite ? '#f43f5e' : 'none'}
            color={salon.is_favourite ? '#f43f5e' : '#64748b'}
          />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            <Link to={`/salons/${salon.id}`} style={{ color: 'inherit' }}>
              {salon.name}
            </Link>
          </h3>

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: '#ecfdf5',
            color: '#065f46',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            <Star size={13} fill="#059669" color="#059669" />
            <span>{salon.rating > 0 ? salon.rating.toFixed(1) : 'New'}</span>
            {salon.review_count > 0 && <span style={{ color: '#047857', fontWeight: 500 }}>({salon.review_count})</span>}
          </div>
        </div>

        <p style={{
          fontSize: '0.825rem',
          color: '#64748b',
          lineHeight: 1.5,
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {salon.description || salon.address}
        </p>

        {/* Exact Matched Service Highlight */}
        <div style={{
          marginTop: 'auto',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            {salon.matched_service_name ? `Price for ${salon.matched_service_name}` : 'Featured Service'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
              ₹{salon.matched_service_price ? salon.matched_service_price.toLocaleString('en-IN') : 'Enquire'}
            </span>
            {salon.matched_service_duration && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> {salon.matched_service_duration} mins
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCompareClick}
            className={`btn btn-sm ${comparing ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              borderColor: comparing ? '#10b981' : '#6366f1',
              color: comparing ? '#065f46' : '#6366f1',
              background: comparing ? '#ecfdf5' : 'transparent'
            }}
          >
            {comparing ? (
              <>
                <Check size={14} /> Comparing
              </>
            ) : (
              <>
                <Scale size={14} /> Compare
              </>
            )}
          </button>

          <Link to={`/salons/${salon.id}`} className="btn btn-primary btn-sm">
            View & Book
          </Link>
        </div>
      </div>
    </div>
  );
}
