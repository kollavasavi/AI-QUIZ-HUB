# AI Quiz Hub

## Environment Setup

Create a `.env` file in the project root with:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Important notes:
- Vite only exposes vars prefixed with `VITE_` to frontend code.
- After changing `.env`, restart the dev server.
- Enable the Google Generative Language API for the project that owns `VITE_GEMINI_API_KEY`.
- If your API key has restrictions, allow requests from `http://localhost:5173` while developing.

## Firebase Leaderboard Check

If scores are not appearing in the cloud database, verify these in Firebase Console:

1. Realtime Database is enabled for the same Firebase project as the `.env` values.
2. The database URL matches `VITE_FIREBASE_DATABASE_URL` exactly.
3. Authentication is enabled for the sign-in methods you use.
4. Realtime Database rules allow authenticated writes to `/scores`.

Recommended development rules:

```json
{
	"rules": {
		"scores": {
			".read": true,
			".write": "auth != null"
		}
	}
}
```

If you want a public leaderboard where anyone can submit scores without signing in, use this instead during development:

```json
{
	"rules": {
		"scores": {
			".read": true,
			".write": true
		}
	}
}
```

If the app requires login before playing, keep the stricter `auth != null` version. That matches the current app flow better and is safer.

If you want to test quickly during development, you can temporarily use looser rules for `/scores`, then tighten them again before production.

When the database rejects a score write, the app now keeps a local fallback copy and merges it into Rankings so the UI still works while you fix Firebase.

## Run

```bash
npm install
npm run dev
```
