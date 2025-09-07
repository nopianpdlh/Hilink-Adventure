// src/lib/auth-config.ts

// Helper function to get the appropriate redirect URL based on environment
const getRedirectUrl = (path: string = '/auth/callback'): string => {
  if (process.env.NODE_ENV === 'production') {
    // Production URL - ganti dengan domain Anda
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
    return `${productionUrl}${path}`;
  }
  
  // Development URL
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  
  // Fallback for server-side
  return `http://localhost:3001${path}`;
};

// Email redirect configuration
const emailRedirectTo = (path: string = '/auth/callback'): string => {
  return getRedirectUrl(path);
};

// Configuration for Supabase Auth
export const authConfig = {
  getRedirectUrl,
  emailRedirectTo,

  // Default auth options
  defaultSignUpOptions: {
    emailRedirectTo: emailRedirectTo(),
  },

  // Custom auth options with additional data
  getSignUpOptions: (userData: Record<string, any> = {}) => ({
    data: userData,
    emailRedirectTo: emailRedirectTo(),
  }),
};

// Helper function for consistent auth flow
export const getAuthRedirectUrl = (): string => {
  return authConfig.getRedirectUrl('/dashboard');
};

// Helper function to determine if we're in production
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Helper function to get the base URL
export const getBaseUrl = (): string => {
  if (isProduction()) {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3001';
};
