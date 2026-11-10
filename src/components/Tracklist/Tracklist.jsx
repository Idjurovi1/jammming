import styles from './Tracklist.module.css';
import Track from '../Track/Track';

function Tracklist({ tracks, onAdd, onRemove, isRemoval }) {
  if (!tracks.length) {
    return <p className={styles.empty}>{isRemoval ? 'Dodaj pjesme iz rezultata.' : 'Nema rezultata.'}</p>;
  }
  return (
    <div className={styles.tracklist}>
      {tracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAdd}
          onRemove={onRemove}
          isRemoval={isRemoval}
        />
      ))}
    </div>
  );
}

export default Tracklist;
