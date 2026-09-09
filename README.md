# Ahmed

تطبيق جوال داخلي لإدارة وتشغيل الشقق — ليس موقعًا.

**App name:** Ahmed  
**Ahmed Al-Saadi** — Super Admin / Management  
**Ryan** — Operations

Private staff app. No guest login. No customer booking.

Bundle ID: `com.darraha.ahmed`

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

Bundle ID `com.darraha.ahmed`. App Store record **السعدي** (Apple ID `6810042737`). Codemagic Developer Portal key **Ahmed** / `8LM6C7D787`. Details: `store/github-codemagic.md`

Every push to `main` runs **Ahmed iOS — App Store** → TestFlight → App Store review.

## GitHub + Codemagic

Repo: `https://github.com/raha4rental/Ahmed`

1. Codemagic app **Ahmed**, integration name **Ahmed**, Key ID **`8LM6C7D787`**
2. Workflows in `codemagic.yaml`:
   - **Ahmed iOS — App Store** → TestFlight + App Store (on push to `main`)
   - **Ahmed Android** → APK (manual)
3. Full Codemagic info: `store/codemagic.json` and `store/github-codemagic.md`

## Database

SQLite at `prisma/raha.db`. The web preview uses `/api/state`. The iOS/Android build uses the on-device store (no server required).
