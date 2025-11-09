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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-gray-500 text-sm sm:text-base whitespace-nowrap pt-2 sm:pt-0">
                        yura.com/
                    </span>
                    <div className="flex-1 w-full">
                        <input
                            id="domain"
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="my-awesome-store"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all text-base ${
                                error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
                            }`}
                            style={{ outlineColor: primaryColor }}
                            required={required}
                        />
                    </div>
                </div>
                
                {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 sm:top-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {!isValidating && value && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 sm:top-1/2">
                        {isValid ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : error ? (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        ) : null}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {isValid && !error && (
                <p className="mt-1 text-sm text-green-600">✓ Domain is available!</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
                This will be your store URL: yura.com/{value || 'your-domain'}
            </p>
        </div>
    );
}

