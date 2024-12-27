'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function ShotsForm() {
    const [shots, setShots] = useState([]);
    const [formData, setFormData] = useState({
        shot_id: 0,
        match_id: 0,
        player_id: 0,
        minute: 0,
        x: 0,
        y: 0,
        xg: 0,
        result: '',
        situation: '',
        shotType: '',
        player_assisted: 0
  });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedShot, setSelectedShot] = useState(null);
    
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const SHOTS_PER_PAGE = 20;

  const shotListRef = useRef(null);

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

    const fetchShots = async (pageNum = 1, search = '') => {
         try {
             setLoading(true);
            const response = await fetch(
                `https://localhost:5001/shots?page=${pageNum}&search=${search}&limit=${SHOTS_PER_PAGE}`
            );
             if (!response.ok) {
                 const message = `An error has occurred: ${response.status}`;
                 throw new Error(message);
             }
           
             const data = await response.json();

           if (Array.isArray(data)) {
               if (pageNum === 1) {
                    setShots(data);
               } else {
                   setShots((prev) => [...prev, ...data]);
               }
              
             setHasMore(data.length === SHOTS_PER_PAGE);
         } else {
               setShots([]);
               setHasMore(false);
           }
           setLoading(false);
         } catch (error) {
            setError('Failed to fetch shots: ' + error.message);
           setLoading(false);
        }
    };


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

    if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchShots(1, value);
        }, 500);

    setSearchTimeout(timeoutId);
    };


    const handleScroll = () => {
        if (!shotListRef.current) return;
            if (scrollTimeout) clearTimeout(scrollTimeout);
        setScrollTimeout(
            setTimeout(() => {
            const { scrollTop, clientHeight, scrollHeight } = shotListRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                setPage((prev) => prev + 1);
                fetchShots(page + 1, searchTerm);
                }
            }, 200)
        );
    };


    useEffect(() => {
    fetchShots(1, searchTerm);
    }, []);


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'https://localhost:5001/shots';
                    method = 'POST';
                    break;
                case 'update':
                    url = `https://localhost:5001/shot/${formData.shot_id}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `https://localhost:5001/shot/${formData.shot_id}`;
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

        fetchShots(1, searchTerm);
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
                shot_id: 0,
                match_id: 0,
                player_id: 0,
                minute: 0,
                x: 0,
                y: 0,
                xg: 0,
                result: '',
                situation: '',
                shotType: '',
                 player_assisted: 0
            });
        setSelectedShot(null);
    };


   const handleShotSelect = (shot) => {
        setFormData(shot);
        setSelectedShot(shot);
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
                : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Shot`}
            </button>
            </form>
             <input
                type="text"
                className={styles.searchInput}
                placeholder="Search shot..."
                value={searchTerm}
                onChange={handleSearch}
            />
            <div
                className={styles.playerListContainer}
                onScroll={handleScroll}
                ref={shotListRef}
            >
                {shots && shots.map((shot) => (
                    <div
                        key={shot.shot_id}
                        className={`${styles.playerItem} ${
                        selectedShot?.shot_id === shot.shot_id
                            ? styles.selected
                            : ''
                        }`}
                        onClick={() => handleShotSelect(shot)}
                    >
                        <span>Match ID: {shot.match_id}</span>
                         <span>Player ID: {shot.player_id}</span>
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