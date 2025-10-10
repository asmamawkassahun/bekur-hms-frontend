import CryptoJS from 'crypto-js';
import { CookieUtils } from './cookie-utils';

// Extend Window interface to include Redux store
declare global {
  interface Window {
    __REDUX_STORE__?: any;
  }
}

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

      // Update auth cookie immediately for middleware access
      CookieUtils.setAuthCookie(accessToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token from Redux store or sessionStorage fallback
   */
  static getAccessToken(): string | null {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // Try to get token from Redux store first
      if (window.__REDUX_STORE__) {
        const state = window.__REDUX_STORE__.getState();
        if (state?.auth?.accessToken) {
          return state.auth.accessToken;
        }
      }

      // Fallback to sessionStorage
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
        process.env.NEXT_PUBLIC_TOKEN_REFRESH_BEFORE_EXPIRY || '300000', // 5 minutes
      );
      const timeUntilExpiry = expiration - Date.now();

      return timeUntilExpiry <= refreshBeforeExpiry;
    } catch (error) {
      console.error('Failed to check token refresh need:', error);
      return true;
    }
  }

  /**
   * Get token expiry time in milliseconds
   */
  static getTokenExpiry(accessToken: string): number | null {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to get token expiry:', error);
      return null;
    }
  }

  /**
   * Get time until token expires in milliseconds
   */
  static getTimeUntilExpiry(accessToken: string): number | null {
    const expiry = this.getTokenExpiry(accessToken);
    if (!expiry) return null;
    return expiry - Date.now();
  }

  /**
   * Check if auth cookie is set and get its value using js-cookie
   */
  static getAuthCookie(): string | undefined {
    return CookieUtils.getAuthCookie();
  }

  /**
   * Verify that the stored token matches the cookie
   */
  static verifyTokenConsistency(): boolean {
    return CookieUtils.verifyCookieConsistency();
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
      CookieUtils.removeAuthCookie();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}

export { TokenManager };
