'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Fut23Form() {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    player_id: 0,
    Team: '',
    team_id: 0,
    Country: '',
    League: '',
    Rating: 0,
    Position: '',
    Other_Positions: '',
    Run_type: '',
    Price: '',
    Skill: 0,
    Weak_foot: 0,
    Attack_rate: '',
    Defense_rate: '',
    Pace: 0,
    Shoot: 0,
    Pass: 0,
    Drible: 0,
    Defense: 0,
    Physical: 0,
    Body_type: '',
    Height_cm: 0,
    Weight: 0,
    Popularity: 0,
    Base_Stats: 0,
    In_Game_Stats: 0,
  });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const PLAYERS_PER_PAGE = 20;

  const playerListRef = useRef(null);

    useEffect(() => {
        const operationsElement = document.querySelector(`.${styles.operations}`);
        const radioButtons = document.querySelectorAll(
            `.${styles.operations} input[type="radio"]`
        );

        const updateDialPosition = () => {
        const checkedRadioButton = document.querySelector(
            `.${styles.operations} input[type="radio"]:checked`
        );
        if (operationsElement && checkedRadioButton) {
            if (checkedRadioButton.value === 'add') {
            operationsElement.style.setProperty('--dial-translate-x', '0%');
            } else if (checkedRadioButton.value === 'update') {
            operationsElement.style.setProperty('--dial-translate-x', '100%');
            } else if (checkedRadioButton.value === 'delete') {
            operationsElement.style.setProperty('--dial-translate-x', '200%');
            }
        }
        };

    radioButtons.forEach((radio) => {
        radio.addEventListener('change', updateDialPosition);
    });

        updateDialPosition();

        return () => {
        radioButtons.forEach((radio) => {
            radio.removeEventListener('change', updateDialPosition);
        });
        };
    }, []);

    const fetchPlayers = async (pageNum = 1, search = '') => {
        try {
            setLoading(true);
            const response = await fetch(
            `https://localhost:5001/fut23?page=${pageNum}&search=${search}&limit=${PLAYERS_PER_PAGE}`
            );
            const data = await response.json();

            if (pageNum === 1) {
                setPlayers(data);
            } else {
                setPlayers((prev) => [...prev, ...data]);
            }

            setHasMore(data.length === PLAYERS_PER_PAGE);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch players');
            setLoading(false);
        }
    };


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

    if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchPlayers(1, value);
        }, 500);

    setSearchTimeout(timeoutId);
    };


    const handleScroll = () => {
        if (!playerListRef.current) return;
            if (scrollTimeout) clearTimeout(scrollTimeout);
        setScrollTimeout(
            setTimeout(() => {
            const { scrollTop, clientHeight, scrollHeight } = playerListRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                setPage((prev) => prev + 1);
                fetchPlayers(page + 1, searchTerm);
                }
            }, 200)
        );
    };


    useEffect(() => {
    fetchPlayers(1, searchTerm);
    }, []);


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'https://localhost:5001/fut23';
                    method = 'POST';
                    break;
                case 'update':
                    url = `https://localhost:5001/futplayer/${formData.player_id}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `https://localhost:5001/futplayer/${formData.player_id}`;
                    method = 'DELETE';
                    break;
            }


            const response = await fetch(url, {
                method,
                headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
                body: operation !== 'delete' ? JSON.stringify(formData) : undefined,
            });

            if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Operation failed');
            }

        fetchPlayers(1, searchTerm);
        resetForm();
        setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
            setFormData({
                Name: '',
                player_id: 0,
                Team: '',
                team_id: 0,
                Country: '',
                League: '',
                Rating: 0,
                Position: '',
                Other_Positions: '',
                Run_type: '',
                Price: '',
                Skill: 0,
                Weak_foot: 0,
                Attack_rate: '',
                Defense_rate: '',
                Pace: 0,
                Shoot: 0,
                Pass: 0,
                Drible: 0,
                Defense: 0,
                Physical: 0,
                Body_type: '',
                Height_cm: 0,
                Weight: 0,
                Popularity: 0,
                Base_Stats: 0,
                In_Game_Stats: 0,
                });
        setSelectedPlayer(null);
    };

      const handlePlayerSelect = (player) => {
        setFormData({
        Name: player.Name || '',
        player_id: player.player_id || 0,
        Team: player.Team || '',
        team_id: player.team_id || 0,
        Country: player.Country || '',
        League: player.League || '',
        Rating: player.Rating || 0,
        Position: player.Position || '',
        Other_Positions: player.Other_Positions || '',
        Run_type: player.Run_type || '',
        Price: player.Price || '',
        Skill: player.Skill || 0,
        Weak_foot: player.Weak_foot || 0,
        Attack_rate: player.Attack_rate || '',
        Defense_rate: player.Defense_rate || '',
        Pace: player.Pace || 0,
        Shoot: player.Shoot || 0,
        Pass: player.Pass || 0,
        Drible: player.Drible || 0,
        Defense: player.Defense || 0,
        Physical: player.Physical || 0,
        Body_type: player.Body_type || '',
        Height_cm: player.Height_cm || 0,
        Weight: player.Weight || 0,
        Popularity: player.Popularity || 0,
        Base_Stats: player.Base_Stats || 0,
        In_Game_Stats: player.In_Game_Stats || 0,
        });
    setSelectedPlayer(player);
    };
    return (
        <div className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
        <div className={styles.operations}>
            <label>
            <input
                type="radio"
                name="operation"
                value="add"
                checked={operation === 'add'}
                onChange={() => {
                setOperation('add');
                resetForm();
                }}
            />
            Add
            </label>
            <label>
            <input
                type="radio"
                name="operation"
                value="update"
                checked={operation === 'update'}
                onChange={() => setOperation('update')}
            />
            Update
            </label>
            <label>
            <input
                type="radio"
                name="operation"
                value="delete"
                checked={operation === 'delete'}
                onChange={() => setOperation('delete')}
            />
            Delete
            </label>
            </div>
        <form onSubmit={handleSubmit}>
            {operation !== 'delete' && (
                <>
                    {Object.keys(formData).map((key) => (
                        <div className={styles.formGroup} key={key}>
                        <label>{key.replace('_', ' ').toUpperCase()}:</label>
                            <input
                                type={typeof formData[key] === 'number' ? 'number' : 'text'}
                                value={formData[key]}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                [key]:
                                    typeof formData[key] === 'number'
                                    ? parseFloat(e.target.value)
                                    : e.target.value,
                                })
                            }
                            required
                            />
                        </div>
                    ))}
                </>
            )}
            <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading
                ? 'Processing...'
                : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Player`}
            </button>
            </form>
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Search player..."
                value={searchTerm}
                onChange={handleSearch}
            />
            <div
                className={styles.playerListContainer}
                onScroll={handleScroll}
                ref={playerListRef}
            >
                {players.map((player) => (
                    <div
                        key={player.player_id}
                        className={`${styles.playerItem} ${
                        selectedPlayer?.player_id === player.player_id
                            ? styles.selected
                            : ''
                        }`}
                        onClick={() => handlePlayerSelect(player)}
                    >
                        <span>{player.Name}</span>
                        <span>{player.Team}</span>
                    </div>
                    ))}
                {loading && (
                <div
                    className={`${styles.loadingIndicator} ${styles.loadingAnimation}`}
                >
                    Loading...
                </div>
                )}
            </div>
        </div>
    );
}