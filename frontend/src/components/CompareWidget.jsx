import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import { useCompare } from '../context/CompareContext';

const CompareWidget = () => {
  const { compareList, removeFromCompare, clearCompare, compareCount } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaBalanceScale className="text-blue-600" />
          <span className="font-semibold">Compare ({compareCount})</span>
        </div>
        <button
          onClick={clearCompare}
          className="text-gray-400 hover:text-red-600"
          title="Clear all"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {compareList.map((product) => (
          <div key={product._id} className="flex items-center gap-2 text-sm">
            <img
              src={product.images?.[0]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-8 h-8 object-cover rounded"
            />
            <span className="flex-1 truncate">{product.name}</span>
            <button
              onClick={() => removeFromCompare(product._id)}
              className="text-red-500 hover:text-red-700"
              title="Remove"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <Link
        to="/compare"
        className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Compare Now
      </Link>
    </div>
  );
};

export default CompareWidget;