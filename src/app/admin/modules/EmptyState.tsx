"use client";
import React from 'react';
import styles from '../admin.module.css';

interface EmptyStateProps {
    Icon: any;
    text: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ Icon, text }) => {
    return (
        <div className={styles.emptyState}>
            <Icon size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>{text}</p>
        </div>
    );
};

export default EmptyState;
