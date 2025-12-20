# Google Sign-In Setup (Android)

Use this guide to resolve `DEVELOPER_ERROR` and ensure Google Sign-In returns the user email.

## 1) Confirm your Android app identity

- Package name (applicationId): `com.algyas.agispares` (from `android/app/build.gradle`)
- Keystore: This project uses the debug keystore for both debug and release buildTypes.

Generate the SHA-1 that Google needs:

```sh
npm run android:signingReport
```

Copy this SHA1 (from the `:app` block):

```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## 2) Google Cloud Console — create/update OAuth clients

- Open Google Cloud Console → APIs & Services → Credentials
- Android OAuth client:
  - Package name: `com.algyas.agispares`
  - SHA-1 certificate fingerprint: paste the SHA1 above
  - Save
- Web OAuth client:
  - Create OAuth client → Application type: Web application
  - Copy its Client ID (ends with `.apps.googleusercontent.com`)

## 3) Configure the app with the Web Client ID

Add the Web Client ID to your env:

- Create `.env` from `.env.example` and set:

```
GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

The app configures Google Sign-In here:

- `src/screens/LoginWithOtpScreen.js` → `GoogleSignin.configure({ webClientId: process.env.GOOGLE_WEB_CLIENT_ID, offlineAccess: false })`

## 4) Reinstall and test

- Uninstall the app from your device/emulator (clears stale Google auth)
- Re-run Android

Tap the Google icon. You should see a toast with the user email on success.

## iOS (quick note)

- Add URL Type in your iOS target using the REVERSED_CLIENT_ID of your iOS client (if you add iOS sign-in later). For now, Android is our focus.

## Troubleshooting

- `DEVELOPER_ERROR`: Package name/SHA-1 mismatch or wrong Web Client ID; ensure the Android client has `com.algyas.agispares` and the SHA-1 from the step above, and that the Web Client ID is from the same Google project.
- `PLAY_SERVICES_NOT_AVAILABLE`: Update Google Play Services on the device.
- `SIGN_IN_CANCELLED`: User closed the sheet.
- No email returned: Ensure you used the Web Client ID, not iOS client or an unrelated project.
