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

## Codemagic

See `store/codemagic.json` and `store/github-codemagic.md`. Push to `main` runs **Ahmed iOS — App Store** → TestFlight → App Store review after Apple processes the build.
