/**
 * Secure encryption utility using Web Crypto API
 * Production-ready encryption implementation
 */

// Generate a cryptographically secure random key
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using AES-GCM
export async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );
  
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// Decrypt data using AES-GCM
export async function decryptData(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  
  const ciphertextBuffer = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  );
  
  return decoder.decode(plaintext);
}

// Store key securely in IndexedDB (better than localStorage)
export async function storeKey(key: CryptoKey): Promise<void> {
  const db = await openDB();
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  
  const transaction = db.transaction(['keys'], 'readwrite');
  const store = transaction.objectStore('keys');
  await store.put(exportedKey, 'encryption-key');
}

// Retrieve key from IndexedDB
export async function retrieveKey(): Promise<CryptoKey | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(['keys'], 'readonly');
    const store = transaction.objectStore('keys');
    const exportedKey = await store.get('encryption-key');
    
    if (!exportedKey) return null;
    
    return await crypto.subtle.importKey(
      'jwk',
      exportedKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  } catch {
    return null;
  }
}

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ClaudeHubSecure', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
  });
}

// Hash sensitive data (one-way)
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}