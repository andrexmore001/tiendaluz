/**
 * Formats a phone number for use in a WhatsApp link.
 * Ensures only digits remain and prefixes with '57' (Colombia) if no country code is present.
 * 
 * @param phone The raw phone number string
 * @returns A sanitized phone number string for wa.me links
 */
export function formatWhatsAppNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's empty, return an empty string
    if (!cleaned) return '';
    
    // If it starts with 57 and has 12 digits (57 + 10 digits), it's likely already correct
    if (cleaned.startsWith('57') && cleaned.length === 12) {
        return cleaned;
    }
    
    // If it has 10 digits and doesn't start with 57, add the 57 prefix
    if (cleaned.length === 10) {
        return `57${cleaned}`;
    }
    
    // For other cases, just return the cleaned digits and hope for the best, 
    // but at least we've cleaned it.
    return cleaned;
}

/**
 * Generates a full WhatsApp link with an optional message.
 * 
 * @param phone The raw phone number string
 * @param message Optional message to pre-fill
 * @returns A full https://wa.me/ URL
 */
export function getWhatsAppLink(phone: string, message?: string): string {
    const formattedPhone = formatWhatsAppNumber(phone);
    const baseUrl = `https://wa.me/${formattedPhone}`;
    
    if (message) {
        return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
    
    return baseUrl;
}
