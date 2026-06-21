// Minimal Microsoft Graph OneDrive helper using OAuth2 PKCE for SPA
// Requires VITE_ONEDRIVE_CLIENT_ID to be set in the Vite env.

import { tick } from 'svelte';

const CLIENT_ID = (import.meta as any).env?.VITE_ONEDRIVE_CLIENT_ID || '';
const AUTH_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const SCOPES = ['Files.ReadWrite', 'offline_access', 'User.Read'].join(' ');

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(hash);
}

function randomString(len = 64) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => ('00' + b.toString(16)).slice(-2)).join('');
}

const TOKEN_STORAGE_KEY = 'topmaker_onedrive_tokens';

export type TokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number; // epoch ms
};

export function loadTokens(): TokenSet | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveTokens(tokens: TokenSet) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {}
}

export function clearTokens() {
  try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch (e) {}
}

async function exchangeCodeForToken(code: string, code_verifier: string, redirect_uri: string) {
  const params = new URLSearchParams();
  params.set('client_id', CLIENT_ID);
  params.set('grant_type', 'authorization_code');
  params.set('code', code);
  params.set('redirect_uri', redirect_uri);
  params.set('code_verifier', code_verifier);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!res.ok) throw new Error('token-exchange-failed');
  const json = await res.json();
  const now = Date.now();
  const expires_at = now + (json.expires_in ? json.expires_in * 1000 : 3600 * 1000);
  const toks: TokenSet = { access_token: json.access_token, refresh_token: json.refresh_token, expires_at };
  saveTokens(toks);
  return toks;
}

async function refreshToken(refresh_token: string) {
  const params = new URLSearchParams();
  params.set('client_id', CLIENT_ID);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refresh_token);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!res.ok) throw new Error('token-refresh-failed');
  const json = await res.json();
  const now = Date.now();
  const expires_at = now + (json.expires_in ? json.expires_in * 1000 : 3600 * 1000);
  const toks: TokenSet = { access_token: json.access_token, refresh_token: json.refresh_token || refresh_token, expires_at };
  saveTokens(toks);
  return toks;
}

export async function ensureAuthenticatedInteractive() {
  if (!CLIENT_ID) throw new Error('missing-onedrive-client-id');
  // PKCE
  const code_verifier = randomString(64);
  const code_challenge = await sha256(code_verifier);
  const redirect = `${location.origin}/onedrive-callback`;
  const state = randomString(8);
  sessionStorage.setItem('onedrive_code_verifier', code_verifier);
  sessionStorage.setItem('onedrive_state', state);

  const authUrl = `${AUTH_ENDPOINT}?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&response_mode=query&scope=${encodeURIComponent(SCOPES)}&code_challenge=${encodeURIComponent(code_challenge)}&code_challenge_method=S256&state=${encodeURIComponent(state)}`;

  // Open popup and wait for message
  return new Promise<TokenSet>((resolve, reject) => {
    const w = window.open(authUrl, 'onedrive_auth', 'width=600,height=700');
    if (!w) return reject(new Error('popup-blocked'));

    const onMessage = async (e: MessageEvent) => {
      if (!e.data || e.data.type !== 'onedrive_code') return;
      const { code, state: returned } = e.data;
      window.removeEventListener('message', onMessage);
      try {
        const expected = sessionStorage.getItem('onedrive_state');
        const verifier = sessionStorage.getItem('onedrive_code_verifier') || '';
        if (returned !== expected) throw new Error('state-mismatch');
        const toks = await exchangeCodeForToken(code, verifier, redirect);
        resolve(toks);
      } catch (err) {
        reject(err);
      } finally {
        try { w.close(); } catch (e) {}
      }
    };

    window.addEventListener('message', onMessage);
  });
}

export async function getAccessToken(): Promise<string> {
  const tokens = loadTokens();
  if (!tokens) throw new Error('not-authenticated');
  if (tokens.expires_at && Date.now() > tokens.expires_at - 60000) {
    if (!tokens.refresh_token) throw new Error('no-refresh-token');
    const refreshed = await refreshToken(tokens.refresh_token);
    return refreshed.access_token;
  }
  return tokens.access_token;
}

export async function uploadFileToOneDrive(path: string, content: string) {
  const access = await getAccessToken();
  // path should be like /Apps/TopMaker/filename.json or /top-maker.json
  const encoded = encodeURIComponent(path.replace(/^\//, ''));
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encoded}:/content`;
  const res = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }, body: content });
  if (!res.ok) throw new Error('onedrive-upload-failed');
  return await res.json();
}

export async function downloadFileFromOneDrive(path: string) {
  const access = await getAccessToken();
  const encoded = encodeURIComponent(path.replace(/^\//, ''));
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encoded}:/content`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
  if (!res.ok) throw new Error('onedrive-download-failed');
  return await res.text();
}

export default {
  ensureAuthenticatedInteractive,
  uploadFileToOneDrive,
  downloadFileFromOneDrive,
  loadTokens,
  saveTokens,
  clearTokens
};
