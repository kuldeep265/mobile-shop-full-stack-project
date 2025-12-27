import React, { useState } from 'react';

const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  type = 'text',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          focused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 transition-colors duration-200 ${
              focused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
            }`} />
          </div>
        )}
        <input
          type={type}
          className={`
            w-full px-3 py-2 border rounded-lg transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
            }
            bg-white dark:bg-gray-700 
            text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            hover:border-gray-400 dark:hover:border-gray-500
            transform hover:scale-[1.02] focus:scale-[1.02]
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;