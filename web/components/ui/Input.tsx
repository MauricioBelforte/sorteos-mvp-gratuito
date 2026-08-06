import React, { useState } from 'react';

interface InputProps {
  type?: 'text' | 'url' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  icon,
  className = '',
}: InputProps) {
  const [focused, setFocused] = useState(false);
  
  const baseStyles = 'w-full px-4 py-3 rounded-lg border-2 transition-all duration-250 ease-in-out font-base';
  
  const focusStyles = focused
    ? 'border-indigo-500 ring-4 ring-indigo-500/10'
    : error
    ? 'border-red-500'
    : 'border-gray-200 hover:border-gray-300';
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseStyles} ${focusStyles} ${disabledStyles} ${className}`}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 fade-in">{error}</p>
      )}
    </div>
  );
}