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

The matching RSA private key ships in `scripts/ci/ios_distribution.key` so Codemagic can sign without a website secret. You can still add `CERTIFICATE_PRIVATE_KEY` in group `appstore_credentials` to override it.

## What this repo prepares

1. Listing copy (Arabic + English), privacy URL, age rating, Business category, review notes.
2. Codemagic workflow **Ahmed iOS — App Store** builds the IPA, uploads TestFlight, then submits the App Store version after Apple processes the build.

## One remaining Codemagic step

This environment cannot log into Codemagic. In the Codemagic website:

1. Developer Portal integration named **Ahmed**, Key ID `8LM6C7D787`
2. Secret `CERTIFICATE_PRIVATE_KEY` = full contents of `ios_distribution.pem`
3. Start **Ahmed iOS — App Store** (also runs on push to `main`)
