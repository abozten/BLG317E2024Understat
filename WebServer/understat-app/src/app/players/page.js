// src/app/players.js

'use client';

import styles from './page.module.css';
import TopBar from '../components/TopBar';

export default function players() {
  return (
    <div>
      <TopBar />
      <div className={styles.container}>
        <h1>players</h1>
        <p>Welcome to the players page!This page list players and their rankings based on FUT and players data</p>
      </div>
    </div>
  );
}