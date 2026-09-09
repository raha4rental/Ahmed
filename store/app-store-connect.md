# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

التطبيق على آبل: **السعدي** (`com.darraha.ahmed`, Apple ID `6810042737`).

The app on Apple is **السعدي**.

## المفتاح الحالي / Current API key

- Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
- Key ID: **`8LM6C7D787`**
- File: `AuthKey_8LM6C7D787.p8`
- Codemagic key name: **`ahmed`** (all lowercase)

This agent cannot click Upload in the Codemagic website. You must attach the `.p8` there.

## في Codemagic / In Codemagic

1. Team settings → Team integrations → **Developer Portal**
2. Open the key named **`ahmed`** (or add one with that exact name)
3. Issuer ID: `c46c0b74-7d00-42b2-9786-333b76dacf91`
4. Key ID: **`8LM6C7D787`** (not the old `R46D76UXCH`)
5. Upload **`AuthKey_8LM6C7D787.p8`**
6. Save → Start **Ahmed iOS — App Store**
