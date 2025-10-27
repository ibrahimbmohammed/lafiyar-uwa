/**
 * Standardize Nigerian phone numbers to E.164 format
 * Examples:
 * 08012345678 -> +2348012345678
 * 2348012345678 -> +2348012345678
 * +2348012345678 -> +2348012345678
 *
 * @format
 */

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 234
  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  }

  // If doesn't start with 234, add it
  if (!cleaned.startsWith("234")) {
    cleaned = "234" + cleaned;
  }

  // Validate length (should be 13 digits: 234 + 10 digits)
  if (cleaned.length !== 13) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }

  return "+" + cleaned;
};

/**
 * Validate Nigerian phone number
 */
export const isValidNigerianPhone = (phone: string): boolean => {
  try {
    const formatted = formatPhoneNumber(phone);
    return /^\+234[7-9][0-1]\d{8}$/.test(formatted);
  } catch {
    return false;
  }
};
