'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import TopBar from './components/TopBar';

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
    </div>
    </div>
  );
}
