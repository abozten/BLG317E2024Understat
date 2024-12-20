import React from 'react';
import styles from './PlayerCard.module.css';
import { useRouter } from 'next/navigation';


const PlayerCard = ({ player }) => {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/players/${player.player_id}`);
    };

    return (
        <div className={styles.playerCard} onClick={handleClick}>
            <div className={styles.playerInfo}>
              <p className={styles.playerName}>{player.name}</p>
              <p>{player.position}</p>
               <p>Rating: {player.rating}</p>
               <p>Games: {player.games}</p>
               <p>Goals: {player.goals}</p>
               <p>Assists: {player.assists}</p>
            </div>
        </div>
    );
};

export default PlayerCard;