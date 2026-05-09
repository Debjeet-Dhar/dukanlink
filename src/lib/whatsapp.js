/**
 * WhatsApp Number Utilities
 * Formats and validates WhatsApp phone numbers with +91 country code
 */

/**
 * Format WhatsApp number with +91 country code
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number with +91 prefix
 *
 * @example
 * formatWhatsAppNumber('9876543210') => '+919876543210'
 * formatWhatsAppNumber('919876543210') => '+919876543210'
 * formatWhatsAppNumber('+919876543210') => '+919876543210'
 * formatWhatsAppNumber('98-765-43210') => '+919876543210'
 */
export const formatWhatsAppNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") return "";

  // Remove any spaces, dashes, parentheses, and other special characters except +
  let cleaned = phoneNumber.replace(/[\s\-().]/g, "");

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");

  // Add +91 if number doesn't have country code
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("91")) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+91" + cleaned;
    }
  }

  return cleaned;
};

/**
 * Validate WhatsApp number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid format
 */
export const isValidWhatsAppNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") return false;
  const formatted = formatWhatsAppNumber(phoneNumber);
  return /^\+91\d{10}$/.test(formatted);
};

/**
 * Get WhatsApp link for a phone number
 * @param {string} phoneNumber - Phone number
 * @param {string} message - Optional pre-filled message
 * @returns {string} WhatsApp link
 */
export const getWhatsAppLink = (phoneNumber, message = "") => {
  const formatted = formatWhatsAppNumber(phoneNumber);
  if (!isValidWhatsAppNumber(formatted)) return "";

  const encodedMessage = encodeURIComponent(message);
  // Remove + from phone number for WhatsApp link
  const numberForLink = formatted.replace("+", "");

  return `https://wa.me/${numberForLink}${message ? `?text=${encodedMessage}` : ""}`;
};

/**
 * Display WhatsApp number in readable format
 * @param {string} phoneNumber - Phone number
 * @returns {string} Formatted display string
 *
 * @example
 * displayWhatsAppNumber('+919876543210') => '+91 9876543210'
 */
export const displayWhatsAppNumber = (phoneNumber) => {
  const formatted = formatWhatsAppNumber(phoneNumber);
  if (!formatted) return "";

  // Format as +91 XXXX XXXXXX
  return formatted.replace(/(\+91)(\d{4})(\d{6})/, "$1 $2 $3");
};
