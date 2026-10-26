import React, { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext(null);

export function ComparisonProvider({ children }) {
  const [selectedSalons, setSelectedSalons] = useState(() => {
    try {
      const saved = sessionStorage.getItem('salon_compare_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [targetService, setTargetService] = useState('Haircut');

  useEffect(() => {
    sessionStorage.setItem('salon_compare_list', JSON.stringify(selectedSalons));
  }, [selectedSalons]);

  const addToCompare = (salon) => {
    if (selectedSalons.find(s => s.id === salon.id)) return;
    if (selectedSalons.length >= 4) {
      alert('You can compare up to 4 salons at a time for optimal side-by-side readability.');
      return;
    }
    setSelectedSalons(prev => [...prev, salon]);
  };

  const removeFromCompare = (salonId) => {
    setSelectedSalons(prev => prev.filter(s => s.id !== salonId));
  };

  const clearCompare = () => {
    setSelectedSalons([]);
  };

  const isInCompare = (salonId) => {
    return selectedSalons.some(s => s.id === salonId);
  };

  return (
    <ComparisonContext.Provider value={{
      selectedSalons,
      targetService,
      setTargetService,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      count: selectedSalons.length,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within a ComparisonProvider');
  return ctx;
}
