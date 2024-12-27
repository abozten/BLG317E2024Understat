'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Fut23Form from './fut23';

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
            'Content-Type': 'application/json',
          },
          mode: 'cors',
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
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleHome = () => {
        router.push('/');
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
       case 'fut23':
          return <Fut23Form />;
      default:
        return null;
    }
  };

    return (
      <div className={styles.dashboard}>
           <div style={{display:'flex'}}>
           <div className={styles.sidebar}>
             <div style={{display:'flex', justifyContent:'space-between'}}>
                  <button onClick={handleHome} className={styles.homeButton}>
                   <FontAwesomeIcon icon={faHome} />
                  </button>
                   <button onClick={handleLogout} className={styles.logoutButton}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
             </div>
               <button onClick={() => setSelectedSection('teams')}>Teams</button>
              <button onClick={() => setSelectedSection('players')}>Players</button>
              <button onClick={() => setSelectedSection('matches')}>Matches</button>
              <button onClick={() => setSelectedSection('fut23')}>FUT23 Data</button>
           </div>
          <div className={styles.content}>
             {renderForm()}
          </div>
           </div>
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

    updateDialPosition(); // Initial call to set the correct position

    return () => {
      radioButtons.forEach((radio) => {
        radio.removeEventListener('change', updateDialPosition);
      });
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

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
        body: operation !== 'delete' ? JSON.stringify(formData) : undefined,
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
                onChange={(e) =>
                  setFormData({ ...formData, team_name: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Team ID:</label>
              <input
                type="text"
                value={formData.team_id}
                onChange={(e) =>
                  setFormData({ ...formData, team_id: e.target.value })
                }
                required
              />
            </div>
          </>
        )}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading
            ? 'Processing...'
            : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Team`}
        </button>
      </form>

      <div className={styles.teamList}>
        {teams.map((team) => (
          <div
            key={team.team_id}
            className={`${styles.teamItem} ${
              selectedTeam?.team_id === team.team_id ? styles.selected : ''
            }`}
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
    year: 0,
  });
  const [operation, setOperation] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Add these state variables
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [scrollTimeout, setScrollTimeout] = useState(null); // Added scroll timeout state
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

    updateDialPosition(); // Initial call to set the correct position

    return () => {
      radioButtons.forEach((radio) => {
        radio.removeEventListener('change', updateDialPosition);
      });
    };
  }, []);
  // Update fetchPlayers function
  const fetchPlayers = async (pageNum = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://localhost:5001/players?page=${pageNum}&search=${search}&limit=${PLAYERS_PER_PAGE}`
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

  // Add search handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeout) clearTimeout(searchTimeout);

    // Set new timeout for debouncing
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchPlayers(1, value);
    }, 500);

    setSearchTimeout(timeoutId);
  };

  // Add infinite scroll handler
  const handleScroll = () => {
    if (!playerListRef.current) return;

    // Debounce the scroll event
    if (scrollTimeout) clearTimeout(scrollTimeout);
    setScrollTimeout(
      setTimeout(() => {
        const { scrollTop, clientHeight, scrollHeight } = playerListRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
          setPage((prev) => prev + 1);
          fetchPlayers(page + 1, searchTerm);
        }
      }, 200) // Small delay of 200ms
    );
  };

  // Update useEffect
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
      year: 0,
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
                  step={key.includes('xG') || key.includes('xA') ? '0.01' : '1'}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [key]:
                        typeof formData[key] === 'number'
                          ? parseFloat(e.target.value) >= 0
                            ? parseFloat(e.target.value)
                            : 0 // Prevent negative
                          : e.target.value,
                    })
                  }
                  required
                  min={key !== 'year' ? '0' : '2000'} // Prevent negative for stats, set min for year
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
            <span>{player.player_name}</span>
            <span>{player.team_title}</span>
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

function MatchForm() {
  const [matches, setMatches] = useState([]);
  const [formData, setFormData] = useState({
    match_id: '',
    isResult: false,
    datetime: '',
    h_id: '',
    h_title: '',
    h_short_title: '',
    a_id: '',
    a_title: '',
    a_short_title: '',
    goals_h: 0,
    goals_a: 0,
    xG_h: 0,
    xG_a: 0,
    forecast_w: 0,
    forecast_d: 0,
    forecast_l: 0,
  });
  const [operation, setOperation] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const MATCHES_PER_PAGE = 20;

  const matchListRef = useRef(null);
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
  }, [styles.operations]);

  const fetchMatches = async (
    pageNum = 1,
    search = '',
    startDate = '',
    endDate = ''
  ) => {
    try {
      setLoading(true);
      let url = `https://localhost:5001/matches/search?page=${pageNum}&search=${search}&limit=${MATCHES_PER_PAGE}`;
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        if (pageNum === 1) {
          setMatches(data);
        } else {
          setMatches((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === MATCHES_PER_PAGE);
      } else {
        setMatches([]);
        setHasMore(false);
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch matches: ' + error.message);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchMatches(1, value, startDate, endDate);
    }, 500);

    setSearchTimeout(timeoutId);
  };

  const handleScroll = () => {
    if (!matchListRef.current) return;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    setScrollTimeout(
      setTimeout(() => {
        const { scrollTop, clientHeight, scrollHeight } = matchListRef.current;
        if (
          scrollHeight - scrollTop <= clientHeight * 1.5 &&
          !loading &&
          hasMore
        ) {
          setPage((prev) => prev + 1);
          fetchMatches(page + 1, searchTerm, startDate, endDate);
        }
      }, 200)
    );
  };

  useEffect(() => {
    fetchMatches(1, searchTerm, startDate, endDate);
  }, [searchTerm, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url, method;
      switch (operation) {
        case 'add':
          url = 'https://localhost:5001/matches';
          method = 'POST';
          break;
        case 'update':
          url = `https://localhost:5001/matches/${formData.match_id}`;
          method = 'PUT';
          break;
        case 'delete':
          url = `https://localhost:5001/matches/${formData.match_id}`;
          method = 'DELETE';
          break;
      }
      const formattedFormData = {
        ...formData,
        datetime: formData.datetime ? new Date(formData.datetime).toISOString() : null,
      };

      const response = await fetch(url, {
        method,
        headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
        body: operation !== 'delete' ? JSON.stringify(formattedFormData) : undefined,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Operation failed');
      }

      fetchMatches(1, searchTerm, startDate, endDate);
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
      match_id: '',
      isResult: false,
      datetime: '',
      h_id: '',
      h_title: '',
      h_short_title: '',
      a_id: '',
      a_title: '',
      a_short_title: '',
      goals_h: 0,
      goals_a: 0,
      xG_h: 0,
      xG_a: 0,
      forecast_w: 0,
      forecast_d: 0,
      forecast_l: 0,
    });
    setSelectedMatch(null);
  };

  const handleMatchSelect = (match) => {
    const formattedDate = match.datetime ? new Date(match.datetime).toISOString().slice(0, 19) : '';
    setFormData({ ...match, datetime: formattedDate });
    setSelectedMatch(match);
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
            {Object.keys(formData).map((key) => (
              <div className={styles.formGroup} key={key}>
                <label>{key.replace('_', ' ').toUpperCase()}:</label>
                {key === 'datetime' ? (
                  <input
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) =>
                      setFormData({ ...formData, datetime: e.target.value })
                    }
                    required
                  />
                ) : (
                  <input
                    type={
                      key === 'isResult'
                        ? 'checkbox'
                        : typeof formData[key] === 'number' &&
                          !['h_title', 'h_short_title', 'a_title', 'a_short_title'].includes(key)
                        ? 'number'
                        : 'text'
                    }
                    step={
                      key.includes('xG') || key.includes('forecast')
                        ? '0.000001'
                        : 'any'
                    }
                    value={key === 'isResult' ? formData[key] : formData[key]}
                    checked={key === 'isResult' ? formData[key] : undefined}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]:
                          key === 'isResult'
                            ? e.target.checked
                            : typeof formData[key] === 'number' &&
                              !['h_title', 'h_short_title', 'a_title', 'a_short_title'].includes(key)
                            ? Math.max(0, parseFloat(e.target.value)) || 0
                            : e.target.value,
                      })
                    }
                    required
                    min={
                      typeof formData[key] === 'number' &&
                      !['h_title', 'h_short_title', 'a_title', 'a_short_title'].includes(key)
                        ? '0'
                        : undefined
                    }
                  />
                )}
              </div>
            ))}
          </>
        )}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading
            ? 'Processing...'
            : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Match`}
        </button>
      </form>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search match..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="date"
          className={styles.searchInput}
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className={styles.searchInput}
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div
        className={styles.playerListContainer}
        onScroll={handleScroll}
        ref={matchListRef}
      >
        {matches.map((match) => (
          <div
            key={match.match_id}
            className={`${styles.playerItem} ${
              selectedMatch?.match_id === match.match_id ? styles.selected : ''
            }`}
            onClick={() => handleMatchSelect(match)}
          >
            <span>
              {match.h_title} vs {match.a_title}{' '}
            </span>
            <span>{match.datetime}</span>
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