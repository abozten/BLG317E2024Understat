'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function SeasonForm() {
    const [seasons, setSeasons] = useState([]);
    const [formData, setFormData] = useState({
        seasonentryid: 0,
        team_id: 0,
        title: '',
        year: 0,
        xG: 0,
        xGA: 0,
        npxG: 0,
        npxGA: 0,
        scored: 0,
        missed: 0,
        wins: 0,
        draws: 0,
        loses: 0,
        pts: 0
  });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const SEASONS_PER_PAGE = 20;

  const seasonListRef = useRef(null);

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

    const fetchSeasons = async (pageNum = 1, search = '') => {
         try {
             setLoading(true);
            const response = await fetch(
                `https://localhost:5001/seasons?page=${pageNum}&search=${search}&limit=${SEASONS_PER_PAGE}`
            );
             if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
           
             const data = await response.json();

           if (Array.isArray(data)) {
               if (pageNum === 1) {
                    setSeasons(data);
               } else {
                   setSeasons((prev) => [...prev, ...data]);
               }
              
             setHasMore(data.length === SEASONS_PER_PAGE);
         } else {
               setSeasons([]);
               setHasMore(false);
           }
           setLoading(false);
         } catch (error) {
            setError('Failed to fetch seasons: ' + error.message);
           setLoading(false);
        }
    };


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

    if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchSeasons(1, value);
        }, 500);

    setSearchTimeout(timeoutId);
    };


    const handleScroll = () => {
        if (!seasonListRef.current) return;
            if (scrollTimeout) clearTimeout(scrollTimeout);
        setScrollTimeout(
            setTimeout(() => {
            const { scrollTop, clientHeight, scrollHeight } = seasonListRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                setPage((prev) => prev + 1);
                fetchSeasons(page + 1, searchTerm);
                }
            }, 200)
        );
    };


    useEffect(() => {
    fetchSeasons(1, searchTerm);
    }, []);


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'https://localhost:5001/seasons';
                    method = 'POST';
                    break;
                case 'update':
                    url = `https://localhost:5001/season/${formData.seasonentryid}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `https://localhost:5001/season/${formData.seasonentryid}`;
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

        fetchSeasons(1, searchTerm);
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
                seasonentryid: 0,
                team_id: 0,
                title: '',
                year: 0,
                xG: 0,
                xGA: 0,
                npxG: 0,
                npxGA: 0,
                scored: 0,
                missed: 0,
                wins: 0,
                draws: 0,
                loses: 0,
                pts: 0
              });
        setSelectedSeason(null);
    };


   const handleSeasonSelect = (season) => {
        setFormData(season);
        setSelectedSeason(season);
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
                : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Season`}
            </button>
      </form>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search season by teamID..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div
        className={styles.playerListContainer}
        onScroll={handleScroll}
        ref={seasonListRef}
      >
        {seasons && seasons.map((season) => (
          <div
            key={season.seasonentryid}
            className={`${styles.playerItem} ${
              selectedSeason?.seasonentryid === season.seasonentryid
                ? styles.selected
                : ''
            }`}
            onClick={() => handleSeasonSelect(season)}
          >
            <div className={styles.seasonInfo}>
              <span className={styles.teamId}>ID: {season.seasonentryid}</span>
              <span className={styles.teamId}>Team ID: {season.team_id}</span>
              <span className={styles.title}>{season.title}</span>
              <span className={styles.year}>{season.year}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.loadingIndicator} ${styles.loadingAnimation}`}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}