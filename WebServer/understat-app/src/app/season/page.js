// src/app/season.js

'use client';

import styles from './page.module.css';
import TopBar from '../components/TopBar';

export default function season() {
  return (
    <div>
      <TopBar />
      <div className={styles.container}>
        <h1>season</h1>
        <p>Welcome to the season page!</p>
      </div>
    </div>
  );
}