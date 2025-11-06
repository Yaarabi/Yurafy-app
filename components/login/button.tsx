
"use client"
interface ButtonProps {
    text: string;
    disabled?: boolean;
}

export default function Button({ text, disabled }: ButtonProps) {
    return (
        <button
        disabled={disabled}
        type="submit"
        className="w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#0ea5e9' }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#0284c7')}
        onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#0ea5e9')}
        >
        {text}
        </button>
    );
}
