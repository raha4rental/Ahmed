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

Codemagic signs and uploads with:

- `scripts/ci/AuthKey_8LM6C7D787.key` (App Store Connect API key `8LM6C7D787`)
- `scripts/ci/ios_distribution.key`
- `scripts/ci/ios_distribution.cer`
- `scripts/ci/Ahmed_App_Store_Codemagic.mobileprovision`
- `scripts/ci/publish-ipa.sh` (puts the IPA on App Store Connect / TestFlight)

## Listing

Arabic + English copy, privacy URL, Business category, and review notes are set on App Store Connect for version **1.0.1**.

## Before Add for Review

1. **Build:** Xcode archive (GitHub Actions Mac) uploaded **1.0.1 (5)** (`d6e65f5f-7208-4b06-a8be-8bfc9a2e0551`). This environment cannot open the Xcode GUI (Linux). The Mac runner archived with `xcodebuild` and uploaded the IPA. Open TestFlight, not Codemagic:

   - TestFlight iOS: https://appstoreconnect.apple.com/apps/6810042737/testflight/ios
   - Internal testers group: `9bb6bee9-5a22-41e5-af2e-d48f634b1ffe` (Account Holder `allaasheikh@icloud.com` can install now in the TestFlight app)
   - External group **Ops testers**: `c1eee463-0353-4cae-8b87-11fdfe938405` (`allaasheikh@icloud.com`, `raha4rental@gmail.com`) — waiting for Apple Beta Review before email invites go out
   - GitHub archive run: https://github.com/raha4rental/Ahmed/actions/runs/34392282672
2. **App Privacy:** an Admin must publish answers. Steps: `store/APP_PRIVACY.md`  
   https://appstoreconnect.apple.com/apps/6810042737/appPrivacy  
   Choose **No, we do not collect data from this app** → Save → Publish.

## Codemagic

See `store/codemagic.json` and `store/github-codemagic.md`. Push to `main` runs **Ahmed iOS — App Store** on Codemagic and **iOS App Store** on GitHub Actions. Both upload the IPA to App Store Connect and attach it to version 1.0.1 after Apple processes it. Add for Review stays manual until App Privacy and screenshots are done.
