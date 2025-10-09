// System Settings Types

export interface HotelInfoSettings {
  name: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface SystemPreferencesSettings {
  timezone: string;
  currency: string;
  language?: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  reservationAlerts: boolean;
  paymentAlerts: boolean;
}

export interface SecuritySettings {
  passwordMinLength: number;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireSymbols: boolean;
  sessionTimeoutMinutes: number;
}

export interface IntegrationSettings {
  paymentGatewayKey?: string;
  emailProviderKey?: string;
  webhookUrl?: string;
}

export interface Settings {
  hotel: HotelInfoSettings;
  preferences: SystemPreferencesSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  updatedAt?: string;
}

export interface UpdateSettingsData extends Partial<Settings> {}


