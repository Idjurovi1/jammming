import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './util/Spotify';

function App() {
  // Root komponenta drži sav state (unidirectional data flow → djeca dobivaju props)
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Nakon povratka sa Spotify logina (?code=...) odmah zamijeni code za token
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('code')) {
      Spotify.getAccessToken();
    }
  }, []);

  const addTrack = useCallback((track) => {
    setPlaylistTracks((prev) =>
      prev.some((saved) => saved.id === track.id) ? prev : [...prev, track]
    );
  }, []);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prev) => prev.filter((saved) => saved.id !== track.id));
  }, []);

  const updatePlaylistName = useCallback((name) => setPlaylistName(name), []);

  const search = useCallback(async (term) => {
    try {
      setMessage('');
      const results = await Spotify.search(term);
      setSearchResults(results);
    } catch {
      setMessage('Pretraga nije uspjela. Pokušaj ponovno.');
    }
  }, []);

  const savePlaylist = async () => {
    const trackUris = playlistTracks.map((track) => track.uri);
    if (!trackUris.length) return;
    setIsSaving(true);
    try {
      await Spotify.savePlaylist(playlistName, trackUris);
      setMessage(`Playlista "${playlistName}" je spremljena na Spotify!`);
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
    } catch {
      setMessage('Spremanje nije uspjelo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Pjesme koje su već u playlisti ne prikazujemo u rezultatima
  const visibleResults = searchResults.filter(
    (track) => !playlistTracks.some((saved) => saved.id === track.id)
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.logo}>
        Ja<span className={styles.highlight}>mmm</span>ing
      </h1>
      <div className={styles.app}>
        <SearchBar onSearch={search} />
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.columns}>
          <SearchResults searchResults={visibleResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
