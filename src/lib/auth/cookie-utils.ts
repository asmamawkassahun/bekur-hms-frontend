import Cookies from 'js-cookie';
import { TokenManager } from './token-manager';

/**
 * Utility functions for cookie management using js-cookie
 */
export class CookieUtils {
    /**
     * Set auth cookie with consistent settings
     */
    static setAuthCookie(token: string): void {
        if (typeof window === 'undefined') return;

        Cookies.set('auth-token', token, {
            expires: 1, // 1 day
            path: '/',
            secure: true,
            sameSite: 'strict'
        });

        console.log('🍪 CookieUtils: Auth cookie set');
    }

    /**
     * Get auth cookie value
     */
    static getAuthCookie(): string | undefined {
        if (typeof window === 'undefined') return undefined;
        return Cookies.get('auth-token');
    }

    /**
     * Remove auth cookie
     */
    static removeAuthCookie(): void {
        if (typeof window === 'undefined') return;

        Cookies.remove('auth-token', { path: '/' });
        console.log('🍪 CookieUtils: Auth cookie removed');
    }

    /**
     * Check if auth cookie exists
     */
    static hasAuthCookie(): boolean {
        return !!this.getAuthCookie();
    }

    /**
     * Verify cookie consistency with stored token
     */
    static verifyCookieConsistency(): boolean {
        const storedToken = TokenManager.getAccessToken();
        const cookieToken = this.getAuthCookie();

        const isConsistent = storedToken === cookieToken;

        console.log('🔍 CookieUtils: Consistency check', {
            stored: storedToken ? 'present' : 'missing',
            cookie: cookieToken ? 'present' : 'missing',
            consistent: isConsistent
        });

        return isConsistent;
    }

    /**
     * Get all cookies for debugging
     */
    static getAllCookies(): Record<string, string> {
        if (typeof window === 'undefined') return {};
        return Cookies.get();
    }

    /**
     * Clear all auth-related cookies
     */
    static clearAllAuthCookies(): void {
        if (typeof window === 'undefined') return;

        // Remove auth-token cookie
        this.removeAuthCookie();

        // Remove any other auth-related cookies if they exist
        const allCookies = this.getAllCookies();
        Object.keys(allCookies).forEach(key => {
            if (key.includes('auth') || key.includes('token')) {
                Cookies.remove(key, { path: '/' });
            }
        });

        console.log('🍪 CookieUtils: All auth cookies cleared');
    }
}
