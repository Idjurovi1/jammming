import styles from './SearchResults.module.css';
import Tracklist from '../Tracklist/Tracklist';

function SearchResults({ searchResults, onAdd }) {
  return (
    <section className={styles.panel}>
      <h2>Results</h2>
      <Tracklist tracks={searchResults} onAdd={onAdd} isRemoval={false} />
    </section>
  );
}

export default SearchResults;
