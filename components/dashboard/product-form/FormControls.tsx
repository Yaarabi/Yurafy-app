'use client';

/* Reusable Input */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</span>
            <input
                className={`px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition`}
                {...props}
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
        </label>
    );
}

/* Reusable Textarea */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export function Textarea({ label, ...props }: TextareaProps) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</span>
            <textarea
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue transition resize-none"
                rows={4}
                {...props}
            />
        </label>
    );
}
