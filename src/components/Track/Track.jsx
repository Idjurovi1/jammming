import styles from './Track.module.css';

function Track({ track, onAdd, onRemove, isRemoval }) {
  // Presentational komponenta: samo prikaz + poziv funkcije koju je dao roditelj
  const handleClick = () => (isRemoval ? onRemove(track) : onAdd(track));

  return (
    <div className={styles.track}>
      <div className={styles.info}>
        <h3>{track.name}</h3>
        <p>{track.artist} | {track.album}</p>
      </div>
      <button
        className={styles.action}
        onClick={handleClick}
        aria-label={isRemoval ? `Remove ${track.name}` : `Add ${track.name}`}
      >
        {isRemoval ? '-' : '+'}
      </button>
    </div>
  );
}

export default Track;
