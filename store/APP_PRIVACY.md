# App Privacy — السعدي / Ahmed

Apple will not accept **Add for Review** until an **Admin** publishes App Privacy answers. The public App Store Connect API cannot set this section.

Apple لن يقبل **Add for Review** حتى ينشر **Admin** إجابات App Privacy. واجهة برمجة App Store Connect لا تملأ هذا القسم.

## Open this page / افتح هذه الصفحة

https://appstoreconnect.apple.com/apps/6810042737/appPrivacy

## Answers / الإجابات

1. Sidebar → **App Privacy** → **Get Started**
2. Do you collect data? → **No, we do not collect data from this app**  
   هل تجمعون بيانات؟ → **لا، لا نجمع بيانات من هذا التطبيق**
3. **Save** → **Publish**

Why No / لماذا لا: the iPhone app stores apartments, guests, and photos **on the device only**. No analytics SDK, no ads, no tracking, no IDFA. Camera and Photos permissions are for staff photos on-device, not for sending data off the phone.

Privacy policy URL is already set:

https://github.com/raha4rental/Ahmed/blob/main/store/PRIVACY.md

## Build / البناء

You must also choose a build. App Store Connect currently has **0** iPhone builds. After Codemagic finishes **Ahmed iOS — App Store**, wait until the build is **Processed**, then:

1. Version **1.0.1** → Build → select the new IPA
2. Add for Review
