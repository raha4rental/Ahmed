# ربط أحمد بـ App Store Connect / Connect Ahmed to App Store Connect

لا أستطيع الدخول إلى حساب آبل نيابة عنك. Apple لا تسمح بإنشاء التطبيق عبر الـ API. بعد الخطوات الثلاث أدناه، Codemagic يرفع البناء إلى TestFlight تلقائياً.

I cannot sign into your Apple account. Apple does not allow creating a new app through the API. After the three steps below, Codemagic uploads every `main` push to TestFlight.

Bundle ID: `com.ahmed.app`  
App name: **Ahmed**  
SKU: `ahmed-property-ops`  
Codemagic integration name: **Ahmed** (must match exactly)  
Issuer ID (saved): `c46c0b74-7d00-42b2-9786-333b76dacf91`

Still needed: **Key ID** (10 characters) and the `.p8` private key in Codemagic. Do not commit the `.p8`.

---

## 1. مفتاح API في App Store Connect / Create the API key

1. Open [Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api)
2. Accept any pending agreements first: [Agreements](https://appstoreconnect.apple.com/agreements)
3. **+** → Name: `Ahmed` → Access: **App Manager** → Generate
4. Download the `.p8` file (once only)
5. Copy **Issuer ID** (top of the keys table) and **Key ID**

يجب أن يكون الحساب مشتركاً في [Apple Developer Program](https://developer.apple.com/programs/) (99 دولار سنوياً).

You need an active [Apple Developer Program](https://developer.apple.com/programs/) membership.

---

## 2. أنشئ التطبيق يدوياً / Create the app record (required)

Apple blocks `POST /v1/apps`. Do this once in the website:

1. [Identifiers](https://developer.apple.com/account/resources/identifiers/list) → **+** → App IDs → App  
   Description: `Ahmed`  
   Bundle ID: **Explicit** `com.ahmed.app` → Continue → Register  
   (Codemagic also tries to create this automatically.)
2. [App Store Connect → Apps → + → New App](https://appstoreconnect.apple.com/apps)
   - Platforms: **iOS**
   - Name: `Ahmed`
   - Primary language: **Arabic**
   - Bundle ID: `com.ahmed.app`
   - SKU: `ahmed-property-ops`
   - User Access: Full Access

---

## 3. الصق المفتاح في Codemagic / Paste the key in Codemagic

1. [codemagic.io](https://codemagic.io) → sign in with GitHub `raha4rental`
2. Apps → Add application → GitHub → **Ahmed** (`raha4rental/Ahmed`)
3. Teams → Team integrations → **Developer Portal** → Connect
   - App Store Connect API key name: **Ahmed**
   - Issuer ID and Key ID from step 1
   - Upload the `.p8` file → Save
4. Start workflow **Ahmed iOS — App Store**

After that, every push to `main` registers the bundle ID if needed, signs the IPA, and uploads it to TestFlight (internal testers only — no public App Store review).

بعدها كل دفع على `main` يرفع البناء إلى TestFlight للمختبرين الداخليين.

Add Ahmed Al-Saadi and Ryan under App Store Connect → Ahmed → TestFlight → Internal Testing.

---

## Listing copy (when you later submit to the store)

**Subtitle:** إدارة وتشغيل الشقق

**Description:**  
تطبيق أحمد الداخلي لإدارة وتشغيل الشقق. أحمد السعدي — إدارة كاملة. رايان — تشغيل يومي.

Ahmed is a private internal property management and operations app. Ahmed Al-Saadi has full management access. Ryan handles daily operations.
