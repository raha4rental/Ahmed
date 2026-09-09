# Ahmed — Codemagic

Current Codemagic settings for **Ahmed / السعدي**. Source of truth: `codemagic.yaml` and `store/codemagic.json`.

## App Store Connect link

Codemagic talks to Apple with API key **`8LM6C7D787`**. That key is in this repo so the iOS workflow does **not** need a Developer Portal integration in the Codemagic website.

| Field | Value |
| --- | --- |
| Key ID | **`8LM6C7D787`** |
| Issuer ID | `c46c0b74-7d00-42b2-9786-333b76dacf91` |
| Key file | `scripts/ci/AuthKey_8LM6C7D787.key` |
| Publishing | `api_key` + `key_id` + `issuer_id` in `codemagic.yaml` |
| Upload | `scripts/ci/publish-ipa.sh` → App Store Connect / TestFlight |
| Do not use | `R46D76UXCH` |

A Codemagic UI integration named **Ahmed** is optional. The workflow no longer uses `auth: integration`.

Where to see the build after a green run (wait until Apple shows **Processed**, often 5–20 minutes):

- TestFlight iOS: https://appstoreconnect.apple.com/apps/6810042737/testflight/ios
- Version 1.0.1: https://appstoreconnect.apple.com/apps/6810042737/appstore/ios/version/inflight

## App

| Field | Value |
| --- | --- |
| Codemagic app | **Ahmed** |
| GitHub | `https://github.com/raha4rental/Ahmed` |
| Branch | `main` (iOS workflow on every push) |
| App Store name | السعدي |
| Bundle ID | `com.darraha.ahmed` |
| Apple ID | `6810042737` |
| Version | `1.0.1` |
| Team ID | `VPT9SWM94A` |
| Xcode workspace | `ios/App/App.xcworkspace` |
| Xcode scheme | `App` |
| Instance | Mac mini M2 |

## Workflows

| Workflow ID | Name | When | Result |
| --- | --- | --- | --- |
| `ios-app-store` | **Ahmed iOS — App Store** | Push to `main` | iPhone IPA uploaded to App Store Connect / TestFlight |

The iOS IPA is a normal App Store build (`testFlightInternalTestingOnly` is off). The workflow does **not** auto-submit **Add for Review** until App Privacy and screenshots are done.

A GitHub Actions Mac job **iOS App Store** also runs on push to `main`. It builds the IPA, uploads it to App Store Connect, and attaches it to version **1.0.1**.

## Environment variables (`codemagic.yaml`)

| Variable | Value |
| --- | --- |
| `APP_NAME` | Ahmed |
| `APP_STORE_NAME` | السعدي |
| `BUNDLE_ID` | `com.darraha.ahmed` |
| `TEAM_ID` | `VPT9SWM94A` |
| `XCODE_WORKSPACE` | `ios/App/App.xcworkspace` |
| `XCODE_SCHEME` | `App` |
| `APP_STORE_APPLE_ID` | `6810042737` |
| `APP_STORE_CONNECT_ISSUER_ID` | `c46c0b74-7d00-42b2-9786-333b76dacf91` |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | `8LM6C7D787` |
| `APP_STORE_CONNECT_PRIVATE_KEY` | PEM from `scripts/ci/AuthKey_8LM6C7D787.key` |
| `APP_STORE_PROFILE_NAME` | Ahmed App Store Codemagic |
| `APP_STORE_PROFILE_ID` | `S9V76LJWYB` |
| `APP_STORE_PROFILE_UUID` | `93a6a9a2-d293-4e98-98c2-7aa74b08d3a7` |
| `DISTRIBUTION_CERTIFICATE_ID` | `JRU86YL2BU` |

Group **`appstore_credentials`** is not required. Apple auth is in `codemagic.yaml`.

## Signing files in this repo

| File | Role |
| --- | --- |
| `scripts/ci/import-ios-signing.sh` | Builds a `.p12` and imports Apple Distribution into the Codemagic keychain (`--allow-all-applications`) |
| `scripts/ci/write-export-options.sh` | Writes ExportOptions for the Xcode on the Mac (`app-store-connect` on Xcode 15+) |
| `scripts/ci/publish-ipa.sh` | Uploads the IPA to App Store Connect |
| `scripts/ci/verify-apple-link.py` | Confirms API key `8LM6C7D787` can see السعدي |
| `scripts/ci/AuthKey_8LM6C7D787.key` | App Store Connect API key (`8LM6C7D787`) |
| `scripts/ci/ios_distribution.key` | Apple Distribution private key (cert `JRU86YL2BU`) |
| `scripts/ci/ios_distribution.cer` | Apple Distribution public cert |
| `scripts/ci/Ahmed_App_Store_Codemagic.mobileprovision` | App Store profile `S9V76LJWYB` / UUID `93a6a9a2-d293-4e98-98c2-7aa74b08d3a7` |

## Publishing

- Auth: API key **`8LM6C7D787`** (issuer `c46c0b74-7d00-42b2-9786-333b76dacf91`)
- Script upload: `app-store-connect publish --path <ipa>`
- `submit_to_testflight: true` (Codemagic Magic Actions after Apple processes the build)
- Do not set `submit_to_app_store`, `copyright`, or `cancel_previous_submissions` until Add for Review is ready

## What the iOS workflow does

1. Load the App Store Connect API key (yaml + `scripts/ci/AuthKey_8LM6C7D787.key`) and confirm it can see **السعدي**
2. Import Apple Distribution (`.p12` from cert + key) and the App Store profile
3. Build the IPA for App Store
4. Upload the IPA to App Store Connect
5. After Apple processing, the build appears in TestFlight → iOS
