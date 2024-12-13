// src/app/teampage.js

'use client';

import styles from './page.module.css';
import TopBar from '../components/TopBar';

export default function team() {
  return (
    <div>
      <TopBar />
      <div className={styles.container}>
        <h1>Teams Page</h1>
        <p>Welcome to the teams page!</p>
      </div>
    </div>
  );
}