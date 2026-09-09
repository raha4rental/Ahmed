# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## خطأ التوكن / Bearer token error

Codemagic must have the `.p8` file, not only the Issuer ID. The key name must be exactly **`ahmed`**.

في Codemagic:

1. Team settings → Team integrations → **Developer Portal**
2. Key name: **`ahmed`** (كل الحروف صغيرة / all lowercase)
3. Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
4. Key ID: `R46D76UXCH`
5. Upload the file `AuthKey_R46D76UXCH.p8` (the download from Apple — not a screenshot, not the YAML)

Then start **Ahmed iOS — App Store**.

If the name in Codemagic is `Ahmed` with a capital A, rename it to `ahmed` or the token will fail.
