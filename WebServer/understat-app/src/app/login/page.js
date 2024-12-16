'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('https://127.0.0.1:5001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors', 
            body: JSON.stringify({ email, password }),
        });

            if (response.ok) {
                router.push('/dashboard'); // Redirect to the dashboard page
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    return (
        <div className={styles['login-container']}>
            <div className={styles['login-card']}>
                <h2 className={styles['login-title']}>Admin Login</h2>
                <form className={styles['login-form']} onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.error} style={{marginBottom: '15px'}}>{error}</div>
                    )}
                    <div className={styles['input-group']}>
                        <input
                            type="email"
                            className={styles['login-input']}
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles['input-group']}>
                        <input
                            type="password"
                            className={styles['login-input']}
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles['login-button']}>
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}