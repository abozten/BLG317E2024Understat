// src/app/season/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import TopBar from '../components/TopBar';
import Link from 'next/link';

export default function SeasonPage() {
    const [seasons, setSeasons] = useState([]);
    const [teams, setTeams] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
     const [seasonSummary, setSeasonSummary] = useState([]);
      const [teamPerformance, setTeamPerformance] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const SEASONS_PER_PAGE = 20;

    const seasonListRef = useRef(null);


      useEffect(() => {
       fetchTeams();
        fetchSeasons(1, searchTerm);
         fetchSeasonSummary();
        }, []);

    const handleScroll = () => {
        if (!seasonListRef.current) return;
        if (scrollTimeout) clearTimeout(scrollTimeout);
         setScrollTimeout(
           setTimeout(() => {
            const { scrollTop, clientHeight, scrollHeight } = seasonListRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                 setScrollPosition(scrollTop);
                setLoadingMore(true);
                setPage((prev) => prev + 1);
                fetchSeasons(page + 1, searchTerm);
            }
              }, 200)
        );
    };
    useEffect(() => {
        if (seasonListRef.current && scrollPosition > 0) {
            seasonListRef.current.scrollTop = scrollPosition;
        }
    }, [seasons, scrollPosition]);


    const fetchTeams = async () => {
    try {
        const response = await fetch('https://localhost:5001/teams');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
      const teamMap = {};
          data.forEach(team => {
           teamMap[team.team_id] = team.team_name;
         });
          setTeams(teamMap);
    } catch (err) {
          console.log(err)
           setError(err.message);
      }
    };
      const fetchSeasonSummary = async () => {
        try {
           const response = await fetch(
                `https://localhost:5001/season-summary`
            );
             if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
             const data = await response.json();
             setSeasonSummary(data);

        } catch (err) {
            console.error("Error fetching season summary", err);
           setError(err.message);
        }
    };


      const fetchSeasons = async (pageNum = 1, search = '') => {
        try {
             setLoading(true);
             const response = await fetch(
                `https://localhost:5001/seasons?page=${pageNum}&search=${search}&limit=${SEASONS_PER_PAGE}`
            );
             if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
           
             const data = await response.json();
            

           if (Array.isArray(data)) {
               if (pageNum === 1) {
                   setSeasons(data);
               } else {
                   setSeasons((prev) => [...prev, ...data]);
               }
              
               setHasMore(data.length === SEASONS_PER_PAGE);
         } else {
               setSeasons([]);
               setHasMore(false);
           }
           setLoading(false);
            setLoadingMore(false);
         } catch (error) {
            setError('Failed to fetch seasons: ' + error.message);
           setLoading(false);
            setLoadingMore(false);
        }
    };

  const handleTeamSelect = async (team_name) => {
      try {
        setLoading(true);
         const response = await fetch(`https://localhost:5001/season/${team_name}`);
            if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
             const data = await response.json();
            setTeamPerformance(data);
         }
      catch (err) {
        setError('Failed to fetch team perf: ' + err.message)
        }
      finally {
        setLoading(false)
      }
  }

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) clearTimeout(searchTimeout);

            const timeoutId = setTimeout(() => {
                setPage(1);
                fetchSeasons(1, value);
            }, 500);

        setSearchTimeout(timeoutId);
    };

  if (loading) {
     return <div className={styles.loading}>Loading seasons...</div>;
  }
  if(error){
      return <div className={styles.error}>{error}</div>;
  }
  return (
        <div className={styles.container}>
           <TopBar />
             <div style={{ padding: '1rem'}}>
                <input
                   type="text"
                    className={styles.searchInput}
                    placeholder="Search team ID..."
                    value={searchTerm}
                     onChange={handleSearch}
                 />
             </div>
              <div
                className={styles.seasonListContainer}
                onScroll={handleScroll}
                ref={seasonListRef}
                 >
                 {seasons && seasons.map((season) => (
                      <div key={season.seasonentryid} className={styles.seasonCard}>
                         <div className={styles.seasonHeader}>
                             <Link href={`/team/${teams[season.team_id]}`} style={{ textDecoration: 'none', color: '#fff' }} onClick={()=>handleTeamSelect(teams[season.team_id])}>
                            {teams[season.team_id] || `Team ID: ${season.team_id}`}
                             </Link>
                             <span>{season.year}</span>
                          </div>
                            <div className={styles.seasonStats}>
                            <p><strong>xG:</strong> {season.xG.toFixed(2)}</p>
                            <p><strong>xGA:</strong> {season.xGA.toFixed(2)}</p>
                            <p><strong>npxG:</strong> {season.npxG.toFixed(2)}</p>
                             <p><strong>npxGA:</strong> {season.npxGA.toFixed(2)}</p>
                            <p><strong>Scored:</strong> {season.scored}</p>
                           <p><strong>Missed:</strong> {season.missed}</p>
                            <p><strong>Wins:</strong> {season.wins}</p>
                            <p><strong>Draws:</strong> {season.draws}</p>
                             <p><strong>Loses:</strong> {season.loses}</p>
                            <p><strong>Points:</strong> {season.pts}</p>
                            </div>
                       </div>
                 ))}
                  {loadingMore && (
                           <div className={`${styles.loadingIndicator} ${styles.loadingAnimation}`}>
                               Loading...
                            </div>
                        )}
               </div>
                <div className={styles.seasonSummary}>
                <h3>Season Summary</h3>
                 {seasonSummary.length > 0 ? (
                   seasonSummary.map((summary,index) => (
                       <div className={styles.seasonSummaryItem} key={index}>
                        <p><strong>Team ID:</strong> {summary.team_id}</p>
                       <p><strong>Year:</strong> {summary.year}</p>
                          <p><strong>Total Matches:</strong> {summary.total_matches}</p>
                         <p><strong>Total Scored:</strong> {summary.total_scored}</p>
                           <p><strong>Total Missed:</strong> {summary.total_missed}</p>
                           <p><strong>Average xG:</strong> {summary.avg_xG.toFixed(2)}</p>
                          <p><strong>Average xGA:</strong> {summary.avg_xGA.toFixed(2)}</p>
                    </div>
                      )) 
                  ) : (
                        <p>No Season Summary Found</p>
                    )}
           </div>
              {teamPerformance && teamPerformance.length > 0 && (
                  <div className={styles.teamPerformance}>
                       <h3>Team Performance</h3>
                         {teamPerformance.map((performance, index) => (
                            <div key={index} className={styles.teamPerformanceItem}>
                                  <p><strong>Date:</strong> {performance.date}</p>
                               <p><strong>Result:</strong> {performance.result}</p>
                               <p><strong>xG:</strong> {performance.xG.toFixed(2)}</p>
                                <p><strong>xGA:</strong> {performance.xGA.toFixed(2)}</p>
                               <p><strong>Scored:</strong> {performance.scored}</p>
                              <p><strong>Missed:</strong> {performance.missed}</p>
                               <p><strong>Points:</strong> {performance.pts}</p>
                            </div>
                            ))}
                   </div>
               )}
          </div>
    );
}