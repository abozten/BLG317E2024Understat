import React, { useState } from 'react';
import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleBlur = () => {
    setIsSearchExpanded(false);
  };

  return (
    <div className={styles.topBar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for Players"
          className={`${styles.searchInput} ${isSearchExpanded ? styles.expanded : ''}`}
          onBlur={handleBlur}
          onFocus={handleSearchClick}
        />
        {!isSearchExpanded && (
          <button className={styles.searchIcon} onClick={handleSearchClick}>
            🔍
          </button>
        )}
      </div>
      <div className={styles.links}>
        <Link href="/team" className={styles.link}>Teams</Link>
        <Link href="/season" className={styles.link}>Season</Link>
        <Link href="/players" className={styles.link}>Players</Link>
        <Link href="/" className={styles.homeButton}>Home</Link> {/* Styled Home button */}
      </div>
    </div>
  );
}