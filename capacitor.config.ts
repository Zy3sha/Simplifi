/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.obubba.app',
  appName: 'OBubba',
  webDir: 'dist',

  // Server config for dev
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app.obubba.com',
  },

  // Prevent white flash on launch — set webview background to match splash
  android: {
    backgroundColor: '#F0DDD6',
  },
  ios: {
    backgroundColor: '#F0DDD6',
  },

  plugins: {
    // ── Push Notifications ──
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // ── Local Notifications ──
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#C07088',
      sound: 'notification.wav',
    },

    // ── Splash Screen ──
    SplashScreen: {
      launchShowDuration: 30000,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: '#F0DDD6',
      showSpinner: false,
    },

    // ── Keyboard ──
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
      scroll: true,
    },

    // ── Status Bar ──
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#F0DDD6',
    },

    // ── App Shortcuts (Quick Actions / 3D Touch) ──
    AppShortcuts: {
      shortcuts: [
        {
          id: 'log_feed',
          title: 'Log Feed',
          icon: 'feed_icon',
        },
        {
          id: 'log_sleep',
          title: 'Log Sleep',
          icon: 'sleep_icon',
        },
        {
          id: 'log_nappy',
          title: 'Log Nappy',
          icon: 'nappy_icon',
        },
        {
          id: 'start_timer',
          title: 'Start Timer',
          icon: 'timer_icon',
        },
      ],
    },

    // ── Biometric Auth ──
    BiometricAuth: {
      allowDeviceCredential: true,
    },

    // ── SQLite (offline persistence) ──
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      androidIsEncryption: false,
    },

    // ── Camera ──
    Camera: {
      presentationStyle: 'popover',
    },

    // ── Network ──
    Network: {},

    // ── Badge ──
    Badge: {},

    // ── Native Firebase Auth ──
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['apple.com', 'google.com'],
    },
  },

  // ── iOS-specific ──
  ios: {
    scheme: 'OBubba',
    contentInset: 'always',
    allowsLinkPreview: true,
    backgroundColor: '#F0DDD6',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    // Enable associated domains for Universal Links & Siri
    // Configured in Xcode: applinks:obubba.com, activitycontinuation:obubba.com
  },

  // ── Android-specific ──
  android: {
    backgroundColor: '#F0DDD6',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // App Links configured via assetlinks.json
  },
};

export default config;
