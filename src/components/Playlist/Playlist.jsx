import styles from './Playlist.module.css';
import Tracklist from '../Tracklist/Tracklist';

function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave, isSaving }) {
  return (
    <section className={styles.panel}>
      {/* Klik na naslov → upiši novo ime playliste */}
      <input
        className={styles.name}
        aria-label="Playlist name"
        value={playlistName}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <Tracklist tracks={playlistTracks} onRemove={onRemove} isRemoval={true} />
      <button
        className={styles.save}
        onClick={onSave}
        disabled={isSaving || playlistTracks.length === 0}
      >
        {isSaving ? 'SAVING…' : 'SAVE TO SPOTIFY'}
      </button>
    </section>
  );
}

export default Playlist;
