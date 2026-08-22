import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-plum-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-plum-900 hover:bg-plum-950 text-white shadow-xs border border-plum-950',
    secondary: 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-subtle',
    outline: 'border border-stone-300 hover:bg-stone-100 text-stone-700 bg-transparent',
    ghost: 'hover:bg-stone-100 text-stone-700',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
