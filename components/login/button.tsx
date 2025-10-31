
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
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {text}
        </button>
    );
}
