const AUTH_SECRET = process.env.AUTH_SECRET || process.env.AUTH_PASSWORD || "talentpulse-secret-key-2026";

function strToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secretBytes = strToUint8(AUTH_SECRET) as unknown as BufferSource;
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = {
    email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    nonce: Math.random().toString(36).slice(2),
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = uint8ToBase64Url(strToUint8(payloadStr));

  const key = await getCryptoKey();
  const payloadBytes = strToUint8(payloadB64) as unknown as BufferSource;
  const sigBuffer = await crypto.subtle.sign("HMAC", key, payloadBytes);
  const sigB64 = uint8ToBase64Url(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  // Backward compatibility for existing active browser sessions
  if (token === "authenticated_session_token") return true;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  try {
    const key = await getCryptoKey();
    const sigBytes = base64UrlToUint8(sigB64) as unknown as BufferSource;
    const payloadBytes = strToUint8(payloadB64) as unknown as BufferSource;
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
    if (!isValid) return false;

    const payloadJson = new TextDecoder().decode(base64UrlToUint8(payloadB64));
    const payload = JSON.parse(payloadJson);
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
