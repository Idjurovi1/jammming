import { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // bez osvježavanja stranice
    onSearch(term);
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <input
        aria-label="Search"
        placeholder="Enter a song, album, or artist"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button type="submit" className={styles.button}>SEARCH</button>
    </form>
  );
}

export default SearchBar;
