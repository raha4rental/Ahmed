# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## المفتاح في Codemagic / Key Codemagic is using

The last failing build showed:

- Issuer: `c46c0b74-7d00-42b2-9786-333b76dacf91`
- Key ID: **`R46D76UXCH`** (from the Developer Portal integration named **Ahmed**)
- Private key: present, but not PEM text

That last point is expected when Codemagic injects the uploaded `.p8` as a **file path** or **base64**. `codemagic.yaml` now normalizes those into `AuthKey_<id>.p8` before signing.

## في Codemagic / In Codemagic

1. Team settings → Team integrations → **Developer Portal**
2. Key name must match yaml exactly: **`Ahmed`**
3. Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
4. Key ID: **`R46D76UXCH`** (the integration already uses this) or **`8LM6C7D787`**
5. Upload the matching `.p8` file (`AuthKey_R46D76UXCH.p8` or `AuthKey_8LM6C7D787.p8`)
6. Start **Ahmed iOS — App Store**

Do not paste only the Key ID or a password into the private-key field. Upload the `.p8` file.
