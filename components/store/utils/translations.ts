/**
 * Translation helper for store theme sections
 * Provides translations for common labels based on store language
 */

const translations: Record<string, Record<string, string>> = {
    en: {
        about: "About",
        products: "Products",
        contact: "Contact",
        ourProducts: "Our Products",
        ourCollection: "Our Collection",
        whyChooseUs: "Why Choose Us",
        productImages: "Product Images",
        shopNow: "Shop Now",
        cashOnDelivery: "Cash on Delivery",
        cashOnDeliveryDesc: "Pay when you receive your order. Convenient and secure payment option.",
        fastShipping: "Fast Shipping",
        fastShippingDesc: "Quick and reliable delivery to your doorstep. Fast shipping available.",
        highQuality: "High Quality",
        highQualityDesc: "Products crafted with the highest standards for durability and satisfaction.",
        allRightsReserved: "All rights reserved.",
    },
    fr: {
        about: "À propos",
        products: "Produits",
        contact: "Contact",
        ourProducts: "Nos Produits",
        ourCollection: "Notre Collection",
        whyChooseUs: "Pourquoi Nous Choisir",
        productImages: "Images du Produit",
        shopNow: "Acheter Maintenant",
        cashOnDelivery: "Paiement à la Livraison",
        cashOnDeliveryDesc: "Payez à la réception de votre commande. Option de paiement pratique et sécurisée.",
        fastShipping: "Livraison Rapide",
        fastShippingDesc: "Livraison rapide et fiable à votre porte. Expédition rapide disponible.",
        highQuality: "Haute Qualité",
        highQualityDesc: "Produits fabriqués selon les normes les plus élevées pour la durabilité et la satisfaction.",
        allRightsReserved: "Tous droits réservés.",
    },
    ar: {
        about: "حول",
        products: "المنتجات",
        contact: "اتصل بنا",
        ourProducts: "منتجاتنا",
        ourCollection: "مجموعتنا",
        whyChooseUs: "لماذا تختارنا",
        productImages: "صور المنتج",
        shopNow: "تسوق الآن",
        cashOnDelivery: "الدفع عند الاستلام",
        cashOnDeliveryDesc: "ادفع عند استلام طلبك. خيار دفع مريح وآمن.",
        fastShipping: "شحن سريع",
        fastShippingDesc: "توصيل سريع وموثوق إلى باب منزلك. شحن سريع متاح.",
        highQuality: "جودة عالية",
        highQualityDesc: "منتجات مصنوعة بأعلى المعايير للمتانة والرضا.",
        allRightsReserved: "جميع الحقوق محفوظة.",
    },
};

export function getStoreTranslation(key: string, language: string = 'en'): string {
    const lang = language || 'en';
    return translations[lang]?.[key] || translations['en'][key] || key;
}

