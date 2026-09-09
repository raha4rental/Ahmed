# Ahmed

تطبيق جوال داخلي لإدارة وتشغيل الشقق.

**App name:** Ahmed  
**Ahmed Al-Saadi** — Super Admin / Management  
**Ryan** — Operations

Private staff app. No guest login. No customer booking.

## Run

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://127.0.0.1:4721`. On a phone, Add to Home Screen.

## Database

SQLite at `prisma/raha.db` (created on first push). The app reads and writes the live snapshot through `/api/state`. Switch to Postgres later with `DATABASE_URL`.

## GitHub → Codemagic → App Store Connect

1. Create a GitHub repository named **Ahmed** and push this project.
2. In [Codemagic](https://codemagic.io) connect that GitHub repo. The workflow is `codemagic.yaml` (`Ahmed iOS — App Store`).
3. In [App Store Connect](https://appstoreconnect.apple.com) create the iOS app **Ahmed**, bundle ID `com.ahmed.app`. Steps: `store/app-store-connect.md`.
4. Add the App Store Connect API key to Codemagic, then run the iOS workflow to TestFlight.

Capacitor app id: `com.ahmed.app`.
