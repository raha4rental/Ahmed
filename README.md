# أحمد — تطبيق إدارة وتشغيل الشقق

تطبيق جوال (PWA) باسم **أحمد**.

- **أحمد السعدي** — إدارة كاملة (Super Admin)
- **ريان** — تشغيل يومي (Operations)

This is the **Ahmed** mobile app: Ahmed Al-Saadi manages everything; Rayan runs daily operations.

## Open / التشغيل

```bash
npm install
npm run dev
```

يفتح على `http://127.0.0.1:4721` داخل إطار جوال. على الهاتف الحقيقي: افتح الرابط ثم **Add to Home Screen**.

Opens as a phone app on `http://127.0.0.1:4721`. On a real phone, add it to the home screen.

رمز الدخول / PIN: `1234`

| الحساب | الدور |
| --- | --- |
| أحمد السعدي | إدارة — أسعار، مالية، صلاحيات، حذف |
| ريان | تشغيل — دخول/خروج، تنظيف، فحص. بدون أسعار أو حسابات حساسة |

## الدورة

حجز → دخول → مشغولة → خروج → فحص → تنظيف → صيانة إن لزم → READY
