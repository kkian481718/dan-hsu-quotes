# Dan Hsu Quotes - AI Coding Instructions

## Project Overview

A vanilla JavaScript quote submission app using Firebase Realtime Database for real-time data sync. Deployed on GitHub Pages with no build step or backend server required.

**Live site:** https://kkian481718.github.io/dan-hsu-quotes/

## Architecture

### Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no frameworks or bundlers)
- **Database:** Firebase Realtime Database with real-time listeners
- **Hosting:** GitHub Pages (static files only)
- **Key Libraries:** Firebase SDK v10.7.1 (compat mode loaded via CDN)

### File Structure & Responsibilities

```
js/
  firebase-config.js    # Firebase initialization, exports `quotesRef`
  app.js                # Main UI logic, event handlers, Firebase operations
css/style.css           # CSS variables for theming, no preprocessor
index.html              # Single-page app, loads Firebase SDK from CDN
```

### Data Flow Pattern

1. User submits quote → `app.js:submitQuoteToFirebase()` → Firebase push
2. Firebase triggers `quotesRef.on('value')` listener → auto-updates UI
3. No manual refresh needed - real-time sync via Firebase observers

**Critical:** Always use `quotesRef.on('value')` for data loading. Never use `.once()` as real-time updates are essential.

## Firebase Integration

### Configuration

- Firebase config is **intentionally public** in `js/firebase-config.js` (security via Firebase Rules, not hidden keys)
- Uses `firebase-database-compat.js` for compatibility API (not modular SDK)
- Database reference pattern: `firebase.database().ref('quotes')`

### Security Model

Firebase Rules enforce:

- Public read access (`.read: true`)
- Public write access with validation (`.write: true` + field constraints)
- Max quote length: 500 chars, author: 100 chars
- Required fields: `quote`, `author`, `timestamp`, `createdAt`

See `FIREBASE_SETUP.md` for complete rule definitions.

### Common Operations

```javascript
// Submit new quote (from app.js)
quotesRef.push({
  quote: "...",
  author: "...",
  timestamp: firebase.database.ServerValue.TIMESTAMP,
  createdAt: new Date().toISOString(),
});

// Real-time listener (already set up in loadAllQuotes())
quotesRef.orderByChild("timestamp").on("value", (snapshot) => {
  // Process and display quotes
});
```

## Development Patterns

### Code Style

- **Naming:** camelCase for variables, verb-first for functions (`loadQuotes`, `handleSubmit`)
- **Indentation:** 2 spaces (enforced in existing code)
- **Comments:** Minimal, function-level only (e.g., `// 表單提交處理`)

### Theme System

Uses CSS variables in `:root` for light mode, `.dark-mode` class overrides for dark theme:

```css
:root {
  --bg-primary: #f7fafc;
}
body.dark-mode {
  --bg-primary: #1a202c;
}
```

Theme state persisted in `localStorage.getItem('theme')`.

### UI Patterns

- **Loading states:** Toggle `display` on `#loadingState` / `#emptyState` / `#quotesList`
- **Animations:** Use CSS animations (`fadeIn`, `slideDown`, `slideInLeft`) with `animationDelay` for staggered effects
- **Toasts:** `showToast(icon, message, type)` for notifications - auto-dismiss after 3s
- **Input validation:** Client-side only (Firebase Rules provide server-side validation)

### Event Handling

All event listeners initialized in `setupEventListeners()` called on `DOMContentLoaded`. Use `addEventListener` for dynamic behavior (theme toggle, form submit, filter buttons).

## Testing & Debugging

### Local Development

```bash
# Start local server (no build step)
python -m http.server 8000
# OR
npx http-server -p 8000
```

Open `http://localhost:8000` in browser.

### Common Issues

- **"Firebase not defined":** Check CDN script loads before `firebase-config.js`
- **No real-time updates:** Verify `quotesRef.on('value')` is active, not `.once()`
- **Quotes not submitting:** Check browser console for Firebase errors, verify Rules in Firebase Console

### Firebase Console Checks

- Database location: `asia-southeast1`
- Rules tab: Validate `.read` and `.write` rules match `FIREBASE_SETUP.md`
- Data tab: View/manually edit quotes for testing

## Deployment

### GitHub Pages Setup

1. Push changes to `main` branch
2. GitHub Pages serves from root directory automatically
3. No build process - HTML/CSS/JS served as-is

**Important:** Firebase config is committed (by design). Never add Firebase Admin SDK or sensitive credentials.

## Constraints & Conventions

- **No npm/build tools:** All dependencies via CDN (keep this pattern)
- **No JSX/templates:** Use `innerHTML` for dynamic content (see `displayQuotes()`)
- **Chinese UI text:** All user-facing strings in Traditional Chinese
- **Mobile-first CSS:** Media queries at 768px and 480px breakpoints
- **Progressive enhancement:** Works without JS for static content

## Key Files to Reference

- `README.md`: User documentation, Firebase rationale (why not GitHub Issues)
- `FIREBASE_SETUP.md`: Complete Firebase configuration guide with security explanations
- `app.js:loadAllQuotes()`: Real-time listener pattern example
- `style.css:root`: Theme variable system

## Migration Notes

This project **migrated from GitHub Issues API to Firebase** for:

- Real-time updates (no page refresh)
- Simpler deployment (no Netlify Functions needed)
- Faster response times

When adding features, maintain the "no backend" philosophy - use Firebase client SDK only, never require server-side code.
