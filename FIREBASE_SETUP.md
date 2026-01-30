# Firebase Setup (Email/Password + Firestore Realtime)

## 1) Create Firebase project
- Firebase Console → Create Project
- Build → Authentication → Sign-in method → Enable **Email/Password**
- Build → Firestore Database → Create Database

## 2) Add a Web App + copy config
Project Settings → General → Your apps → Web app → copy the config values.

Put them in **.env** (project root):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Restart dev server after editing `.env`.

## 3) Firestore Collections used
This app uses:

- `users/{uid}`  
  `{ name, email, location, isAdmin }`

- `network_reports/{autoId}`  
  `{ userId, userName, userEmail, provider, signalStrength, networkType, issueType, location, weather, comments, timestamp }`

- `speed_tests/{autoId}`  
  `{ reportId, userId, downloadSpeed, uploadSpeed, ping, timestamp }`

## 4) Recommended Firestore rules (dev-friendly)
**Firestore → Rules** (temporary for development):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5) Admin access
To make a user admin:
Firestore → `users` → open user doc → set `isAdmin: true`

Then use **Admin Login** screen.
