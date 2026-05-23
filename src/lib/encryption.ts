import crypto from 'crypto';

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY || "", 'hex');
const emailPepper = Buffer.from(process.env.EMAIL_PEPPER || "", 'hex');

export function generateBlindIndex(email: string) {
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Invalid input: email must be a non-empty string');
  }

  return crypto
    .createHmac('sha256', emailPepper)
    .update(email.toLowerCase().trim())
    .digest('hex');
}

export function encryptData(data: string) {
  if (typeof data !== 'string' || !data.trim()) {
    throw new Error('Invalid input: data must be a non-empty string');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Store IV, encrypted text, and authTag together
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptData(encryptedData: string) {
  if (typeof encryptedData !== 'string' || !encryptedData.trim()) {
    throw new Error('Invalid input: encryptedData must be a non-empty string');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected iv:authTag:encryptedText');
  }

  const [ivHex, authTagHex, encryptedText] = parts;

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Decryption failed: ${errorMessage}`);
  }
}
