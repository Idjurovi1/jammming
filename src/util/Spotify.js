// Spotify.js — sva komunikacija sa Spotify Web API-jem.
// Autentikacija: Authorization Code + PKCE (Implicit Grant Spotify je ugasio 2025.).
//
// ⚠️ IVAN: upiši svoj Client ID iz https://developer.spotify.com/dashboard
//    i u postavkama aplikacije dodaj Redirect URI (npr. http://127.0.0.1:5173/ i URL deploya).
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'IVAN_SPOTIFY_CLIENT_ID';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + '/';
const SCOPES = 'playlist-modify-public playlist-modify-private';
const API = 'https://api.spotify.com/v1';

let accessToken = null;
let expiresAt = 0;

// ---------- PKCE pomoćne funkcije ----------
function randomString(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256Base64Url(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function redirectToSpotifyLogin() {
  const verifier = randomString();
  sessionStorage.setItem('spotify_code_verifier', verifier);
  const challenge = await sha256Base64Url(verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('spotify_code_verifier');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw new Error('Spotify token request failed');
  const json = await response.json();
  accessToken = json.access_token;
  expiresAt = Date.now() + json.expires_in * 1000;
  sessionStorage.setItem('spotify_token', JSON.stringify({ accessToken, expiresAt }));
  // makni ?code= iz adresne trake
  window.history.replaceState({}, document.title, REDIRECT_URI);
}

// ---------- Javni API modula ----------
const Spotify = {
  // Vraća važeći token; ako ga nema, preusmjeri na Spotify login.
  async getAccessToken() {
    if (accessToken && Date.now() < expiresAt) return accessToken;

    const saved = JSON.parse(sessionStorage.getItem('spotify_token') || 'null');
    if (saved && Date.now() < saved.expiresAt) {
      ({ accessToken, expiresAt } = saved);
      return accessToken;
    }

    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      await exchangeCodeForToken(code);
      return accessToken;
    }

    await redirectToSpotifyLogin();
    return null;
  },

  // Zadatak: Spotify search request (/v1/search?type=track)
  async search(term) {
    if (!term.trim()) return [];
    const token = await Spotify.getAccessToken();
    if (!token) return [];
    const response = await fetch(
      `${API}/search?type=track&limit=20&q=${encodeURIComponent(term)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Spotify search failed');
    const json = await response.json();
    if (!json.tracks) return [];
    return json.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      uri: track.uri,
      preview: track.preview_url,
    }));
  },

  // Zadatak: spremi playlistu u korisnikov račun
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;
    const token = await Spotify.getAccessToken();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1) ID trenutnog korisnika
    const me = await fetch(`${API}/me`, { headers }).then((r) => r.json());
    // 2) nova playlista
    const playlist = await fetch(`${API}/users/${me.id}/playlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, description: 'Napravljeno u Jammmingu', public: false }),
    }).then((r) => r.json());
    // 3) dodaj pjesme (po URI-ju)
    await fetch(`${API}/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uris: trackUris }),
    });
    return playlist.id;
  },
};

export default Spotify;
