# Firebase Setup — HoldingOS

Follow these steps once. You only need the **config values** (step 4) to hand
back to me — I'll wire the rest into the app.

## 1. Create the project
1. Go to https://console.firebase.google.com → **Add project**.
2. Name it (e.g. `holdingos`). Google Analytics: optional (can turn off).

## 2. Enable Authentication (free, no card)
1. Left menu → **Build → Authentication → Get started**.
2. Tab **Sign-in method → Email/Password → Enable → Save**.
3. Tab **Users → Add user** — create your first login (email + password).

## 3. Create Firestore (free tier)
1. **Build → Firestore Database → Create database**.
2. Start in **Production mode** (we ship proper rules), pick a region close to
   you (e.g. `asia-southeast2` = Jakarta). Create.

## 4. Register a Web App + copy config  ← the part I need
1. Project **Settings** (gear icon, top-left) → **General**.
2. Scroll to **Your apps** → click the **`</>` (Web)** icon → give it a
   nickname → **Register app**.
3. You'll see a `firebaseConfig = { apiKey: "...", authDomain: "...", ... }`.
   **Copy that whole object and paste it back to me** (or into
   `src/firebaseConfig.ts`). These values are safe to share/commit for a web
   app — security is enforced by the rules below.

## 5. Enable Cloud Storage
> Note: for projects created after Oct 2024, Storage requires the **Blaze**
> (pay-as-you-go) plan — a credit card is needed, but there's a free monthly
> allotment (5 GB stored, 1 GB/day download). **Set a budget alert** so it
> stays ~$0.
1. **Build → Storage → Get started** → follow prompts (it will ask to upgrade
   to Blaze if required).
2. **(Recommended) Set a spending cap:** Firebase Console → ⚙️ → **Usage and
   billing → Budgets & alerts** → set a small monthly budget (e.g. $1) with
   email alerts.

## 6. Rules (I'll deploy these; here for reference)
- `firestore.rules` and `storage.rules` are in the repo root.
- You can paste them in Console → Firestore/Storage → **Rules** tab → Publish,
  or I can guide you through `firebase deploy --only firestore:rules,storage`.

## What happens next
Once you paste the config from step 4, I will:
- Add the Firebase SDK and initialize it.
- Replace the demo login with real Email/Password auth (gate the app).
- Migrate data from browser localStorage → Firestore.
- Upload documents to Cloud Storage (instead of base64 in the browser).
- Keep a **local mode** fallback so the app still runs if Firebase is absent.
