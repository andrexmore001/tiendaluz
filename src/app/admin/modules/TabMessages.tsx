"use client";
import React, { useState } from 'react';
import {
    MessageSquare,
    Trash2,
    User,
    Mail,
    Calendar,
    Search,
    ChevronDown,
    ChevronUp,
    Menu,
    RefreshCw
} from 'lucide-react';
import { useSettings, ContactMessage } from '@/context/SettingsContext';
import styles from '../admin.module.css';

interface TabMessagesProps {
    onMenuClick: () => void;
}

export default function TabMessages({ onMenuClick }: TabMessagesProps) {
    const { messages, deleteMessage, markMessageAsRead, refreshMessages } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshMessages();
        setTimeout(() => setIsRefreshing(false), 500); // Small delay to feel the click
    };

    const handleExpand = (id: string, isRead: boolean) => {
        if (expandedMessage === id) {
            setExpandedMessage(null);
        } else {
            setExpandedMessage(id);
            if (!isRead) {
                markMessageAsRead(id);
            }
        }
    };

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            deleteMessage(id);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <div className={styles.tabHeaderLeft}>
                    <button className={styles.mobileMenuBtn} onClick={onMenuClick}>
                        <Menu size={20} />
                    </button>
                    <div>
                        <h2>Mensajes de Contacto</h2>
                        <p className={styles.tabSubtitle}>{messages.length} mensajes recibidos</p>
                    </div>
                </div>
                <div className={styles.tabHeaderRight}>
                    <button
                        className={styles.refreshBtnLarge}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={18} className={isRefreshing ? styles.animateSpin : ''} />
                        <span>{isRefreshing ? 'Actualizando...' : 'Actualizar mensajes'}</span>
                    </button>
                    <div className={styles.searchBar}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o contenido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.messagesGrid}>
                {filteredMessages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} className={styles.emptyIcon} />
                        <h3>No hay mensajes</h3>
                        <p>Cuando alguien te escriba desde la web, aparecerá aquí.</p>
                    </div>
                ) : (
                    <div className={styles.messageList}>
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.messageCard} ${expandedMessage === msg.id ? styles.messageCardExpanded : ''} ${!msg.read ? styles.messageCardUnread : ''}`}
                                onClick={() => handleExpand(msg.id, msg.read)}
                            >
                                <div className={styles.messageTop}>
                                    <div className={styles.messageInfo}>
                                        <div className={styles.senderName}>
                                            <User size={16} />
                                            <span>{msg.name}</span>
                                            {!msg.read && <span className={styles.unreadDot} title="Nuevo mensaje" />}
                                        </div>
                                        <div className={styles.senderEmail}>
                                            <Mail size={14} />
                                            <span>{msg.email}</span>
                                        </div>
                                    </div>
                                    <div className={styles.messageMeta}>
                                        <div className={styles.messageDate}>
                                            <Calendar size={14} />
                                            <span>{formatDate(msg.createdAt)}</span>
                                        </div>
                                        <button
                                            className={styles.deleteBtnSmall}
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            title="Eliminar mensaje"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className={styles.expandIcon}>
                                            {expandedMessage === msg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.messagePreview}>
                                    <p>{expandedMessage === msg.id ? msg.message : msg.message.substring(0, 100) + (msg.message.length > 100 ? '...' : '')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
