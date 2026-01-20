import crypto from 'crypto';
import { EncryptionError } from './errors.js';

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

interface DecryptInput {
  ciphertext: string;
  iv: string;
  authTag: string;
}

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 12; // 96 bits (recommended for GCM)
  private readonly authTagLength = 16; // 128 bits
  private readonly key: Buffer;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new EncryptionError('ENCRYPTION_KEY environment variable is required');
    }

    const keyBuffer = Buffer.from(keyHex, 'hex');
    if (keyBuffer.length !== this.keyLength) {
      throw new EncryptionError(
        `ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (256 bits)`
      );
    }

    this.key = keyBuffer;
  }

  /**
   * Encrypts plaintext using AES-256-GCM
   * Returns ciphertext, IV, and authentication tag
   */
  encrypt(plaintext: string): EncryptedData {
    // Generate a unique IV for each encryption
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv, {
      authTagLength: this.authTagLength,
    });

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  /**
   * Decrypts ciphertext using AES-256-GCM
   * Verifies the authentication tag for integrity
   */
  decrypt(data: DecryptInput): string {
    try {
      const iv = Buffer.from(data.iv, 'base64');
      const authTag = Buffer.from(data.authTag, 'base64');
      const ciphertext = Buffer.from(data.ciphertext, 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv, {
        authTagLength: this.authTagLength,
      });

      decipher.setAuthTag(authTag);

      let plaintext = decipher.update(ciphertext);
      plaintext = Buffer.concat([plaintext, decipher.final()]);

      return plaintext.toString('utf8');
    } catch (error) {
      throw new EncryptionError('Failed to decrypt data - authentication failed');
    }
  }

  /**
   * Encrypts a credentials object
   */
  encryptCredentials(credentials: Record<string, unknown>): EncryptedData {
    const plaintext = JSON.stringify(credentials);
    return this.encrypt(plaintext);
  }

  /**
   * Decrypts credentials back to an object
   */
  decryptCredentials<T extends Record<string, unknown>>(data: DecryptInput): T {
    const plaintext = this.decrypt(data);
    return JSON.parse(plaintext) as T;
  }

  /**
   * Generates a secure encryption key (for setup scripts)
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validates that a key has the correct format
   */
  static validateKey(keyHex: string): boolean {
    try {
      const buffer = Buffer.from(keyHex, 'hex');
      return buffer.length === 32;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export { EncryptionService, EncryptedData, DecryptInput };
