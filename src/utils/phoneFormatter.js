/**
 * Format phone number with +91 prefix
 * User enters 10 digits, we add +91 automatically
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // If it starts with 91, remove it (user might have entered country code)
  let phoneDigits = digits;
  if (digits.startsWith('91') && digits.length > 10) {
    phoneDigits = digits.substring(2);
  }
  
  // Limit to 10 digits
  phoneDigits = phoneDigits.slice(0, 10);
  
  // Format: +91 XXXXXXXXXX
  if (phoneDigits.length === 10) {
    return `+91 ${phoneDigits}`;
  }
  
  // While typing, show just digits
  return phoneDigits;
};

/**
 * Get formatted phone number for display/API
 * Always returns +91 XXXXXXXXXX format
 */
export const getFormattedPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  
  // Remove leading 91 if present
  let phoneDigits = digits;
  if (digits.startsWith('91') && digits.length > 10) {
    phoneDigits = digits.substring(2);
  }
  
  // Take only 10 digits
  phoneDigits = phoneDigits.slice(0, 10);
  
  if (phoneDigits.length === 10) {
    return `+91 ${phoneDigits}`;
  }
  
  return value; // Return as is if not 10 digits
};

/**
 * Indian mobile for API: 10 digits, strips +91 / spaces / non-digits.
 * Returns "" if not exactly 10 digits.
 */
export const normalizePhoneForApi = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  let p = digits;
  if (p.length >= 12 && p.startsWith('91')) {
    p = p.slice(-10);
  } else if (p.startsWith('91') && p.length > 10) {
    p = p.slice(2);
  } else if (p.length > 10) {
    p = p.slice(-10);
  }
  p = p.slice(0, 10);
  return p.length === 10 ? p : '';
};

/**
 * Validate phone number (must be 10 digits)
 */
export const validatePhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '');
  let phoneDigits = digits;
  
  if (digits.startsWith('91') && digits.length > 10) {
    phoneDigits = digits.substring(2);
  }
  
  return phoneDigits.length === 10;
};

