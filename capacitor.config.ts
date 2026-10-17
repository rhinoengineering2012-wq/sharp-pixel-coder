import type { CapacitorConfig } from "@capacitor/cli";

// TanStack Start requires a hosted SSR app, not a static Vite output directory.
const config: CapacitorConfig = {
  appId: "com.rhino.databank",
  appName: "RHINO DATABANK",
  webDir: "capacitor-shell",
  server: {
    url: "https://sharp-pixel-coder.lovable.app",
    cleartext: false,
  },
  android: { backgroundColor: "#0A3DFF" },
};

export default config;