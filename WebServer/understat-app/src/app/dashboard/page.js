'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
    const router = useRouter();
    const [selectedSection, setSelectedSection] = useState('teams');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const validateSession = async () => {
            try {
                const res = await fetch('https://127.0.0.1:5001/validate-session', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors'
                });
            
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'valid') {
                        setIsAuthenticated(true);
                    } else {
                        router.replace('/login');
                    }
                } else {
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Session validation failed:', error);
                router.replace('/login');
            }
        };

        validateSession();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('https://localhost:5001/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    const renderForm = () => {
        switch (selectedSection) {
            case 'teams':
                return <TeamForm />;
            case 'players':
                return <PlayerForm />;
            case 'matches':
                return <MatchForm />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                </button>
            </div>
            <Sidebar setSelectedSection={setSelectedSection} />
            <div className={styles.content}>
                {renderForm()}
            </div>
        </div>
    );
}

function Sidebar({ setSelectedSection }) {
    return (
        <div className={styles.sidebar}>
            <button onClick={() => setSelectedSection('teams')}>Teams</button>
            <button onClick={() => setSelectedSection('players')}>Players</button>
            <button onClick={() => setSelectedSection('matches')}>Matches</button>
        </div>
    );
}

function TeamForm() {
    const [teams, setTeams] = useState([]);
    const [formData, setFormData] = useState({ team_name: '', team_id: '' });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch('https://localhost:5001/teams');
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            setError('Failed to fetch teams');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'https://localhost:5001/addteam';
                    method = 'POST';
                    break;
                case 'update':
                    url = `https://localhost:5001/team/${formData.team_name}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `https://localhost:5001/team/${formData.team_name}`;
                    method = 'DELETE';
                    break;
            }

            const response = await fetch(url, {
                method,
                headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
                body: operation !== 'delete' ? JSON.stringify(formData) : undefined
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Operation failed');
            }
            
            fetchTeams();
            resetForm();
            setError(null); // Clear any previous errors on success
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ team_name: '', team_id: '' });
        setSelectedTeam(null);
    };

    const handleTeamSelect = (team) => {
        setFormData(team);
        setSelectedTeam(team);
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
            onChange={(e) => {
                setOperation(e.target.value);
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
            onChange={(e) => setOperation(e.target.value)}
        />
        Update
    </label>
    <label>
        <input
            type="radio"
            name="operation"
            value="delete"
            checked={operation === 'delete'}
            onChange={(e) => setOperation(e.target.value)}
        />
        Delete
    </label>
</div>

            <form onSubmit={handleSubmit} style={{ transition: 'opacity 0.3s' }}>
                {operation !== 'delete' && (
                    <>
                        <div className={styles.formGroup}>
                            <label>Team Name:</label>
                            <input
                                type="text"
                                value={formData.team_name}
                                onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Team ID:</label>
                            <input
                                type="text"
                                value={formData.team_id}
                                onChange={(e) => setFormData({...formData, team_id: e.target.value})}
                                required
                            />
                        </div>
                    </>
                )}
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Processing...' : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Team`}
                </button>
            </form>

            <div className={styles.teamList}>
                {teams.map(team => (
                    <div 
                        key={team.team_id} 
                        className={`${styles.teamItem} ${selectedTeam?.team_id === team.team_id ? styles.selected : ''}`}
                        onClick={() => handleTeamSelect(team)}
                    >
                        <span>{team.team_name}</span>
                        <span>{team.team_id}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
function PlayerForm() {
    const [players, setPlayers] = useState([]);
    const [formData, setFormData] = useState({
        player_id: '',
        player_name: '',
        games: 0,
        time: 0,
        goals: 0,
        xG: 0,
        assists: 0,
        xA: 0,
        shots: 0,
        key_passes: 0,
        yellow_cards: 0,
        red_cards: 0,
        position: '',
        team_title: '',
        npg: 0,
        npxG: 0,
        xGChain: 0,
        xGBuildup: 0,
        year: 0
    });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const response = await fetch('https://localhost:5001/players');
            const data = await response.json();
            setPlayers(data);
        } catch (error) {
            setError('Failed to fetch players');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'https://localhost:5001/addplayer';
                    method = 'POST';
                    break;
                case 'update':
                    url = `https://localhost:5001/player/${formData.player_id}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `https://localhost:5001/player/${formData.player_id}`;
                    method = 'DELETE';
                    break;
            }

            const response = await fetch(url, {
                method,
                headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
                body: operation !== 'delete' ? JSON.stringify(formData) : undefined
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Operation failed');
            }
            
            fetchPlayers();
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
            player_id: '',
            player_name: '',
            games: 0,
            time: 0,
            goals: 0,
            xG: 0,
            assists: 0,
            xA: 0,
            shots: 0,
            key_passes: 0,
            yellow_cards: 0,
            red_cards: 0,
            position: '',
            team_title: '',
            npg: 0,
            npxG: 0,
            xGChain: 0,
            xGBuildup: 0,
            year: 0
        });
        setSelectedPlayer(null);
    };

    const handlePlayerSelect = (player) => {
        setFormData(player);
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
                        onChange={(e) => {
                            setOperation(e.target.value);
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
                        onChange={(e) => setOperation(e.target.value)}
                    />
                    Update
                </label>
                <label>
                    <input
                        type="radio"
                        name="operation"
                        value="delete"
                        checked={operation === 'delete'}
                        onChange={(e) => setOperation(e.target.value)}
                    />
                    Delete
                </label>
            </div>

            <form onSubmit={handleSubmit}>
                {operation !== 'delete' && (
                    <>
                        {Object.keys(formData).map(key => (
                            <div className={styles.formGroup} key={key}>
                                <label>{key.replace('_', ' ').toUpperCase()}:</label>
                                <input
                                    type={typeof formData[key] === 'number' ? 'number' : 'text'}
                                    step={key.includes('xG') || key.includes('xA') ? '0.01' : '1'}
                                    value={formData[key]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [key]: typeof formData[key] === 'number' ? 
                                            parseFloat(e.target.value) || 0 : 
                                            e.target.value
                                    })}
                                    required
                                />
                            </div>
                        ))}
                    </>
                )}
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Processing...' : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Player`}
                </button>
            </form>

            <div className={styles.playerList}>
                {players.map(player => (
                    <div 
                        key={player.player_id} 
                        className={`${styles.playerItem} ${selectedPlayer?.player_id === player.player_id ? styles.selected : ''}`}
                        onClick={() => handlePlayerSelect(player)}
                    >
                        <span>{player.player_name}</span>
                        <span>{player.team_title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MatchForm() {
    // Implement add, update, delete functionality for matches
    return <div>Match Form</div>;
}