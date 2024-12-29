'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function MatchinfoForm() {
    const [matchInfos, setMatchInfos] = useState([]);
    const [formData, setFormData] = useState({
        fid: 0,
        match_id: 0,
        a: 0,
        a_deep: 0,
        a_goals: 0,
        a_ppda: 0,
        a_shot: 0,
        a_shotOnTarget: 0,
        a_xg: 0,
        date: "",
        h: 0,
        h_d: 0,
        h_deep: 0,
        h_goals: 0,
        h_l: 0,
        h_ppda: 0,
        h_shot: 0,
        h_shotOnTarget: 0,
        h_w: 0,
        h_xg: 0,
        league: "",
        league_id: 0,
        season: 0,
        team_a: "",
        team_h: ""
    });
    const [operation, setOperation] = useState('add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMatchInfo, setSelectedMatchInfo] = useState(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [scrollTimeout, setScrollTimeout] = useState(null);
    const MATCHINFOS_PER_PAGE = 20;

    const matchInfoListRef = useRef(null);

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

    const fetchMatchInfos = async (pageNum = 1, search = '') => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/match_infos?page=${pageNum}&search=${search}&limit=${MATCHINFOS_PER_PAGE}`
            );
            const data = await response.json();

            if (pageNum === 1) {
                setMatchInfos(data);
            } else {
                setMatchInfos((prev) => [...prev, ...data]);
            }

            setHasMore(data.length === MATCHINFOS_PER_PAGE);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch matchInfos');
            setLoading(false);
        }
    };


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(() => {
            setPage(1);
            fetchMatchInfos(1, value);
        }, 500);

        setSearchTimeout(timeoutId);
    };


    const handleScroll = () => {
        if (!matchInfoListRef.current) return;
        if (scrollTimeout) clearTimeout(scrollTimeout);
        setScrollTimeout(
            setTimeout(() => {
                const { scrollTop, clientHeight, scrollHeight } = matchInfoListRef.current;
                if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
                    setPage((prev) => prev + 1);
                    fetchMatchInfos(page + 1, searchTerm);
                }
            }, 200)
        );
    };


    useEffect(() => {
        fetchMatchInfos(1, searchTerm);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url, method;
            switch (operation) {
                case 'add':
                    url = 'http://localhost:5001/match_infos';
                    method = 'POST';
                    break;
                case 'update':
                    url = `http://localhost:5001/match_infos/${formData.match_id}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    url = `http://localhost:5001/match_infos/${formData.match_id}`;
                    method = 'DELETE';
                    break;
            }

            console.log("asdf match info data:", url, method, formData)
            const response = await fetch(url, {
                method,
                headers: operation !== 'delete' ? { 'Content-Type': 'application/json' } : {},
                body: operation !== 'delete' ? JSON.stringify(formData) : undefined,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Operation failed');
            }

            fetchMatchInfos(1, searchTerm);
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
            fid: 0,
            match_id: 0,
            a: 0,
            a_deep: 0,
            a_goals: 0,
            a_ppda: 0,
            a_shot: 0,
            a_shotOnTarget: 0,
            a_xg: 0,
            date: "",
            h: 0,
            h_d: 0,
            h_deep: 0,
            h_goals: 0,
            h_l: 0,
            h_ppda: 0,
            h_shot: 0,
            h_shotOnTarget: 0,
            h_w: 0,
            h_xg: 0,
            league: "",
            league_id: 0,
            season: 0,
            team_a: "",
            team_h: ""
        });
        setSelectedMatchInfo(null);
    };

    const handleMatchInfoSelect = (matchInfo) => {
        setFormData({
            fid: matchInfo.fid || 0,
            match_id: matchInfo.match_id || 0,
            a: matchInfo.a || 0,
            a_deep: matchInfo.a_deep || 0,
            a_goals: matchInfo.a_goals || 0,
            a_ppda: matchInfo.a_ppda || 0,
            a_shot: matchInfo.a_shot || 0,
            a_shotOnTarget: matchInfo.a_shotOnTarget || 0,
            a_xg: matchInfo.a_xg || 0,
            date: matchInfo.date || '',
            h: matchInfo.h || 0,
            h_d: matchInfo.h_d || 0,
            h_deep: matchInfo.h_deep || 0,
            h_goals: matchInfo.h_goals || 0,
            h_l: matchInfo.h_l || 0,
            h_ppda: matchInfo.h_ppda || 0,
            h_shot: matchInfo.h_shot || 0,
            h_shotOnTarget: matchInfo.h_shotOnTarget || 0,
            h_w: matchInfo.h_w || 0,
            h_xg: matchInfo.h_xg || 0,
            league: matchInfo.league || '',
            league_id: matchInfo.league_id || 0,
            season: matchInfo.season || 0,
            team_a: matchInfo.team_a || '',
            team_h: matchInfo.team_h || ""
        });
        setSelectedMatchInfo(matchInfo);
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

                                {key === 'date' ? (
                                    <input
                                        type="datetime-local"
                                        value={formData.datetime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        required
                                    />
                                ) : (<input
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
                                )}
                            </div>
                        ))}
                    </>
                )}
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading
                        ? 'Processing...'
                        : `${operation.charAt(0).toUpperCase() + operation.slice(1)} MatchInfo`}
                </button>
            </form>
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Search Match Info..."
                value={searchTerm}
                onChange={handleSearch}
            />


            <div
                className={styles.playerListContainer}
                onScroll={handleScroll}
                ref={matchInfoListRef}
            >
                {matchInfos.map((matchInfo) => (
                    <div
                        key={matchInfo.fid}
                        className={`${styles.playerItem} ${selectedMatchInfo?.fid === matchInfo.fid
                            ? styles.selected
                            : ''
                            }`}
                        onClick={() => handleMatchInfoSelect(matchInfo)}
                    >
                        <span>{matchInfo.match_id}</span>
                        <span>{matchInfo.team_h}</span>
                        <span>{matchInfo.team_a}</span>
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
