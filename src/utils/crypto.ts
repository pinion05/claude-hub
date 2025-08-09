/**
 * Simple encryption utility for client-side data
 * NOTE: This is basic obfuscation, not secure encryption
 * For production, use proper encryption libraries
 */

const STORAGE_KEY = 'ch_sk';

/**
 * Encodes data to base64
 */
export function encode(data: string): string {
  if (typeof window === 'undefined') return data;
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
}

/**
 * Decodes data from base64
 */
export function decode(encoded: string): string {
  if (typeof window === 'undefined') return encoded;
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
}

/**
 * Simple XOR encryption with a key
 */
export function simpleEncrypt(text: string, key: string = STORAGE_KEY): string {
  if (!text) return text;
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return encode(result);
}

/**
 * Simple XOR decryption with a key
 */
export function simpleDecrypt(encrypted: string, key: string = STORAGE_KEY): string {
  if (!encrypted) return encrypted;
  
  const decoded = decode(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}