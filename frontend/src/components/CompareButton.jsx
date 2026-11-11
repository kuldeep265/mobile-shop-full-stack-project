import React from 'react';
import { FaBalanceScale, FaCheck } from 'react-icons/fa';
import { useCompare } from '../context/CompareContext';

const CompareButton = ({ product, className = '' }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  
  const inCompare = isInCompare(product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-2 border rounded hover:bg-gray-100 flex items-center justify-center transition-colors ${
        inCompare 
          ? 'border-blue-500 bg-blue-50 text-blue-600' 
          : 'border-gray-300 text-gray-600'
      } ${className}`}
      title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
    >
      {inCompare ? <FaCheck className="text-sm" /> : <FaBalanceScale className="text-sm" />}
    </button>
  );
};

export default CompareButton;