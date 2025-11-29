import crypto from 'crypto';

const ENC_KEY_HEX = process.env.ENCRYPTION_KEY || '';
if (!ENC_KEY_HEX) {
  // Not throwing here to allow server start in environments without key; operations will fail when used.
  console.warn('ENCRYPTION_KEY is not set. Encrypted fields will not work.');
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(ENC_KEY_HEX, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encrypted: string) {
  if (!encrypted) return '';
  try {
    const [ivHex, dataHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(ENC_KEY_HEX, 'hex'), iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('decryptToken error', err);
    return '';
  }
}
