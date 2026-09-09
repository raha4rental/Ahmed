# Ahmed — GitHub + Codemagic

The app project is ready. This environment cannot sign in to your GitHub or Codemagic accounts.

**GitHub account found:** [raha4rental](https://github.com/raha4rental)

## 1. Create the GitHub repo

Fastest for this Cursor project:

1. Click the **Create repo** pill in Cursor.
2. Name the repository **Ahmed**.
3. After it is created, this agent can push the full app there.

Or create it yourself:

1. Open [github.com/new](https://github.com/new)
2. Owner: `raha4rental`
3. Repository name: `Ahmed`
4. Private
5. Do not add a README (the project already has one)

Then add the remote and push from a machine that is logged in as `raha4rental`:

```bash
git remote add github https://github.com/raha4rental/Ahmed.git
git push -u github main
```

## 2. Connect Codemagic

1. Open [codemagic.io](https://codemagic.io) and sign in with **GitHub** (`raha4rental`).
2. Applications → Add application → GitHub → **Ahmed**.
3. Codemagic will read `codemagic.yaml` in the repo.
4. Workflows:
   - `Ahmed iOS — App Store` → TestFlight IPA
   - `Ahmed Android` → debug APK

## 3. iOS signing + App Store Connect

1. In Apple Developer, create bundle ID `com.ahmed.app`.
2. In App Store Connect, create the iOS app **Ahmed**. Details: `store/app-store-connect.md`.
3. In Codemagic → Teams → Integrations → App Store Connect, add an API key named **Ahmed**.
4. In Codemagic → Ahmed → iOS code signing, select the `com.ahmed.app` profile.
5. Start `Ahmed iOS — App Store`.

## 4. Android

The Android workflow builds a debug APK you can install on a phone. Add a release keystore in Codemagic later for Play Store.
