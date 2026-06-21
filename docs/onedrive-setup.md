# OneDrive / Microsoft Graph Setup

This document explains how to register an Azure app and configure the environment so Top Maker can save and load snapshots to a user's OneDrive account using Microsoft Graph and the OAuth2 Authorization Code + PKCE flow.

Overview
- We use the OAuth2 Authorization Code flow with PKCE from the browser. The app opens a popup to Microsoft sign-in, exchanges the code for tokens, and stores them in localStorage. The code in src/lib/storage/onedrive.ts expects a redirect to `${location.origin}/onedrive-callback` which will post the authorization code back to the opener window.

High-level steps
1. Create an App Registration in Azure AD
2. Configure Authentication (redirect URI)
3. Add API permissions
4. Add client id to your environment
5. Test save/load from the app

1) Create an App Registration
- Sign in to the Azure Portal: https://portal.azure.com
- Navigate to "Azure Active Directory" → "App registrations" → "New registration".
- Give it a descriptive name: e.g., "Top Maker OneDrive".
- Supported account types: choose what fits your users (single tenant or multitenant). For local testing "Accounts in this organizational directory only" is fine.
- Click Register and copy the "Application (client) ID" — this becomes VITE_ONEDRIVE_CLIENT_ID.

2) Configure Redirect URI
- Go to the registered app → Authentication.
- Under "Platform configurations" click "Add a platform" → choose "Single-page application (SPA)".
- Add the redirect URI: `https://your-domain/onedrive-callback` (replace with your site). For local development add `http://localhost:4173/onedrive-callback` (or whatever port you run Vite on).
- Save the config.

3) Add API Permissions
- In the app registration, go to "API permissions" → "Add a permission" → Microsoft Graph → Delegated permissions.
- Add the following delegated permissions:
  - Files.ReadWrite
  - offline_access
  - User.Read
- Click "Add permissions". If you are an administrator in the tenant you can click "Grant admin consent" to avoid individual consent prompts.

4) Configure your app (local dev)
- Create a `.env.local` (or set env vars in your Vite environment) with:

  VITE_ONEDRIVE_CLIENT_ID=your-client-id-here
  # Optional: override the preview dev port if running on a different port
  VITE_PREVIEW_PORT=4173

- Restart the dev server after changing env vars.

5) Test the flow in the app
- The app uses an interactive popup to authenticate. In the browser go to your running app (e.g., `http://localhost:4173`).
- Use the new Actions menu items (if present) or call the helper `window.__topmaker_saveOneDrive()` in the console to trigger save. The popup will open, you will sign in and consent, then the popup will close and the app will have tokens stored.
- If you need to inspect tokens they are stored in localStorage under the key `topmaker_onedrive_tokens`.

Implementation notes
- Redirect URL: the app implements a small route at `/onedrive-callback` that posts the code back to the opener window and closes the popup.
- Scopes: Files.ReadWrite is used to create or overwrite a file in the user's drive root (or inside a path). `offline_access` is requested so the app can obtain a refresh token.
- Security: Do not commit your client secret to the repo. This flow uses public client (PKCE) and does not require a client secret for the browser-based flow.

Troubleshooting
- Popup blocked: Ensure your browser allows popups from localhost during testing.
- Consent fails: If the tenant blocks consent, an admin must grant consent in the app registration.
- CORS/Network: The token exchange uses the Azure token endpoint (server-to-server). The browser-based token exchange is allowed for PKCE flows.

If you'd like I can also:
- Add UI buttons to the Actions menu for Save/Load OneDrive.
- Add server-side support for refresh tokens (if you prefer more secure long-term refresh handling).
