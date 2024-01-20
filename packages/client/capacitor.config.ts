import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.osucad',
  appName: 'osucad',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://osucad.com',
    allowNavigation: ['osucad.com', 'osu.ppy.sh'],
  }
};

export default config;
