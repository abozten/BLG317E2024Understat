import React from 'react';
import styles from './MatchCard.module.css';
import { useRouter } from 'next/navigation';

const MatchCard = ({ match }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/matches/${match.match_id}`);
    };

    return (
         <div className={styles.matchCard} onClick={handleClick}>
            <div className={styles.matchInfo}>
                 <p className={styles.matchDate}>{new Date(match.datetime).toLocaleDateString()}</p>
                 <div className={styles.teams}>
                   <p>{match.h_title}</p>
                   <p>{match.goals_h} - {match.goals_a}</p>
                   <p>{match.a_title}</p>
                 </div>
             </div>
         </div>
    );
};

export default MatchCard;