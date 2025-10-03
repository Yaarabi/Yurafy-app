
"use client"
interface InputFieldProps {
    label: string;
    placeholder: string;
    type: string;
    name: string;
}

export default function InputField({ label, placeholder, type, name }: InputFieldProps) {
    return (
        <div>
        <label htmlFor={name} className="block text-gray-300 mb-1">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        </div>
    );
}
