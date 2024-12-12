'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Page() {
  const [timeZoneEnabled, setTimeZoneEnabled] = useState(true);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:5001/matches');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      
      // Group matches by date
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

  if (loading) {
    return <div className={styles.loading}>Loading matches...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.breadcrumb}>
          Home / La liga
        </div>
        <div className={styles.timezone}>
          Set time zone
          <button 
            className={`${styles.toggleBtn} ${timeZoneEnabled ? styles.active : ''}`}
            onClick={() => setTimeZoneEnabled(true)}
          >
            On
          </button>
          <button 
            className={`${styles.toggleBtn} ${!timeZoneEnabled ? styles.active : ''}`}
            onClick={() => setTimeZoneEnabled(false)}
          >
            Off
          </button>
        </div>
      </nav>

      <div className={styles.weekNav}>
        <button className={styles.weekBtn}>prev week</button>
        <button className={styles.weekBtn}>next week</button>
      </div>

      {matches.map((matchDay, index) => (
        <div key={index} className={styles.matchDay}>
          <h2 className={styles.date}>{matchDay.date}</h2>
          {matchDay.games.map((game, gameIndex) => (
            <div key={gameIndex} className={styles.match}>
              <div className={styles.team}>{game.team1}</div>
              <div className={styles.scoreContainer}>
                {game.score1 !== null && game.score2 !== null ? (
                  <div className={styles.score}>
                    <span>{game.score1}</span>
                    <span>{game.score2}</span>
                  </div>
                ) : (
                  <div className={styles.time}>
                    {new Date(game.datetime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </div>
                )}
              </div>
              <div className={styles.team}>{game.team2}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}