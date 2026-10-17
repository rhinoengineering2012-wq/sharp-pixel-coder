# RHINO DATABANK Android

Capacitor 8 is configured with compile SDK 36 and target SDK 36 (minimum SDK 24).

This wrapper loads the published HTTPS RHINO site because TanStack Start requires server rendering. It needs internet access; this is not an offline native app. Publish web updates before testing the wrapper.

Run `bunx cap sync android`, then `bunx cap open android` on a development machine with Android Studio, Android SDK 36, and JDK 21 installed. Build and sign the APK/AAB in Android Studio. No Android package has been built or signed in this sandbox.

The app identifier is `com.rhino.databank`. Confirm ownership before distributing it. Review remote WebView behavior, navigation, login, and store requirements on a real device before release.