# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## الصيغة الحالية / Current values

Use this key only. Do not use `R46D76UXCH`.

- App Store Connect API key name in Codemagic: **`Ahmed`**
- Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
- Key ID: **`8LM6C7D787`**
- File: `AuthKey_8LM6C7D787.p8`
- Team ID: `VPT9SWM94A`
- Distribution certificate: `JRU86YL2BU`
- App Store profile: **Ahmed App Store Codemagic** (`S9V76LJWYB`)

The `.p8` private key must be the full PEM block:

```
-----BEGIN PRIVATE KEY-----
(contents of AuthKey_8LM6C7D787.p8)
-----END PRIVATE KEY-----
```

Do not commit the `.p8`. Paste or upload it only in Codemagic → Developer Portal.

## في Codemagic / In Codemagic

1. Team settings → Team integrations → **Developer Portal** → key **Ahmed**
2. Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
3. Key ID: **`8LM6C7D787`**
4. Upload **`AuthKey_8LM6C7D787.p8`**
5. App group **`appstore_credentials`** is optional (the integration already injects the `.p8`)
6. Distribution signing key is already in the repo as `scripts/ci/ios_distribution.key` — no website secret required
7. Start **Ahmed iOS — App Store**, or push to `main`
