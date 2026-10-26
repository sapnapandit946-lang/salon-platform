import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComparisonProvider } from './context/ComparisonContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingCompareBar from './components/FloatingCompareBar';

import LandingPage from './pages/LandingPage';
import SalonDiscoveryPage from './pages/SalonDiscoveryPage';
import SalonDetailPage from './pages/SalonDetailPage';
import ComparisonPage from './pages/ComparisonPage';
import AIPreviewPage from './pages/AIPreviewPage';
import MyBookingsPage from './pages/MyBookingsPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComparisonProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/salons" element={<SalonDiscoveryPage />} />
                <Route path="/salons/:id" element={<SalonDetailPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/ai-preview" element={<AIPreviewPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              </Routes>
            </main>
            <FloatingCompareBar />
            <Footer />
          </div>
        </ComparisonProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
