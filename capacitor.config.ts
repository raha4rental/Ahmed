import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.darraha.ahmed",
  appName: "Ahmed",
  webDir: "out",
  backgroundColor: "#0e1c18",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    hostname: "localhost",
  },
  ios: {
    contentInset: "never",
    preferredContentMode: "mobile",
    scheme: "Ahmed",
    scrollEnabled: false,
    backgroundColor: "#0e1c18",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#0e1c18",
      launchShowDuration: 600,
      launchAutoHide: true,
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#14241f",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#1b3d34",
    },
  },
};

export default config;
