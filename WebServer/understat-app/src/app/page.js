'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import TopBar from './components/TopBar';


const TopTeams2023 = () => {
  const [topTeams2023, setTopTeams2023] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
       fetchTopTeams2023();
  }, []);

  const fetchTopTeams2023 = async () => {
        setLoading(true);
      try {
          const response = await fetch("https://localhost:5001/team-performance");
           if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
           const data = await response.json();
          setTopTeams2023(data);
          setLoading(false);
      } catch (error) {
          console.error('Fetch error:', error);
           setError(error.message);
           setLoading(false);
       }
  };
  if (loading) {
      return <div className={styles.topTeamsLoading}>Loading top teams...</div>;
   }
  if (error) {
      return <div className={styles.topTeamsError}>Error: {error}</div>;
  }
   return (
      <div className={styles.topTeamsContainer}>
          <h2>Top Teams 2023</h2>
          <table className={styles.topTeamsTable}>
               <thead>
                   <tr>
                       <th className={styles.topTeamsHeader}>Team</th>
                      <th className={styles.topTeamsHeader}>Avg Team xG</th>
                      <th className={styles.topTeamsHeader}>Avg Player Rating</th>
                      <th className={styles.topTeamsHeader}>Total Matches</th>
                   </tr>
               </thead>
              <tbody>
                  {topTeams2023.map(team => (
                     <tr key={team.team_name} className={styles.topTeamsRow}>
                          <td className={styles.topTeamsCell}>
                           <Link href={`/teams/${team.team_name}`}  style={{ textDecoration: 'none', color: '#ffffff' }}>
                                  {team.team_name}
                              </Link>
                            </td>
                          <td className={styles.topTeamsCell}>
                              {typeof team.avg_team_xG === 'number' ? team.avg_team_xG.toFixed(2) : 'N/A'}
                          </td>
                         <td className={styles.topTeamsCell}>
                                {typeof team.avg_player_rating === 'string' ? parseFloat(team.avg_player_rating).toFixed(2) :
                                  typeof team.avg_player_rating === 'number' ? team.avg_player_rating.toFixed(2) : 'N/A'}
                           </td>
                          <td className={styles.topTeamsCell}>{team.total_matches}</td>
                     </tr>
                 ))}
              </tbody>
           </table>
      </div>
   );
};

const TopTeams = () => {
    const [topTeams, setTopTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopTeams();
    }, []);

    const fetchTopTeams = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://localhost:5001/fut23-summary");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
             setTopTeams(data);
             setLoading(false);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
            setLoading(false);
        }
    };
    if (loading) {
        return <div className={styles.topTeamsLoading}>Loading top teams...</div>;
    }
     if (error) {
        return <div className={styles.topTeamsError}>Error: {error}</div>;
    }
    return (
      <div className={styles.topTeamsContainer}>
          <h2>Top Teams</h2>
           <table className={styles.topTeamsTable}>
                <thead>
                   <tr>
                         <th className={styles.topTeamsHeader}>Team</th>
                        <th className={styles.topTeamsHeader}>Avg Rating</th>
                        <th className={styles.topTeamsHeader}>Total Players</th>
                   </tr>
                </thead>
                <tbody>
                   {topTeams.map(team => (
                      <tr key={team.Team} className={styles.topTeamsRow}>
                         <td className={styles.topTeamsCell}>{team.Team}</td>
                          <td className={styles.topTeamsCell}>
                            {typeof team.avg_rating === 'string' ? parseFloat(team.avg_rating).toFixed(2) : 
                            typeof team.avg_rating === 'number' ? team.avg_rating.toFixed(2) : 'N/A'}
                         </td>
                         <td className={styles.topTeamsCell}>{team.total_players}</td>
                      </tr>
                    ))}
                </tbody>
           </table>
      </div>
    );
};

export default function Page() {
  const LATEST_AVAILABLE_DATE = new Date('2024-05-26T23:59:00');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(LATEST_AVAILABLE_DATE);

  useEffect(() => {
    fetchMatches();
  }, [currentWeek]);

  const fetchMatches = async () => {
    try {
      const endOfWeek = new Date(currentWeek);
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);

      const response = await fetch(`https://localhost:5001/matchesdate?start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      const groupedMatches = groupMatchesByDate(data);
      setMatches(groupedMatches);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const groupMatchesByDate = (matches) => {
    const grouped = {};
    matches.forEach(match => {
      const date = new Date(match.datetime);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(match);
    });
    return Object.entries(grouped).map(([date, games]) => ({
      date,
      games
    }));
  };

  const formatTime = (datetime) => {
    const date = new Date(datetime);
    return date.toUTCString().slice(17, 22);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    if (nextWeek <= LATEST_AVAILABLE_DATE) {
      setCurrentWeek(nextWeek);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading matches...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div>
    <TopBar />
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.breadcrumb}>
          Matches
        </div>
      </nav>

      <div className={styles.weekNav}>
        <button className={styles.weekBtn} onClick={handlePrevWeek}>Previous Week</button>
        <button className={styles.weekBtn} onClick={handleNextWeek}>Next Week</button>
      </div>

      {matches.length === 0 ? (
        <div className={styles.noMatches}>
          No matches were played during this week
        </div>
      ) : (
        matches.map((matchDay, index) => (
          <div key={index} className={styles.matchDay}>
            <h2 className={styles.date}>{matchDay.date}</h2>
            {matchDay.games.map((game, gameIndex) => (
              <div key={gameIndex} className={styles.match}>
                <div className={styles.team}>
                  <Link href={`/teams/${game.h_title}`}>
                    {game.h_title}
                  </Link>
                </div> 
                <div className={styles.scoreContainer}>
                  {game.isResult ? (
                    <Link href={`/matches/${game.match_id}`} className={styles.score}>
                      <span>{game.goals_h}</span>
                      <span>{game.goals_a}</span>
                    </Link>
                  ) : (
                    <div className={styles.time}>
                      {formatTime(game.datetime)}
                    </div>
                  )}
                </div>                
                <div className={styles.team}>
                  <Link href={`/teams/${game.a_title}`}>
                    {game.a_title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      <TopTeams />
       <TopTeams2023 />
    </div>
    </div>
  );
}