
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b2672e5209ed497a8921f141ef27b76c',
  appName: 'PhomShah',
  webDir: 'dist',
  server: {
    url: 'https://b2672e52-09ed-497a-8921-f141ef27b76c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'keystore.jks',
      keystoreAlias: 'phomshah',
    }
  }
};

export default config;
