import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'md',
  shadow = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300';
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${paddings[padding]} ${shadows[shadow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;