// FilterModal2.js
import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.css';

const FilterModal2 = ({ filterableColumns, onClose, onApply, initialFilters }) => {
    const [filters, setFilters] = useState(initialFilters || {});
    const [allTeams, setAllTeams] = useState([]);
    useEffect(() => {
      if(initialFilters && initialFilters.allTeams){
           setAllTeams(initialFilters.allTeams);
      }
    },[initialFilters])
    const handleChange = (column, value, type, option) => {
      setFilters(prevFilters => {
        let updatedFilters = {...prevFilters};
    
        if (type === 'checkbox') {
          if (!updatedFilters[column]) {
            updatedFilters[column] = [];
          }
          if (value) {
           if (updatedFilters[column].includes(option)) {
             updatedFilters[column] = updatedFilters[column].filter(item => item !== option);
            }
            else{
              updatedFilters[column].push(option)
            }
          }
        }
       else if (type === 'range'){
         if(!updatedFilters[column]){
            updatedFilters[column] = {};
         }
         if (value !== '' ){
               updatedFilters[column] = { ...updatedFilters[column], ...value };
          }else {
                delete updatedFilters[column];
             }
         }
        else {
            updatedFilters[column] = value;
        }
        return updatedFilters
    });
    };

      const handleClear = () => {
        setFilters({});
    };
  

    const handleApply = () => {
        onApply(filters);
    };

    return (
      <div className={styles.modalOverlay}>
          <div className={styles.modal}>
              <div className={styles.header}>
                  <span className={styles.optionsText}>Filter Options</span>
                  <button onClick={onClose} className={styles.closeButton}>
                      <span className={styles.closeIcon}>✕</span>
                  </button>
              </div>
              <div className={styles.content}>
                  {Object.entries(filterableColumns).map(([column, { type, label, options }]) => (
                    <div key={column}>
                        {type === 'checkbox' && (
                          <div className={styles.checkbox}>
                              <label className={styles.columnLabel}>{label}</label>
                               <div >
                                  {(column === 'team_title' ? allTeams : options)?.map(option => (
                                    <label key={`${column}-${option}`} className={styles.checkbox}> {/* Make key unique */}
                                        <input
                                            type="checkbox"
                                            checked={filters[column]?.includes(option)}
                                            onChange={(e) => handleChange(column, e.target.checked, type, option)}
                                        />
                                       {option}
                                  </label>
                                  ))}
                              </div>
                          </div>
                         )}
                       {type === 'range' && (
                           <div className={styles.filterRow}>
                                <span className={styles.columnLabel}>{label}</span>
                               <input
                                  type="number"
                                  placeholder="Min"
                                  className={styles.inputField}
                                   value={filters[column]?.min || ''}
                                   onChange={(e) => handleChange(column, { min: e.target.value === "" ? null: parseFloat(e.target.value) }, type)}
                                />
                                  <input
                                      type="number"
                                      placeholder="Max"
                                      className={styles.inputField}
                                     value={filters[column]?.max || ''}
                                      onChange={(e) => handleChange(column, {max: e.target.value === "" ? null: parseFloat(e.target.value)}, type)}
                                 />
                            </div>
                       )}
                   </div>
                   ))}
                </div>
              <div className={styles.footer}>
                <button onClick={handleClear} className={styles.clearButton}>Clear</button>
                  <button onClick={handleApply} className={styles.applyButton}>Apply</button>
              </div>
          </div>
        </div>
    );
};

export default FilterModal2;