import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UploadCloud, Shield, Check, AlertCircle, ArrowRight, RefreshCw, Scissors, Palette, Download } from 'lucide-react';
import { api } from '../services/api';

export default function AIPreviewPage() {
  const [stylesData, setStylesData] = useState(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState('Textured Crop Fade');
  const [selectedColor, setSelectedColor] = useState('Burgundy Wine');
  const [consentGiven, setConsentGiven] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.ai.getStyles()
      .then(res => setStylesData(res))
      .catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5 MB limit. Please select a smaller photo.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, or WebP portrait.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select or drag a portrait photo to begin.');
      return;
    }
    if (!consentGiven) {
      setError('You must check the explicit consent box before processing your photo.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('hairstyle', selectedHairstyle);
    formData.append('hair_color', selectedColor);
    formData.append('consent_given', 'true');

    try {
      const res = await api.ai.transform(formData);
      if (res.status === 'configured_error') {
        setError(res.message);
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err.message || 'Transformation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '1040px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(244, 63, 94, 0.1)',
          color: '#e11d48',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={16} /> VIRTUAL STYLE EXPERIMENTATION
        </div>
        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          AI Virtual Hairstyle & Color Preview
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Visualize hairstyles and hair colors on your portrait photo before visiting the salon. This is a visual aid designed to help you communicate your vision clearly to your stylist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'flex-start' }} className="ai-preview-grid">
        {/* Left Column: Image Upload & Consent */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            1. Provide Your Portrait
          </h2>

          {/* Upload Dropzone */}
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => document.getElementById('ai-photo-upload').click()}
          >
            <input
              id="ai-photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {imagePreviewUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={imagePreviewUrl}
                  alt="Original portrait preview"
                  style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                  Click to replace photo
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#eef2ff',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <UploadCloud size={28} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '4px' }}>
                  Upload front-facing portrait
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  JPG, PNG, or WebP up to 5 MB
                </div>
              </>
            )}
          </div>

          {/* Explicit Privacy & Consent Checkbox */}
          <div style={{
            marginTop: '20px',
            background: '#f1f5f9',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <span>
                <strong>Privacy Consent:</strong> I confirm that I am the person in this image and consent to its temporary processing. My photo will not be used for third-party AI training or permanent storage.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Style Selection & Generation */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            2. Choose Style & Color
          </h2>

          {/* Hairstyle Selection Chips */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scissors size={15} style={{ color: '#6366f1' }} /> Target Hairstyle
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '2px' }}>
              {stylesData?.hairstyles?.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedHairstyle(s.name)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: selectedHairstyle === s.name ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    background: selectedHairstyle === s.name ? '#f5f3ff' : '#ffffff',
                    color: selectedHairstyle === s.name ? '#4f46e5' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {s.name}
                </button>
              )) || (
                ['Textured Crop Fade', 'Classic Pompadour', 'Curtain Fringe', 'Textured Bob', 'Balayage Beach Waves'].map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedHairstyle(name)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: selectedHairstyle === name ? '2px solid #6366f1' : '1px solid #cbd5e1',
                      background: selectedHairstyle === name ? '#f5f3ff' : '#ffffff',
                      color: selectedHairstyle === name ? '#4f46e5' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Hair Color Selection Swatches */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={15} style={{ color: '#6366f1' }} /> Hair Color Shade
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {stylesData?.hair_colors?.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedColor === c.name ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: selectedColor === c.name ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: c.hex,
                    display: 'inline-block',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{c.name}</span>
                </button>
              )) || null}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !imageFile || !consentGiven}
            className="btn btn-accent btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Processing Transformation...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Virtual Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Section */}
      {result && (
        <section style={{ marginTop: '48px' }}>
          <div className="card" style={{ padding: '32px', background: '#ffffff', border: '2px solid #818cf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-primary">Preview Rendered</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {result.hairstyle} with {result.hair_color}
                </h3>
              </div>

              {result.is_mock && (
                <div style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Development Simulation Mode
                </div>
              )}
            </div>

            {/* Split Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Original Photo</div>
                <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                  <img src={imagePreviewUrl} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: '6px' }}>Virtual Transformed Result</div>
                <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                  <img src={result.preview_url} alt="After Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              {result.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to={`/salons?service_name=${encodeURIComponent(result.hairstyle.split(' ')[0])}`}
                className="btn btn-primary"
              >
                <span>Find Salons For This Style</span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={() => { setResult(null); }}
                className="btn btn-secondary"
              >
                <RefreshCw size={14} /> Try Another Style
              </button>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .ai-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
