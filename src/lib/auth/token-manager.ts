import CryptoJS from 'crypto-js';

class TokenManager {
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly ENCRYPTION_KEY =
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
    'default-32-char-encryption-key-here';

  /**
   * Encrypt text using AES encryption
   */
  private static encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        text,
        this.ENCRYPTION_KEY,
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Return original text if encryption fails
    }
  }

  /**
   * Decrypt text using AES decryption
   */
  private static decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        this.ENCRYPTION_KEY,
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Return original text if decryption fails
    }
  }

  /**
   * Store tokens securely
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Store access token in sessionStorage (temporary solution)
      // Store refresh token encrypted in localStorage
      sessionStorage.setItem('access_token', accessToken);
      const encryptedRefreshToken = this.encrypt(refreshToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token from memory (Redux store)
   * This is a placeholder - in a real implementation, you'd get this from the store
   */
  static getAccessToken(): string | null {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // In a real implementation, this would get the token from Redux store
      // For now, we'll get it from sessionStorage as a fallback
      return sessionStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const encryptedRefreshToken = localStorage.getItem(
        this.REFRESH_TOKEN_KEY,
      );
      if (!encryptedRefreshToken) {
        return null;
      }
      return this.decrypt(encryptedRefreshToken);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Check if refresh token is expired
   */
  static isRefreshTokenExpired(): boolean {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return true;
      }

      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }

  /**
   * Check if access token needs refresh
   */
  static shouldRefreshToken(accessToken: string): boolean {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds

      const refreshBeforeExpiry = parseInt(
        process.env.NEXT_PUBLIC_TOKEN_REFRESH_BEFORE_EXPIRY || '60000',
      );
      const timeUntilExpiry = expiration - Date.now();

      return timeUntilExpiry <= refreshBeforeExpiry;
    } catch (error) {
      console.error('Failed to check token refresh need:', error);
      return true;
    }
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem('access_token');
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}

export { TokenManager };
