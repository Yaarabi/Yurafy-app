/**
 * Detects if a customer message is promotional/marketing in nature
 * Promotional messages require opt-in consent per Meta WhatsApp Business API policies
 */
export function isPromotionalQuery(message: string): boolean {
    const promotionalKeywords = [
        'promo', 'promotion', 'promotional',
        'sale', 'sales', 'discount', 'discounted',
        'offer', 'special offer', 'deal', 'special deal',
        'buy now', 'limited time', 'flash sale', 'clearance',
        'advertisement', 'ad', 'marketing', 'newsletter',
        'subscribe', 'subscription', 'upgrade', 'premium',
        'exclusive', 'bonus', 'gift', 'free shipping'
    ];
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if message contains promotional keywords
    return promotionalKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}
