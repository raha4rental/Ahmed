# Ahmed — Codemagic

Current Codemagic settings for **Ahmed / السعدي**. Source of truth: `codemagic.yaml` and `store/codemagic.json`.

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
| `ios-app-store` | **Ahmed iOS — App Store** | Push to `main` | IPA → TestFlight → App Store (`AFTER_APPROVAL`) |
| `android-internal` | **Ahmed Android** | Manual | Debug APK |

The iOS IPA is a normal App Store build (`testFlightInternalTestingOnly` is off).

## Developer Portal (Codemagic → Team integrations)

| Field | Value |
| --- | --- |
| Integration name | **Ahmed** (must match `codemagic.yaml`) |
| Issuer ID | `c46c0b74-7d00-42b2-9786-333b76dacf91` |
| Key ID | **`8LM6C7D787`** |
| Key file | `AuthKey_8LM6C7D787.p8` |
| Do not use | `R46D76UXCH` |

Upload the `.p8` only in Codemagic. Do not commit it.

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
| `APP_STORE_PROFILE_NAME` | Ahmed App Store Codemagic |
| `APP_STORE_PROFILE_ID` | `S9V76LJWYB` |
| `APP_STORE_PROFILE_UUID` | `93a6a9a2-d293-4e98-98c2-7aa74b08d3a7` |
| `DISTRIBUTION_CERTIFICATE_ID` | `JRU86YL2BU` |

Group **`appstore_credentials`** is optional. The Developer Portal integration already injects the `.p8`. `CERTIFICATE_PRIVATE_KEY` is optional.

## Signing files in this repo

| File | Role |
| --- | --- |
| `scripts/ci/ios_distribution.key` | Apple Distribution private key (cert `JRU86YL2BU`) |
| `scripts/ci/ios_distribution.cer` | Apple Distribution public cert |
| `scripts/ci/Ahmed_App_Store_Codemagic.mobileprovision` | App Store profile `S9V76LJWYB` / UUID `93a6a9a2-d293-4e98-98c2-7aa74b08d3a7` |

## Publishing

- Auth: Codemagic integration **Ahmed**
- `submit_to_testflight: true`
- `submit_to_app_store: true`
- `cancel_previous_submissions: true`
- `release_type: AFTER_APPROVAL`
- Copyright: `2026 Ahmed Al Saadi Real Estate & Investments`

## What the iOS workflow does

1. Normalize the App Store Connect `.p8` (`scripts/normalize-asc-key.py`)
2. Install the bundled App Store profile + distribution cert
3. Build the IPA for App Store
4. Publish to TestFlight
5. Submit version **1.0.1** to App Store review after Apple processes the build
