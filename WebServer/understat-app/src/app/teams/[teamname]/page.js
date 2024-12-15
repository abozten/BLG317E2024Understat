'use client';

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function MatchStatistics() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);

        // Fetch matches from backend
        const response = await fetch("http://localhost:5001/matches"); // Update to match your API URL
        if (!response.ok) {
          throw new Error(`Failed to fetch matches: ${response.status}`);
        }

        const matchData = await response.json();
        setMatches(matchData || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Match Statistics</h1>

      {/* Matches Section */}
      <div className={styles.matchGrid}>
        {matches.map((match) => (
          <div key={match.match_id} className={styles.matchCard}>
            <p className={styles.date}>
              {new Date(match.datetime).toLocaleString()} {/* Format the date */}
            </p>
            <p className={styles.teams}>
              {match.h_title} ({match.h_short_title}) vs {match.a_title} ({match.a_short_title})
            </p>
            <p className={styles.score}>
              {match.goals_h} - {match.goals_a} {/* Display the score */}
            </p>
            <div className={styles.forecasts}>
              <span>Win: {match.forecast_w.toFixed(2)}</span>
              <span>Draw: {match.forecast_d.toFixed(2)}</span>
              <span>Loss: {match.forecast_l.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
