"use client";
import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePathname } from 'next/navigation';
import styles from './Ticker.module.css';

const Ticker: React.FC = () => {
    const { settings } = useSettings();
    const pathname = usePathname();

    const isVisible = settings.tickerVisible && settings.tickerMessage && !pathname.startsWith('/admin');

    if (!isVisible) return null;

    // Duplicamos el mensaje suficientes veces para llenar pantallas anchas
    const messages = Array(10).fill(settings.tickerMessage);

    const speed = settings.tickerSpeed || 30;
    const bgColor = settings.tickerColor || settings.colors?.primary || '#E8A2A2';

    return (
        <div className={styles.tickerContainer} style={{ backgroundColor: bgColor }}>
            <div className={styles.tickerWrapper}>
                <div className={styles.tickerContent} style={{ animationDuration: `${speed}s` }}>
                    {messages.map((msg, i) => (
                        <span key={i} className={styles.tickerItem}>{msg}</span>
                    ))}
                    {/* Repetimos los mismos items para el loop infinito sin saltos */}
                    {messages.map((msg, i) => (
                        <span key={`dup-${i}`} className={styles.tickerItem}>{msg}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Ticker;
