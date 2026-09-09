# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## الصيغة الحالية / Current values

Use this key only. Do not use `R46D76UXCH`.

- App Store Connect API key name in Codemagic: **`Ahmed`**
- Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
- Key ID: **`8LM6C7D787`**
- File: `AuthKey_8LM6C7D787.p8`

The private key must be the full PEM block, including both lines:

```
-----BEGIN PRIVATE KEY-----
(contents of AuthKey_8LM6C7D787.p8)
-----END PRIVATE KEY-----
```

Do not commit the `.p8` file. Paste or upload it only in Codemagic.

## في Codemagic / In Codemagic

1. Team settings → Team integrations → **Developer Portal** → key **Ahmed**
2. Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
3. Key ID: **`8LM6C7D787`** (replace `R46D76UXCH`)
4. Upload **`AuthKey_8LM6C7D787.p8`**, or paste the full PEM including `BEGIN` / `END`
5. App → **Environment variables** → group name **`appstore_credentials`**
6. Add secret **`CERTIFICATE_PRIVATE_KEY`**: paste the full RSA PEM from `ios_distribution.pem` (`-----BEGIN PRIVATE KEY-----` … `-----END PRIVATE KEY-----`)
7. Save → Start **Ahmed iOS — App Store**

If that secret is missing, the iOS workflow now generates a one-off signing key and frees a distribution-certificate slot so the build can still sign. Add the secret when you can so Apple does not keep issuing a new certificate every build.
