'use client';
import React, { useState, useEffect } from 'react';
import styles from './PlayerProfile.module.css';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const PlayerProfile = () => {
  const params = useParams();
  const playerid = parseInt(params.player_id, 10); // Convert to integer with base 10
      const [playerData, setPlayerData] = useState(null);
    const [futData, setFutData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
        const fetchPlayerData = async () => {
            setLoading(true);
            setError(null);
            console.log("useEffect triggered, playerid:", playerid);
            try {
                console.log("Fetching player data for id:", playerid);
                if (!playerid) {
                    console.error("playerid is undefined immediately before fetch");
                    setError("Player ID is undefined");
                    setLoading(false);
                    return;
                }
                const res = await fetch(`https://localhost:5001/player/${playerid}`);
                console.log("Response status:", res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                const player = await res.json();
                  console.log("Player data:", player);
                  setPlayerData(player);
                try {
                  console.log("Fetching fut data for player id:", player.player_id);
                    const resFut = await fetch(`https://localhost:5001/futplayer/${player.player_id}`);
                    console.log("Fut Response status:", resFut.status)
                    if (!resFut.ok) {
                      throw new Error(`HTTP error! Status: ${resFut.status}`);
                    }
                    const fut = await resFut.json();
                      console.log("Fut data:", fut);
                    setFutData(fut);
                } catch (error) {
                    console.error('Fetch error for fut data:', error);
                    setError(error.message);
               } finally {
                 setLoading(false);
                }
            } catch (error) {
                console.error('Fetch error for player data:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchPlayerData();
    }, [playerid]);


    if (loading) {
        return <div>Loading player data...</div>;
    }
    if (error) {
        return <div style={{ color: "red" }}>Error: {error}</div>;
    }

    if (!playerData) {
        return <div>Player not found.</div>;
    }

    return (
         <div className={styles.container}>
            <div className={styles.topBar}>
                <Link href="/" className={styles.homeButton}>Home</Link>
            </div>
            <div className={styles.profile}>
                <h1 className={styles.playerName}>{playerData.player_name}</h1>
                <div className={styles.playerInfo}>
                    <div className={styles.playerSection}>
                        <h2 className={styles.sectionTitle}>Season Statistics</h2>
                        <p><strong>Team:</strong> {playerData.team_title}</p>
                        <p><strong>Position:</strong> {playerData.position}</p>
                        <p><strong>Games Played:</strong> {playerData.games}</p>
                        <p><strong>Minutes Played:</strong> {playerData.time}</p>
                        <p><strong>Goals:</strong> {playerData.goals}</p>
                        <p><strong>Expected Goals (xG):</strong> {playerData.xG}</p>
                        <p><strong>Assists:</strong> {playerData.assists}</p>
                        <p><strong>Expected Assists (xA):</strong> {playerData.xA}</p>
                        <p><strong>Shots:</strong> {playerData.shots}</p>
                        <p><strong>Key Passes:</strong> {playerData.key_passes}</p>
                        <p><strong>Non-Penalty Goals (npg):</strong> {playerData.npg}</p>
                        <p>
                            <strong>Non-Penalty Expected Goals (npxG):</strong> {playerData.npxG}
                        </p>
                        <p><strong>Expected Goals Chain:</strong> {playerData.xGChain}</p>
                        <p><strong>Expected Goals Buildup:</strong> {playerData.xGBuildup}</p>
                        <p><strong>Yellow Cards:</strong> {playerData.yellow_cards}</p>
                        <p><strong>Red Cards:</strong> {playerData.red_cards}</p>
                        <p><strong>Year:</strong> {playerData.year}</p>
                    </div>

                    {futData && (
                        <div className={styles.playerSection}>
                            <h2 className={styles.sectionTitle}>FUT 23 Card Data</h2>
                            <p><strong>Rating:</strong> {futData.Rating}</p>
                            <p><strong>Team:</strong> {futData.Team}</p>
                            <p><strong>Team Id:</strong> {futData.team_id}</p>
                            <p><strong>Country:</strong> {futData.Country}</p>
                            <p><strong>League:</strong> {futData.League}</p>
                            <p><strong>Position:</strong> {futData.Position}</p>
                            <p><strong>Other Positions:</strong> {futData.Other_Positions}</p>
                            <p><strong>Run Type:</strong> {futData.Run_type}</p>
                            <p><strong>Price:</strong> {futData.Price}</p>
                            <p><strong>Skill:</strong> {futData.Skill}</p>
                            <p><strong>Weak Foot:</strong> {futData.Weak_foot}</p>
                            <p><strong>Attack Rate:</strong> {futData.Attack_rate}</p>
                            <p><strong>Defense Rate:</strong> {futData.Defense_rate}</p>
                            <p><strong>Pace:</strong> {futData.Pace}</p>
                            <p><strong>Shoot:</strong> {futData.Shoot}</p>
                            <p><strong>Pass:</strong> {futData.Pass}</p>
                            <p><strong>Drible:</strong> {futData.Drible}</p>
                            <p><strong>Defense:</strong> {futData.Defense}</p>
                            <p><strong>Physical:</strong> {futData.Physical}</p>
                            <p><strong>Body Type:</strong> {futData.Body_type}</p>
                            <p><strong>Height:</strong> {futData.Height_cm} cm</p>
                            <p><strong>Weight:</strong> {futData.Weight} kg</p>
                            <p><strong>Popularity:</strong> {futData.Popularity}</p>
                            <p><strong>Base Stats:</strong> {futData.Base_Stats}</p>
                            <p><strong>In Game Stats:</strong> {futData.In_Game_Stats}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;