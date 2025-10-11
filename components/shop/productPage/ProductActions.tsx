'use client';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
    productName: string;
    ownerPhone?: string;
}

export default function WhatsAppButton({ productName, ownerPhone }: WhatsAppButtonProps) {
    const phone = ownerPhone || '212600000000'; // fallback phone
    const url = `https://wa.me/${phone}?text=Bonjour,%20je%20veux%20commander%20le%20produit:%20${encodeURIComponent(productName)}`;

    return (
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition"
        >
        <FaWhatsapp className="text-xl" />
        </a>
    );
}
