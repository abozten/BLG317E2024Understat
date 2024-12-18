'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import FilterModal from '../components/FilterModal';
import TopBar from '../components/TopBar'; // Import TopBar

const TeamTable = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({});
    const columns = ['Team', 'M', 'W', 'D', 'L', 'G', 'GA', 'PTS'];
    const [allTeamOptions, setAllTeamOptions] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('https://localhost:5001/teams/standings');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                 setTeams(data);
                    setAllTeamOptions(data.map(team => team.Team))
                setLoading(false);
            } catch (error) {
                 setError('Failed to fetch teams');
                 setLoading(false);
             }
        };

        fetchTeams();
    }, []);

     const handleApplyFilters = (newFilters) => {
         setFilters(newFilters);
         setShowFilterModal(false);
     };
   const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    const filterTeams = (teams) => {
          return teams.filter(team => {
           for (const column of columns) {
                const filter = filters[column];
               if (filter) {
                 if(column ==="Team" && filter.length > 0 && !filter.includes(team[column])){
                    return false
                 }
                  if(filter.min !== null && team[column] < filter.min) {
                    return false;
                   }
                  if (filter.max !== null && team[column] > filter.max) {
                       return false;
                   }
               }
           }
          return true;
       })
    }

        if (loading) {
        return <div>Loading teams...</div>;
    }

    if (error) {
        return <div style={{color:"red"}} >Error: {error}</div>;
    }
    const filteredTeams = filterTeams(teams);

    return (
      <>
        <TopBar />
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.tableTitle}>Table</div>
                 <button onClick={handleFilterClick} className={styles.filterButton}>OPTIONS</button>
              {showFilterModal && <FilterModal
                   columns={columns}
                    onClose={() => setShowFilterModal(false)}
                    onApply={handleApplyFilters}
                   initialFilters={filters}
                   allOptions={allTeamOptions}
                 />}
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                          <th className={styles.headerCell}>Nº</th>
                       {columns.map(column => (
                           <th key={column} className={styles.headerCell}>
                              {column}
                           </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                {filteredTeams.map((team, index) => (
                       <tr key={index} className={styles.row}>
                        <td className={styles.cell}>{index+1}</td>
                          {columns.map((column) => (
                            <td key={column} className={styles.cell}>
                               {team[column]}
                             </td>
                            ))}
                       </tr>
                ))}

                </tbody>
            </table>
        </div>
       </>
    );
};

export default TeamTable;
