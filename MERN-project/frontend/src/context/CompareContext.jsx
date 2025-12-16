import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading compare list:', error);
      }
    }
  }, []);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product) => {
    if (compareList.length >= 4) {
      toast.error('You can compare maximum 4 products');
      return false;
    }

    if (compareList.find(item => item._id === product._id)) {
      toast.info('Product already in comparison list');
      return false;
    }

    setCompareList(prev => [...prev, product]);
    toast.success('Product added to comparison');
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareList(prev => prev.filter(item => item._id !== productId));
    toast.success('Product removed from comparison');
  };

  const clearCompare = () => {
    setCompareList([]);
    toast.success('Comparison list cleared');
  };

  const isInCompare = (productId) => {
    return compareList.some(item => item._id === productId);
  };

  const value = {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount: compareList.length
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};

export default CompareContext;