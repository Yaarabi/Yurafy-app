"use client";

interface DomainInputProps {
    value: string;
    onChange: (value: string) => void;
    isValid?: boolean;
    isValidating?: boolean;
    error?: string | null;
    primaryColor?: string;
    required?: boolean;
}

export default function DomainInput({ 
    value, 
    onChange,
    isValid = false,
    isValidating = false,
    error = null,
    primaryColor = '#3B82F6',
    required = true 
}: DomainInputProps) {
    return (
        <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                Store Domain {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex-1 w-full flex items-center gap-2">
                        <input
                            id="domain"
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="my-awesome-store"
                            className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-base placeholder-gray-400 ${
                                error ? 'text-red-500' : 'text-gray-900'
                            }`}
                            required={required}
                        />
                        {isValidating && (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0"></div>
                        )}
                        {!isValidating && value && (
                            <>
                                {isValid ? (
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : error ? (
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                ) : null}
                            </>
                        )}
                        <span className="text-gray-500 text-sm sm:text-base whitespace-nowrap">
                            .yurafy.com
                        </span>
                    </div>
                </div>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {isValid && !error && (
                <p className="mt-1 text-sm text-green-600">✓ Domain is available!</p>
            )}
            <p className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                <span className="font-semibold text-blue-900">Your subdomain:</span> {value || 'my-awesome-store'}.yurafy.com
            </p>
        </div>
    );
}

