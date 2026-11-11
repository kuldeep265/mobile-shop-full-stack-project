import React, { useEffect, useState } from 'react';

const AnimatedContainer = ({ 
  children, 
  animation = 'fadeIn', 
  delay = 0, 
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animations = {
    fadeIn: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`,
    slideInLeft: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`,
    slideInRight: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`,
    scaleIn: `transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`,
    bounceIn: `transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`
  };

  return (
    <div className={`${animations[animation]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContainer;