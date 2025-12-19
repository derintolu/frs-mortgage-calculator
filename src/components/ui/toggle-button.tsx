import { useState } from 'react';

interface ToggleButtonProps {
  options: [string, string];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ToggleButton({ options, value, onChange, className = '' }: ToggleButtonProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            value === option
              ? 'bg-gradient-to-r from-[var(--brand-primary-blue)] to-[var(--brand-rich-teal)] text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
