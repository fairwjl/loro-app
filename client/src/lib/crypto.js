// client/src/lib/crypto.js
// Minimal WebCrypto helpers for encrypting JSON with a passphrase.
// AES-GCM for encryption; PBKDF2 (SHA-256) for key derivation.
// Output is a JSON blob with base64 fields: { v, kdf, iter, salt, iv, ct }

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// ----- base64 helpers -----
function b64encode(bytes) {
  if (typeof window === 'undefined') return '';
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function b64decode(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// ----- random -----
function randomBytes(len) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}

// ----- KDF: PBKDF2 -> AES-GCM key -----
async function deriveKey(passphrase, salt, iterations = 200000) {
  const passBytes = new TextEncoder().encode(passphrase);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a JS object into a compact JSON blob
export async function encryptJSON(obj, passphrase) {
    if (!passphrase || passphrase.length < 4) {
    throw new Error('Passphrase must be at least 4 characters.');
  }
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(passphrase, salt, 200000);
  const plaintext = textEncoder.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  return {
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iter: 200000,
    salt: b64encode(salt),
    iv: b64encode(iv),
    ct: b64encode(ciphertext),
  };
}

// Decrypt the JSON blob back into a JS object
export async function decryptJSON(blob, passphrase) {
  if (!blob || typeof blob !== 'object') throw new Error('Invalid encrypted blob.');
  const { v, kdf, iter, salt, iv, ct } = blob;
  if (v !== 1 || kdf !== 'PBKDF2-SHA256') throw new Error('Unsupported format.');

  const saltBytes = new Uint8Array(b64decode(salt));
  const ivBytes = new Uint8Array(b64decode(iv));
  const ctBytes = new Uint8Array(b64decode(ct));

  const key = await deriveKey(passphrase, saltBytes, iter || 200000);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, key, ctBytes);
  const json = textDecoder.decode(plaintext);
  return JSON.parse(json);
}