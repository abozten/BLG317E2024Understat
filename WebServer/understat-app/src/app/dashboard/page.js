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
                const res = await fetch('http://localhost:5001/validate-session', {
                    credentials: 'include'  // Ensure cookies are included in the request
                });
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to validate session:', error);
                router.push('/login');
            }
        };

        validateSession();
    }, [router]);

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
            const response = await fetch('http://localhost:5001/teams');
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
                    url = 'http://localhost:5001/team';
                    method = 'POST';
                    break;
                case 'update':
                    url = `http://localhost:5001/team/${formData.team_name}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `http://localhost:5001/team/${formData.team_name}`;
                    method = 'DELETE';
                    break;
            }

            const response = await fetch(url, {
                method,
                headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
                body: operation !== 'delete' ? JSON.stringify(formData) : undefined
            });

            if (!response.ok) throw new Error('Operation failed');
            
            fetchTeams();
            resetForm();
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
                        value="add"
                        checked={operation === 'add'}
                        onChange={(e) => {
                            setOperation(e.target.value);
                            resetForm();
                        }}
                    /> Add
                </label>
                <label>
                    <input
                        type="radio"
                        value="update"
                        checked={operation === 'update'}
                        onChange={(e) => setOperation(e.target.value)}
                    /> Update
                </label>
                <label>
                    <input
                        type="radio"
                        value="delete"
                        checked={operation === 'delete'}
                        onChange={(e) => setOperation(e.target.value)}
                    /> Delete
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
    // Implement add, update, delete functionality for players
    return <div>Player Form</div>;
}

function MatchForm() {
    // Implement add, update, delete functionality for matches
    return <div>Match Form</div>;
}