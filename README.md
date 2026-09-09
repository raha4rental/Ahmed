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

## Native app (iPhone only)

The native app is **iPhone only** — not iPad, not Android, not Mac.

```bash
npm run build:native
npx cap open ios
```

Then in Xcode: select an iPhone or iPhone simulator → Run.

The iPhone build:

- Uses the on-device store (no server). Data stays after you close the app and open it later.
- Removed only if you delete the app from the iPhone
- Asks for camera + photo library for apartment photos, guest ID, and cleaning photos
- Fills the screen under the notch / Dynamic Island
- Is portrait-only
- Device family: iPhone (`TARGETED_DEVICE_FAMILY = 1`)

Bundle ID `com.darraha.ahmed`. App Store record **السعدي** (Apple ID `6810042737`). Codemagic uses App Store Connect key **`8LM6C7D787`**. Details: `store/github-codemagic.md`

Every push to `main` runs **Ahmed iOS — App Store** and uploads the IPA to App Store Connect / TestFlight.

## GitHub + Codemagic

Repo: `https://github.com/raha4rental/Ahmed`

1. Codemagic app **Ahmed** is linked to Apple with key **`8LM6C7D787`** in `codemagic.yaml` (no website integration required)
2. Workflow in `codemagic.yaml`:
   - **Ahmed iOS — App Store** → iPhone IPA uploaded to App Store Connect / TestFlight (on push to `main`)
3. Full Codemagic info: `store/codemagic.json` and `store/github-codemagic.md`

## Database

SQLite at `prisma/raha.db`. The web preview uses `/api/state`. The iPhone build uses the on-device store (no server required).
