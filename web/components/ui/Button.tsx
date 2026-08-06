import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-250 ease-in-out inline-flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-md hover:shadow-lg',
    secondary: 'bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700 shadow-md hover:shadow-lg',
    outline: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : 'hover:-translate-y-0.5 active:translate-y-0';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0 2.206.666 4.262 1.77 5.837 3.326l3.464-3.464z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}