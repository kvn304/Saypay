export default ({ config }) => ({
  ...config,
  name: "SayPay - Voice Expense Tracker",
  slug: "saypay-voice-expense",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#10B981"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.saypay.voiceexpense",
    buildNumber: "1",
    infoPlist: {
      NSMicrophoneUsageDescription: "SayPay needs microphone access to record voice expenses and categorize them with AI for accurate expense tracking.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSExceptionDomains: {
          "api.openai.com": {
            NSExceptionAllowsInsecureHTTPLoads: false,
            NSExceptionMinimumTLSVersion: "1.2"
          }
        }
      },
      UIBackgroundModes: ["audio"],
      UIRequiresFullScreen: false,
      UIStatusBarStyle: "light-content"
    },
    associatedDomains: []
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#10B981"
    },
    package: "com.saypay.voiceexpense",
    versionCode: 1,
    permissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK"
    ],
    intentFilters: [
      {
        action: "android.intent.action.VIEW",
        data: [
          {
            scheme: "saypay"
          }
        ],
        category: ["android.intent.category.DEFAULT", "android.intent.category.BROWSABLE"]
      }
    ]
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  extra: {
    eas: {
      projectId: "your-eas-project-id"
    },
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  },
  scheme: "saypay",
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#10B981",
        image: "./assets/splash.png",
        dark: {
          backgroundColor: "#059669",
          image: "./assets/splash.png"
        }
      }
    ],
    [
      "expo-av",
      {
        microphonePermission: "Allow SayPay to access your microphone to record voice expenses."
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  }
});