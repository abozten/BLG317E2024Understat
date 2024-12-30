'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css'; // Import CSS module for styling
import Link from 'next/link';

export default function MatchDetails({ params }) {
    const unwrappedParams = React.use(params);
    const { match_id } = unwrappedParams;

    const [match, setMatch] = useState(null);
    const [matchInfo, setMatchInfo] = useState(null);
    const [shots, setShots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatchDetails();
    }, [match_id]);

    const fetchMatchDetails = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5001';

            // Fetch match, match_info and match_shots in parallel
            const [matchResponse, matchInfoResponse, shotsResponse] = await Promise.all([
                fetch(`${apiUrl}/matches/${match_id}`),
                fetch(`${apiUrl}/match_infos/${match_id}`),
                fetch(`${apiUrl}/matches/${match_id}/shots`)
            ]);

            if (!matchResponse.ok || !matchInfoResponse.ok || !shotsResponse.ok) {
                throw new Error('Failed to fetch match or match info details');
            }

            const matchData = await matchResponse.json();
            const matchInfoData = await matchInfoResponse.json();
            const shotsData = await shotsResponse.json();


            setMatch(matchData);
            setMatchInfo(matchInfoData)
            setShots(shotsData)
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

    if (!match || !matchInfo) {
        return <div className={styles.error}>No match details available.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Match Details</h1>
                <h2><strong>{matchInfo.league}</strong></h2>
                <h2>
                    {match.h_title} (<Link href={`/teams/${match.h_title}`}>{match.h_short_title}</Link>) vs
                    {match.a_title} (<Link href={`/teams/${match.a_title}`}>{match.a_short_title}</Link>)
                </h2>
                <p className={styles.dateTime}>
                    <strong>Date & Time:</strong> {new Date(match.datetime).toLocaleString()}
                </p>
            </div>

            <div className={styles.scoreSection}>
                <div className={styles.team}>
                    <Link href={`/teams/${match.h_title}`}>
                        <span>{match.h_title}</span>
                    </Link>
                </div>
                <div className={styles.score}>
                    <span>{match.goals_h}</span>
                    <span className={styles.separator}>-</span>
                    <span>{match.goals_a}</span>
                </div>
                <div className={styles.team}>
                    <Link href={`/teams/${match.a_title}`}>
                        <span>{match.a_title}</span>
                    </Link>
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
                      {matchInfo.a_ppda}
                    </span>
                    <span>
                       <strong>{match.a_title}</strong>
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

            <div className={styles.shotDetails}>
                <h3>Shot Details</h3>
                {shots && shots.map((shot, index) => (
                    <div key={index} className={styles.shotItem}>
                         <span>{shot.minute}'</span>
                       <div className={styles.shotContent}>
                            {shot.result === 'Goal' ?
                            <span style={{color: 'yellow'}}>⚽</span> : null}

                          <span className={styles.playerName}>
                            <Link href={`/players/${shot.player_id}`}>
                                {shot.player_name}
                           </Link>
                           </span>

                         {shot.player_assisted ?
                         <span className={styles.assist}>
                                ➡️
                             {shot.player_assisted}
                            
                        </span>
                           : null}


                             <span className={styles.shotType}>Shot Type: {shot.shotType}</span>
                            <span className={styles.shotSituation}>Situation: {shot.situation}</span>
                            </div>
                    </div>
                ))}
            </div>
        </div>
    );
}