# Ahmed — GitHub then Codemagic then App Store Connect

iOS / TestFlight is the goal. Android is secondary and does not run on push.

## 1. GitHub

Repo: `https://github.com/raha4rental/Ahmed`

## 2. App Store Connect (required)

Follow `store/app-store-connect.md`. You must:

1. Create API key **Ahmed** (App Manager) and download the `.p8`
2. Create the iOS app record named **Ahmed** with bundle ID `com.darraha.ahmed`
3. In Codemagic, connect Developer Portal with that key named **Ahmed**

This agent cannot sign in to Apple, GitHub, or Codemagic.

## 3. Codemagic

1. Open [codemagic.io](https://codemagic.io)
2. Sign in with **GitHub** (`raha4rental`)
3. Apps → **Add application** → GitHub → **Ahmed**
4. Team integrations → Developer Portal → key name **Ahmed**
5. Start **Ahmed iOS — App Store** (also runs on every push to `main`)

`codemagic.yaml` uses:

```yaml
integrations:
  app_store_connect: Ahmed
ios_signing:
  distribution_type: app_store
  bundle_identifier: com.darraha.ahmed
```

Codemagic then creates the Apple signing files and uploads the IPA to TestFlight.

The APK workflow **Ahmed Android** is manual.
