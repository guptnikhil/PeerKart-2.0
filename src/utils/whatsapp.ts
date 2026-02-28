/**
 * Generates a WhatsApp click URL for contacting a seller.
 * Validates phone number format before generating.
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  itemTitle: string
): string {
  const cleaned = phoneNumber.replace(/[^0-9+]/g, "");
  const number = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  const message = encodeURIComponent(
    `Hi, I'm interested in your listing: "${itemTitle}" on PeerKart. Is it still available?`
  );
  return `https://wa.me/${number}?text=${message}`;
}

/**
 * Validates a WhatsApp phone number (must include country code).
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(cleaned);
}
