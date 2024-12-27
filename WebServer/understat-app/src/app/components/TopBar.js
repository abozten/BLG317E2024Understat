import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './TopBar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

export default function TopBar() {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
     const searchResultsRef = useRef(null);
    const searchTimeout = useRef(null);

    const handleSearchClick = () => {
        setIsSearchExpanded(true);
         if(searchTerm.length >= 3)
            setShowResults(true);
    };

    const handleBlur = () => {
        setIsSearchExpanded(false);
        setShowResults(false); // Hide results when input loses focus
    };

    const handleSearchChange = (event) => {
      const value = event.target.value;
        setSearchTerm(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
      
          searchTimeout.current = setTimeout(() => {
            if (value.length >= 3) {
               fetchPlayers(value);
               setShowResults(true);
            } else {
               setSearchResults([]);
               setShowResults(false);
            }
           }, 300);
     
    };

    const fetchPlayers = async (search) => {
          try {
            const response = await fetch(
                `https://localhost:5001/players?search=${search}&limit=10`
              );
             if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
             const data = await response.json();
             setSearchResults(data);
            } catch (error) {
              console.error("Error fetching players:", error);
             setSearchResults([]);
        }
    };
     useEffect(() => {
       const handleClickOutside = (event) => {
            if (
              searchResultsRef.current &&
              !searchResultsRef.current.contains(event.target) &&
              !event.target.classList.contains(styles.searchInput) &&
                !event.target.classList.contains(styles.searchIcon)
            ) {
                setShowResults(false);
                setIsSearchExpanded(false);
            }
        };
       document.addEventListener('mousedown', handleClickOutside);
           return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
    <div className={styles.topBar}>
      <div className={styles.searchContainer}>
        <Link href="/" className={styles.homeIcon}>
          <FontAwesomeIcon icon={faHome} />
        </Link>
        <input
            type="text"
            placeholder="Search for Players"
            className={`${styles.searchInput} ${isSearchExpanded ? styles.expanded : ''}`}
            onBlur={handleBlur}
            onFocus={handleSearchClick}
            onChange={handleSearchChange}
            value={searchTerm}
        />
        {!isSearchExpanded && (
          <button className={styles.searchIcon} onClick={handleSearchClick}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        )}
         {showResults && (
            <div className={`${styles.searchResults} ${showResults ? styles.slideDown : styles.slideUp}`} ref={searchResultsRef}>
            {searchResults.length > 0 ? (
                searchResults.map((player) => (
                     <Link href={`/players/${player.player_id}`}  key={player.player_id} className={styles.searchItem}>
                          {player.player_name} ({player.team_title})
                     </Link>
                  ))
              ) : (
                  <p className={styles.noResults}>No players found</p>
              )}
           </div>
        )}
      </div>
      <div className={styles.links}>
        <Link href="/team" className={styles.link}>Teams</Link>
        <Link href="/season" className={styles.link}>Season</Link>
        <Link href="/players" className={styles.link}>Players</Link>
        <Link href="/login" className={styles.link}>Login</Link>
      </div>
    </div>
  );
}