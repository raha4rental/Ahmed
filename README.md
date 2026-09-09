# Ahmed

تطبيق جوال داخلي لإدارة وتشغيل الشقق — ليس موقعًا.

**App name:** Ahmed  
**Ahmed Al-Saadi** — Super Admin / Management  
**Ryan** — Operations

Private staff app. No guest login. No customer booking.

Bundle ID: `com.ahmed.app`

## Run (phone preview)

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://127.0.0.1:4721`.

## Native app (iOS / Android)

```bash
npm run build:native
npx cap open ios
npx cap open android
```

## GitHub + Codemagic

This agent cannot sign in to GitHub or Codemagic. Publish steps: `store/github-codemagic.md`

1. Click **Create repo** in Cursor and name it **Ahmed** — or create `https://github.com/raha4rental/Ahmed`
2. Sign in to [Codemagic](https://codemagic.io) with that GitHub account and add the **Ahmed** app
3. Workflows in `codemagic.yaml`:
   - **Ahmed iOS — App Store** → TestFlight
   - **Ahmed Android** → APK
4. App Store Connect: `store/app-store-connect.md`

## Database

SQLite at `prisma/raha.db`. The web preview uses `/api/state`. The iOS/Android build uses the on-device store (no server required).
