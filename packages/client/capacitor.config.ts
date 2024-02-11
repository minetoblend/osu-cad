import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.osucad',
  appName: 'osucad',
  webDir: 'mobile-dist',
  server: {
    androidScheme: 'osucad',
    allowNavigation: ['dev.osucad.com', 'osu.ppy.sh'],
  }
};

export default config;
