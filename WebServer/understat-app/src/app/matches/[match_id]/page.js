'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css'; // Import CSS module for styling

export default function MatchDetails({ params }) {
  const unwrappedParams = React.use(params);
  const { match_id } = unwrappedParams;

  const [match, setMatch] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatchDetails();
  }, [match_id]);

  const fetchMatchDetails = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      // Fetch match and match_info in parallel
      const [matchResponse, matchInfoResponse] = await Promise.all([
        fetch(`${apiUrl}/matches/${match_id}`),
        fetch(`${apiUrl}/match_infos/${match_id}`)
      ]);

      if (!matchResponse.ok || !matchInfoResponse.ok) {
        throw new Error('Failed to fetch match or match info details');
      }

      const matchData = await matchResponse.json();
      const matchInfoData = await matchInfoResponse.json();
      setMatch(matchData);
      setMatchInfo(matchInfoData)
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading match details...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!match) {
    return <div className={styles.error}>No match details available.</div>;
  }

  console.log(matchInfo)
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Match Details</h1>
        <h2><strong>{matchInfo.league}</strong></h2>
        <h2>
          {match.h_title} ({match.h_short_title}) vs {match.a_title} ({match.a_short_title})
        </h2>
        <p className={styles.dateTime}>
          <strong>Date & Time:</strong> {new Date(match.datetime).toLocaleString()}
        </p>
      </div>

      <div className={styles.scoreSection}>
        <div className={styles.team}>
          <span>{match.h_title}</span>
        </div>
        <div className={styles.score}>
          <span>{match.goals_h}</span>
          <span className={styles.separator}>-</span>
          <span>{match.goals_a}</span>
        </div>
        <div className={styles.team}>
          <span>{match.a_title}</span>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Expected Goals (xG)</h3>
        <div className={styles.statsRow}>
        <span>
          <strong>{match.h_title}</strong> 
        </span>
        <span>
           {match.xG_h.toFixed(2)}
        </span>
        -
        <span>
           {match.xG_a.toFixed(2) }
        </span>
        <span>
           <strong>{match.a_title}</strong>
        </span>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Shoots</h3>
        <div className={styles.statsRow}>
        <span>
          <strong>{match.h_title}</strong> 
        </span>
        <span>
        {matchInfo.h_shot}
        </span>
        -
        <span>
        {matchInfo.a_shot}
        </span>
        <span>
           <strong>{match.a_title}</strong>
        </span>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Shoots on Target</h3>
        <div className={styles.statsRow}>
        <span>
          <strong>{match.h_title}</strong> 
        </span>
        <span>
        {matchInfo.h_shotOnTarget}
        </span>
        -
        <span>
        {matchInfo.a_shotOnTarget}
        </span>
        <span>
           <strong>{match.a_title}</strong>
        </span>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Deep Shots (within 20 yards of goal)</h3>
        <div className={styles.statsRow}>
        <span>
          <strong>{match.h_title}</strong> 
        </span>
        <span>
        {matchInfo.h_deep}
        </span>
        -
        <span>
        {matchInfo.a_deep}
        </span>
        <span>
           <strong>{match.a_title}</strong>
        </span>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Passes Allowed Per Defensive Action in Opposition Half</h3>
        <div className={styles.statsRow}>
        <span>
          <strong>{match.h_title}</strong> 
        </span>
        <span>
        {matchInfo.h_ppda}
        </span>
        -
        <span>
           {match.xG_a.toFixed(2) }
        </span>
        <span>
           <strong>{match.a_ppda}</strong>
        </span>
        </div>
      </div>

      <div className={styles.forecast}>
        <h3>Match Forecast</h3>
        <ul>
          <li><strong>Home Win:</strong> {(match.forecast_w * 100).toFixed(2)}%</li>
          <li><strong>Draw:</strong> {(match.forecast_d * 100).toFixed(2)}%</li>
          <li><strong>Away Win:</strong> {(match.forecast_l * 100).toFixed(2)}%</li>
          <li><strong>Season:</strong> {(matchInfo.league)}</li>
        </ul>
      </div>
    </div>
  );
}
