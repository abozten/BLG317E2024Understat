'use client';
import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.css';

const FilterModal = ({ columns, onClose, onApply, initialFilters, allOptions }) => {
    const [filters, setFilters] = useState(initialFilters || {});
  const [selectedOptions, setSelectedOptions] = useState(initialFilters?.Team || [])


    useEffect(() => {
        setFilters(initialFilters || {});
        setSelectedOptions(initialFilters?.Team || []);
    }, [initialFilters])


    const handleInputChange = (column, type, value) => {
        setFilters(prevFilters => ({
                ...prevFilters,
            [column]: {
                    ...prevFilters[column],
                [type]: value === '' ? null : (isNaN(Number(value)) ? value : Number(value)),
            }
        }));
    };
  const handleTeamChange = (e) => {
       const value = e.target.value;
    if(selectedOptions.includes(value)){
         setSelectedOptions(selectedOptions.filter(opt=> opt!== value))
    } else {
        setSelectedOptions([...selectedOptions, value])
    }
  };
     const clearFilters = () => {
         setFilters({});
        setSelectedOptions([])
     };


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
                     {allOptions &&
                         <div  className={styles.filterRow}>
                          <label className={styles.columnLabel}>Team</label>
                             <div style={{overflowY:'auto', maxHeight:'200px', paddingRight:'10px'}}>
                                 {allOptions.map(team => (
                                     <div key={team} className={styles.checkbox}>
                                         <label >
                                             <input
                                             type="checkbox"
                                              value={team}
                                             checked={selectedOptions.includes(team)}
                                             onChange={handleTeamChange}
                                            />
                                         {team}
                                        </label>
                                     </div>
                                 ))}
                             </div>
                          </div>
                     }
                    {columns.filter(column => column !== "Team").map((column) => (
                        <div key={column} className={styles.filterRow}>
                            <label className={styles.columnLabel}>{column}</label>
                              <div style={{display:'flex', gap:'5px'}}>
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
                     <button className={styles.applyButton} onClick={() => onApply({...filters, Team:selectedOptions})}>Apply</button>
                 </div>
            </div>
        </div>
    );
};


export default FilterModal;