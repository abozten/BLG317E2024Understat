'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './Players.module.css';
import FilterModal from '../components/FilterModal';
import TopBar from '../components/TopBar';
import Link from 'next/link';

const PlayersPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [allTeamOptions, setAllTeamOptions] = useState([]);
     const [loadingMore, setLoadingMore] = useState(false); //Added loadingMore state


    const playerListRef = useRef(null)
    const PLAYERS_PER_PAGE = 20;

    const columns = ['player_name', 'games', 'time', 'goals', 'xG', 'assists', 'xA', 'shots', 'key_passes', 'yellow_cards', 'red_cards', 'position', 'team_title', 'npg', 'npxG', 'xGChain', 'xGBuildup', 'year'];
   const [scrollTimeout, setScrollTimeout] = useState(null);


    useEffect(() => {
         fetchPlayers(1, filters)
    }, []);


      const handleScroll = () => {
        if (!playerListRef.current) return;
           if (scrollTimeout) clearTimeout(scrollTimeout);
        setScrollTimeout(
            setTimeout(() => {
              const { scrollTop, clientHeight, scrollHeight } = playerListRef.current;
              if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                   setLoadingMore(true);
                   setPage(prev => prev + 1);
                   fetchPlayers(page + 1, filters);

              }
             }, 200)
        )
    };

    const fetchPlayers = async (pageNum = 1, filters = {}) => {
         setLoading(true);
       try {
          let url = `https://localhost:5001/players/search?page=${pageNum}&limit=${PLAYERS_PER_PAGE}`;

            for (const column of Object.keys(filters)){
               if(filters[column]?.min !== null)
                  url+= `&${column}_min=${filters[column].min}`
               if(filters[column]?.max !== null)
                  url+= `&${column}_max=${filters[column].max}`
              if(column === 'Team'){
                    if(filters[column]?.length > 0) {
                        url += `&team=${filters[column].join(',')}`
                     }
              }
          }
            const response = await fetch(url);
             if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }


            const data = await response.json();

           if(Array.isArray(data)){
              if (pageNum === 1) {
                  setPlayers(data);
                  setAllTeamOptions(data.map(team=> team.team_title))
              } else {
                  setPlayers(prev => [...prev, ...data]);

              }
                setHasMore(data.length === PLAYERS_PER_PAGE);
            }else {
                setPlayers([]);
                setHasMore(false);

            }
             setLoading(false);
              setLoadingMore(false);
          } catch (error) {
             console.error('Fetch error:', error);
            setError(error.message);
             setLoading(false);
               setLoadingMore(false);
         }
  };
    const handleApplyFilters = (newFilters) => {
         setFilters(newFilters);
        setPage(1)
         setPlayers([])
        fetchPlayers(1,newFilters);
         setShowFilterModal(false);

    };
    const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    if (loading) {
        return <div>Loading players...</div>;
    }

    if (error) {
        return <div style={{color:"red"}}>Error: {error}</div>;
    }
  

    return (
         <div className={styles.container}>
             <TopBar/>
          <div className={styles.header}>
              <div className={styles.tableTitle}>Players</div>
               <button onClick={handleFilterClick} className={styles.filterButton}>OPTIONS</button>
              {showFilterModal && <FilterModal
                columns={columns}
                onClose={() => setShowFilterModal(false)}
                onApply={handleApplyFilters}
                  initialFilters={filters}
                 allOptions={allTeamOptions}
                  />}
         </div>
       <div className={styles.playerListContainer} onScroll={handleScroll} ref={playerListRef}>
         <table className={styles.table}>
         {/* header */}
          <tbody>
           {players.map(player => (
               <tr key={player.season_player_id} className={`${styles.row} ${styles.fadeIn}`}>
                      {columns.map(column => (
                           <td key={column} className={styles.cell}>
                             <Link href={`/player/${player.player_id}`} style={{textDecoration:'none', color: '#ffffff'}}>
                                {player[column]}
                              </Link>
                           </td>
                          ))}
                 </tr>
               ))}
             {loadingMore && (
                <tr className={`${styles.row} ${styles.loadingRow}`}>
                    <td colSpan={columns.length} className={styles.loadingCell}>
                        <div className={styles.loadingAnimation}>Loading...</div>
                   </td>
              </tr>
            )}
        </tbody>
       </table>
       {loading && <div className={`${styles.loadingIndicator} ${styles.loadingAnimation}`}>Loading...</div>}
     </div>
    </div>
    );
};

export default PlayersPage;