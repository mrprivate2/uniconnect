/**
 * end-to-end encryption utility using Web Crypto API
 * Using RSA-OAEP for key exchange and AES-GCM for message encryption
 */

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 1. Generate RSA Key Pair
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
}

// 2. Encrypt Message
export async function encryptMessage(message, recipientPublicKeyBase64) {
  // a. Import recipient's public key
  const publicKeyBuffer = base64ToArrayBuffer(recipientPublicKeyBase64);
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // b. Generate random AES-GCM key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // c. Encrypt the actual message with AES
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(message);
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encodedMessage
  );

  // d. Encrypt the AES key with RSA Public Key
  const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    exportedAesKey
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv),
    encryptedAesKey: arrayBufferToBase64(encryptedAesKeyBuffer),
  };
}

// 3. Decrypt Message
export async function decryptMessage(payload, myPrivateKeyBase64) {
  const { ciphertext, iv, encryptedAesKey } = payload;
  if (!ciphertext || !iv || !encryptedAesKey) return "[Unencrypted or Legacy Message]";

  try {
    // a. Import my private key
    const privateKeyBuffer = base64ToArrayBuffer(myPrivateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );

    // b. Decrypt the AES key using my RSA private key
    const encryptedAesKeyBuffer = base64ToArrayBuffer(encryptedAesKey);
    const decryptedAesKeyBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedAesKeyBuffer
    );

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedAesKeyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // c. Decrypt the ciphertext using the AES key
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
    const ivBuffer = base64ToArrayBuffer(iv);
    const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
      aesKey,
      ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedMessageBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "[Decryption Error: Key mismatch or corrupted data]";
  }
}
