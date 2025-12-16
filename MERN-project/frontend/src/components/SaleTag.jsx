import React from 'react';

const SaleTag = ({ discount, className = '' }) => {
  if (!discount || discount <= 0) return null;

  return (
    <div className={`absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 ${className}`}>
      -{discount}%
    </div>
  );
};

export default SaleTag;