# Jammming

A React web app that lets you search the Spotify library, build a custom playlist, and save it straight to your Spotify account.

Built as the Jammming portfolio project in Codecademy's Front-End Engineer career path.

## Purpose

Practice building a modular React application around a real third-party API: unidirectional data flow, lifting state up, controlled inputs, and OAuth authentication with Spotify.

## Technologies

- React 19 (function components and hooks: `useState`, `useEffect`, `useCallback`)
- Vite (dev server and build)
- CSS Modules (component-scoped styles)
- Spotify Web API (search, user profile, playlists)
- OAuth 2.0 Authorization Code flow with PKCE (no client secret in the browser)
- Vitest and React Testing Library (component tests with a mocked Spotify module)

## Features

- Search for songs by title, artist, or album
- See each track's name, artist, and album
- Add tracks to a custom playlist with **+**. Tracks already in the playlist are hidden from the results.
- Remove tracks with **−**
- Rename the playlist by clicking its title
- **Save to Spotify** creates a private playlist in your account with the selected tracks, then resets the app

## Component tree

```
App                (all state: searchResults, playlistName, playlistTracks)
├── SearchBar      (controlled input, onSearch)
├── SearchResults
│   └── Tracklist
│       └── Track  (+ add)
└── Playlist       (editable name, Save to Spotify)
    └── Tracklist
        └── Track  (− remove)
```

`src/util/Spotify.js` holds all API logic: getting and storing the access token, `search`, and `savePlaylist`.

## Getting started

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add the redirect URIs you will use, for example `http://127.0.0.1:5173/` and your deployed URL.
3. Create a `.env.local` file:

   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
   ```

4. Install, run, and test:

   ```bash
   npm install
   npm run dev      # http://127.0.0.1:5173
   npm test         # Vitest
   npm run build    # production build in dist/
   ```

## Future work

- Search by genre, and filter results
- 30-second track previews
- Load and edit the user's existing playlists
- Keep the search term across the Spotify login redirect
- Loading spinners and better error messages
