'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import MatchCard from '../../components/MatchCard';
import PlayerCard from '../../components/PlayerCard';
import { useParams } from 'next/navigation';

const TeamPage = () => {
    const params = useParams();
    const teamname = decodeURIComponent(params.teamname);

    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching squad data for team:", teamname); // Log before fetch
               const teamData = await fetch(`https://localhost:5001/team/${teamname}/squad`);
                    console.log("Team Data Response:", teamData); // Log the raw response object
                   if (!teamData.ok) {
                       throw new Error(`HTTP error! Status: ${teamData.status}`);
                   }
                  const squad = await teamData.json();
                  console.log("Parsed Squad Data:", squad);  // Log parsed JSON data
                setPlayers(squad);
                  const matchesData = await fetch(`https://localhost:5001/team/${teamname}`);
                     if (!matchesData.ok) {
                         throw new Error(`HTTP error! Status: ${matchesData.status}`);
                     }
                   const matches = await matchesData.json();
                   setMatches(matches || []);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch team data:", error);
                setError('Failed to fetch team data');
                setLoading(false);
            }
        };
        fetchData();
    }, [teamname]);


   if (loading) {
      return <div>Loading...</div>;
   }
   if (error) {
       return <div style={{color:"red"}}>Error: {error}</div>;
   }


   return (
       <div className={styles.container}>
            <h1 className={styles.teamTitle}>{teamname}</h1>
            <div className={styles.matchesSection}>
              <h2 className={styles.sectionTitle}>Latest 10 Matches</h2>
              {matches.length > 0 ? (
                 <div className={styles.matchContainer}>
                  {matches.map((match, index) => (
                    <MatchCard key={index} match={match} />
                  ))}
                 </div>
                ) : (<p>No matches found</p>)}
            </div>
         <div className={styles.playersSection}>
           <h2 className={styles.sectionTitle}>Squad</h2>
            {players.length > 0 ? (
                <div className={styles.playerContainer}>
                {players.map((player, index) => {
                    console.log("Player Object:", player);
                    return <PlayerCard key={index} player={player} />;
                })}
               </div>
              ) : (<p>No players found</p>)}
          </div>
       </div>
   );
};
export default TeamPage;