# App Store — السعدي (Ahmed)

Apple ID: `6810042737`  
Bundle ID: `com.darraha.ahmed`  
Version: `1.0.1`

## Signing (already on Apple)

| Item | ID | Status |
| --- | --- | --- |
| Apple Distribution | `JRU86YL2BU` | Active until 2027-09-09 |
| App Store profile (Codemagic) | `S9V76LJWYB` | Active |
| App Store profile (manual) | `358JN62MY3` | Active |
| ASC API key | `8LM6C7D787` | Use this key only |

Codemagic signs and publishes with:

- `scripts/ci/AuthKey_8LM6C7D787.key` (App Store Connect API key `8LM6C7D787`)
- `scripts/ci/ios_distribution.key`
- `scripts/ci/ios_distribution.cer`
- `scripts/ci/Ahmed_App_Store_Codemagic.mobileprovision`

## Listing

Arabic + English copy, privacy URL, Business category, and review notes are set on App Store Connect for version **1.0.1**.

## Before Add for Review

1. **Build:** App Store Connect has no IPA until Codemagic uploads one. After it is **Processed**, choose that build on version 1.0.1.
2. **App Privacy:** an Admin must publish answers. Steps: `store/APP_PRIVACY.md`  
   https://appstoreconnect.apple.com/apps/6810042737/appPrivacy  
   Choose **No, we do not collect data from this app** → Save → Publish.

## Codemagic

See `store/codemagic.json` and `store/github-codemagic.md`. Push to `main` runs **Ahmed iOS — App Store** → TestFlight → App Store review after Apple processes the build.
