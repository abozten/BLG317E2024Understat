'use client';
import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.css';

const FilterModal2 = ({ columns, onClose, onApply, initialFilters }) => {
    const [filters, setFilters] = useState(initialFilters || {});
    const [selectedTeams, setSelectedTeams] = useState(initialFilters?.team || []);
    const [selectedPositions, setSelectedPositions] = useState(initialFilters?.position || []);

    useEffect(() => {
        setFilters(initialFilters || {});
        setSelectedTeams(initialFilters?.team || []);
        setSelectedPositions(initialFilters?.position || []);
    }, [initialFilters]);

    const handleInputChange = (column, type, value) => {
      setFilters(prevFilters => {
          const updatedFilters = {...prevFilters};
            if(!updatedFilters[column]){
               updatedFilters[column] = {}
            }
            updatedFilters[column][type] = value === '' ? null : (isNaN(Number(value)) ? value : Number(value));
          return updatedFilters
          })
    };


    const handleTeamChange = (e) => {
        const value = e.target.value;
        setSelectedTeams(prevTeams =>
            prevTeams.includes(value) ? prevTeams.filter(team => team !== value) : [...prevTeams, value]
        );
    };
    const handlePositionChange = (e) => {
        const value = e.target.value;
         setSelectedPositions(prevPos =>
            prevPos.includes(value) ? prevPos.filter(pos => pos !== value) : [...prevPos, value]
        );
    };

    const clearFilters = () => {
      setFilters({});
      setSelectedTeams([]);
      setSelectedPositions([]);
    };


    const availablePositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.optionsText}>OPTIONS</div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <span className={styles.closeIcon}>×</span>
                    </button>
                </div>
                <div className={styles.content}>
                 <div className={styles.filterRow}>
                        <label className={styles.columnLabel}>Team</label>
                        <div style={{ overflowY: 'auto', maxHeight: '200px', paddingRight: '10px' }}>
                            {filters?.allTeams?.map(team => (
                                <div key={team} className={styles.checkbox}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={team}
                                            checked={selectedTeams.includes(team)}
                                            onChange={handleTeamChange}
                                        />
                                        {team}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterRow}>
                        <label className={styles.columnLabel}>Position</label>
                        <div style={{ overflowY: 'auto', maxHeight: '150px', paddingRight: '10px' }}>
                            {availablePositions.map(position => (
                                <div key={position} className={styles.checkbox}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={position}
                                            checked={selectedPositions.includes(position)}
                                            onChange={handlePositionChange}
                                        />
                                        {position}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {columns
                        .filter(column => column !== "Team" && column !== "position" )
                        .map(column => (
                            <div key={column} className={styles.filterRow}>
                                <label className={styles.columnLabel}>{column}</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="min"
                                        value={filters[column]?.min || ''}
                                        onChange={(e) => handleInputChange(column, 'min', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="max"
                                        value={filters[column]?.max || ''}
                                        onChange={(e) => handleInputChange(column, 'max', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
                <div className={styles.footer}>
                    <button className={styles.clearButton} onClick={clearFilters}>Clear filters</button>
                    <button className={styles.applyButton} onClick={() => onApply({...filters, team: selectedTeams, position: selectedPositions})}>Apply</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal2;