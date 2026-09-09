import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ahmed.app",
  appName: "Ahmed",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#0e1c18",
      launchShowDuration: 400,
    },
  },
};

export default config;
