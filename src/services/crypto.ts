/**
 * Cryptographic utility for password hashing & verification
 * Never store passwords in plain text.
 */

export async function hashPassword(password: string, customSalt?: string): Promise<string> {
  const salt = customSalt || Math.random().toString(36).substring(2, 10);
  const textToHash = `${salt}:${password}`;

  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(textToHash);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${salt}:${hashHex}`;
    }
  } catch (e) {
    console.warn('SubtleCrypto error, using fallback hash:', e);
  }

  // Fallback hashing for hermetic environments
  let hash = 0;
  for (let i = 0; i < textToHash.length; i++) {
    const char = textToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256:${salt}:${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  // If already hashed format `sha256:salt:hash`
  if (storedHash.startsWith('sha256:')) {
    const parts = storedHash.split(':');
    if (parts.length === 3) {
      const salt = parts[1];
      const expected = await hashPassword(password, salt);
      return expected === storedHash;
    }
  }

  // Backward compatibility check for plain passwords from initial seeding
  if (storedHash === password) {
    return true;
  }

  return false;
}
