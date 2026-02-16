import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.oisreports',
  appName: 'OIS Reports',
  webDir: 'dist/ois-reports/browser',
  server: {
    cleartext: true,
  },
};

export default config;
