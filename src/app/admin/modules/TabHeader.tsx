"use client";
import React from 'react';
import { Menu } from 'lucide-react';
import styles from '../admin.module.css';

interface TabHeaderProps {
    title: string;
    onMenuClick: () => void;
    children?: React.ReactNode;
}

const TabHeader: React.FC<TabHeaderProps> = ({ title, onMenuClick, children }) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerTitleGroup}>
                <button
                    className={styles.mobileMenuToggle}
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>
                <h1>{title}</h1>
            </div>
            {children}
        </header>
    );
};

export default TabHeader;
