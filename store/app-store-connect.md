# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## الصيغة الحالية / Current values

Use this key only. Do not use `R46D76UXCH`.

- Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
- Key ID: **`8LM6C7D787`**
- File in repo: `scripts/ci/AuthKey_8LM6C7D787.key`
- Team ID: `VPT9SWM94A`
- Distribution certificate: `JRU86YL2BU`
- App Store profile: **Ahmed App Store Codemagic** (`S9V76LJWYB`)

Codemagic is linked in `codemagic.yaml` with `api_key` / `key_id` / `issuer_id`. A Developer Portal integration in the Codemagic website is optional.

The IPA is uploaded by `scripts/ci/publish-ipa.sh`. After Apple processes it, open:

- https://appstoreconnect.apple.com/apps/6810042737/testflight/ios
- https://appstoreconnect.apple.com/apps/6810042737/appstore/ios/version/inflight

## في Codemagic / In Codemagic

No website step is required. Push to `main` runs **Ahmed iOS — App Store**, which authenticates to Apple as key **`8LM6C7D787`** and uploads the IPA to TestFlight.
