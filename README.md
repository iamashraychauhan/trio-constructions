# Site Ledger (shared, with login)

Same app as before, but all three partners sign in and see the same live data.

## One-time setup (about 15 minutes, free plan is enough)

1. Go to https://console.firebase.google.com and click **Add project**.
2. In the project, click the **</>** (Web) icon, register an app, and copy the `firebaseConfig` values.
3. Open `index.html`, find `const cfg={...}` near the bottom, and paste your values.
4. **Build → Authentication → Get started → Email/Password → Enable.**
5. **Authentication → Users → Add user**: create one user for each of the three partners (email and password). Do not add a sign-up page. Creating them yourself stops outsiders from claiming these emails.
6. **Build → Firestore Database → Create database** (production mode, pick a nearby region such as Mumbai).
7. **Firestore → Rules**: paste `firestore.rules`, replace the three example emails with the real ones, and click **Publish**.

## Run and share

- Test: open the folder in VS Code and use Live Server, then sign in.
- Put it online: **Firebase Hosting** (`npm i -g firebase-tools`, `firebase init hosting`, `firebase deploy`) or drag the folder into Netlify.
- If you use Netlify or another host, add its domain in **Authentication → Settings → Authorized domains**.
- On each phone, open the link and choose **Add to Home screen**.

## Notes

- Changes show up on everyone's screen within a second or two.
- Data lives in Firestore. If two people edit the same item at once, the last save wins.
- Photos are stored inside the daily log, so keep them to 3 per log.
