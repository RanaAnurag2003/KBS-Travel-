/**
 * Decodes a JSON Web Token (JWT) client-side without external dependencies.
 * Extracts user profile information from the Google ID Token.
 * 
 * @param {string} token - Google ID token JWT
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("JWT does not have 3 parts");
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
