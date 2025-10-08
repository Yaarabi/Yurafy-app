'use client';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton({ productName }: { productName: string }) {
    const whatsappNumber = '212600000000'; // replace with your number
    const message = encodeURIComponent(`Hello, I want to order: ${productName}`);

    return (
        <a
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center"
        >
        <FaWhatsapp size={28} />
        </a>
    );
}
