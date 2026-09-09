# Ahmed — GitHub then Codemagic

This agent cannot sign in to GitHub or Codemagic. After you create the GitHub repo, connect it in Codemagic — the `Ahmed Android` workflow starts on push to `main`.

## 1. GitHub (required first)

In Cursor click **Create repo** and name it **Ahmed**.

Or: [github.com/new](https://github.com/new) → `raha4rental` / `Ahmed` → Private → no README.

## 2. Codemagic (2 minutes)

1. Open [codemagic.io](https://codemagic.io)
2. Sign in with **GitHub** (`raha4rental`)
3. Apps → **Add application** → GitHub → **Ahmed**
4. Start workflow **Ahmed Android**

The APK appears under that build’s artifacts.

## 3. iOS TestFlight (after Android works)

1. Apple Developer: bundle ID `com.ahmed.app`
2. App Store Connect: app name **Ahmed** — see `store/app-store-connect.md`
3. Codemagic → Team integrations → App Store Connect API key named **Ahmed**
4. Start **Ahmed iOS — App Store**
