# Facebook Login Setup (Android)

## 1) Create a Facebook App
- https://developers.facebook.com → Create App → Consumer
- Add Facebook Login product → Android

## 2) Package name and default activity
- Package name: `com.app.latest`
- Default Activity Class Name: `com.app.latest.MainActivity`

## 3) Key hashes
- Debug key hash: generate from debug.keystore

```sh
keytool -exportcert -alias androiddebugkey -keystore android/app/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
```

Copy the printed hash into Facebook App → Settings → Advanced → Android → Key Hashes.

## 4) App ID and Client Token
- In Facebook App → Settings → Basic: copy App ID and Client Token.
- Set env vars for Android build:

```
FACEBOOK_APP_ID=xxxxxxxxxxxxxxx
FACEBOOK_CLIENT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

These flow into Android strings via manifest placeholders and are used by the SDK.

## 5) Reinstall and test
- Uninstall the app
- Rebuild Android
- Tap the Facebook icon → grant email permission
- We call your validate_social_auth_token API with the email to log the user in.
