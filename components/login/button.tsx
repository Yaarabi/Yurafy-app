
"use client"
interface ButtonProps {
    text: string;
}

export default function Button({ text }: ButtonProps) {
    return (
        <button
        type="submit"
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded transition duration-200"
        >
        {text}
        </button>
    );
}
