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

## Native app (iPhone first)

iOS is the primary app. Android is secondary.

```bash
npm run build:native
npx cap open ios
```

Then in Xcode: select your iPhone or a simulator → Run.

The iPhone build:

- Uses the on-device store (no server)
- Asks for camera + photo library for apartment photos, guest ID, and cleaning photos
- Fills the screen under the notch / Dynamic Island
- Is portrait-only

Codemagic still needs your App Store Connect key named **Ahmed** and the App Store certificate + profile for `com.ahmed.app`. After that, every push to `main` builds TestFlight.

See `store/github-codemagic.md` and `store/app-store-connect.md`.

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
