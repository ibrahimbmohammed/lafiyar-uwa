// encryption.ts
// Data encryption/decryption utility

export function encrypt(data: string): string {
  // Dummy encryption
  return Buffer.from(data).toString('base64');
}

export function decrypt(data: string): string {
  // Dummy decryption
  return Buffer.from(data, 'base64').toString('utf-8');
}
