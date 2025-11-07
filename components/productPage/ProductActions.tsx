
'use client';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '@/components/store/hooks/useStore';

interface WhatsAppButtonProps {
    ownerPhone?: string;
}

export default function WhatsAppButton({ ownerPhone }: WhatsAppButtonProps) {
    const { selectedStore } = useStore();
    
    // Get WhatsApp number from store context first, then from prop, then fallback
    const phone = selectedStore?.whatsappNumber || ownerPhone || selectedStore?.businessInfo?.phone || '212600000000';
    
    // Clean phone number (remove spaces, dashes, and other non-numeric characters except +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=Bonjour,%20je%20veux%20commander%20le%20produit:%20`;

    return (
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition"
        >
        <FaWhatsapp className="text-lg sm:text-xl" />
        </a>
    );
}