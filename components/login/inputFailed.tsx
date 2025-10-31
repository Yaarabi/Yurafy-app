'use client';
import React from 'react';

interface InputFieldProps {
    label: string;
    placeholder?: string;
    type: string;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string | null;
    required?: boolean;
}

export default function InputField({
    label,
    placeholder,
    type,
    name,
    value,
    onChange,
    error,
    required = false,
    }: InputFieldProps) {
    return (
        <div className="space-y-1">
        <label
            htmlFor={name}
            className="block text-gray-700 mb-1 font-medium"
        >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            aria-invalid={!!error}
            className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-900 border 
            ${error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500'}
            focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
        />

        {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
        </div>
    );
}
