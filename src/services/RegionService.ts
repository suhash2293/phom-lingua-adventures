
import { supabase } from '@/integrations/supabase/client';

export interface RegionRestriction {
  id: string;
  country_code: string;
  is_allowed: boolean;
  feature_restrictions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export class RegionService {
  
  /**
   * Get user's country code using various detection methods
   */
  static async getUserCountryCode(): Promise<string> {
    try {
      // Try to get country from browser's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryFromTimezone = RegionService.getCountryFromTimezone(timezone);
      
      if (countryFromTimezone) {
        return countryFromTimezone;
      }

      // Try to get country from browser's locale
      const locale = navigator.language || navigator.languages?.[0];
      if (locale && locale.includes('-')) {
        const countryCode = locale.split('-')[1].toUpperCase();
        if (countryCode.length === 2) {
          return countryCode;
        }
      }

      // Fallback to IP-based detection (if available)
      try {
        const response = await fetch('https://ipapi.co/country/');
        if (response.ok) {
          const countryCode = await response.text();
          if (countryCode && countryCode.length === 2) {
            return countryCode.toUpperCase();
          }
        }
      } catch (ipError) {
        console.warn('IP-based country detection failed:', ipError);
      }

      // Default fallback
      return 'US';
    } catch (error) {
      console.error('Error detecting country:', error);
      return 'US';
    }
  }

  /**
   * Get country code from timezone (basic mapping)
   */
  private static getCountryFromTimezone(timezone: string): string | null {
    const timezoneCountryMap: Record<string, string> = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Dublin': 'IE',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Pacific/Auckland': 'NZ',
      'Asia/Kolkata': 'IN',
      'Asia/Mumbai': 'IN',
      'Asia/Delhi': 'IN',
    };

    return timezoneCountryMap[timezone] || null;
  }

  /**
   * Check if a country is allowed
   */
  static async isCountryAllowed(countryCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('region_restrictions')
        .select('is_allowed')
        .eq('country_code', countryCode)
        .single();

      if (error || !data) {
        // If country is not in our restrictions table, assume it's blocked by default
        console.warn(`Country ${countryCode} not found in restrictions table`);
        return false;
      }

      return data.is_allowed;
    } catch (error) {
      console.error('Error checking country restrictions:', error);
      // Default to blocking if we can't check
      return false;
    }
  }

  /**
   * Get all region restrictions
   */
  static async getAllRegionRestrictions(): Promise<RegionRestriction[]> {
    const { data, error } = await supabase
      .from('region_restrictions')
      .select('*')
      .order('country_code');

    if (error) {
      console.error('Error fetching region restrictions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if current user's region is allowed
   */
  static async checkCurrentUserRegion(): Promise<{
    isAllowed: boolean;
    countryCode: string;
  }> {
    const countryCode = await RegionService.getUserCountryCode();
    const isAllowed = await RegionService.isCountryAllowed(countryCode);

    console.log(`Region check: Country ${countryCode}, Allowed: ${isAllowed}`);

    return {
      isAllowed,
      countryCode
    };
  }

  /**
   * Get feature restrictions for a country
   */
  static async getFeatureRestrictions(countryCode: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('region_restrictions')
        .select('feature_restrictions')
        .eq('country_code', countryCode)
        .single();

      if (error || !data) {
        return {};
      }

      return data.feature_restrictions || {};
    } catch (error) {
      console.error('Error getting feature restrictions:', error);
      return {};
    }
  }
}
