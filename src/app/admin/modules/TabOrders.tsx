"use client";
import React, { useState, useEffect } from 'react';
import styles from './TabOrders.module.css';
import { 
    Search, 
    Plus, 
    MoreVertical, 
    MessageSquare, 
    Clock, 
    User, 
    Phone, 
    Mail, 
    ChevronRight,
    ArrowRightLeft,
    Trash2,
    X
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface OrderNote {
    id: string;
    content: string;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    total: number;
    items?: any;
    notes: OrderNote[];
    createdAt: string;
    updatedAt: string;
}

const STAGES = [
    { id: 'LEAD', name: 'Lead / Interesado', color: '#64748b' },
    { id: 'QUOTE', name: 'Cotización', color: '#8B4B62' },
    { id: 'PROCESS', name: 'En Proceso', color: '#D4AF37' },
    { id: 'READY', name: 'Listo / Envío', color: '#10b981' },
    { id: 'DELIVERED', name: 'Entregado', color: '#3b82f6' }
];

export default function TabOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newNote, setNewNote] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [newOrderData, setNewOrderData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        total: 0,
        status: 'LEAD'
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
                if (selectedOrder?.id === orderId) setSelectedOrder(updated);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !newNote.trim()) return;

        setIsSavingNote(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrder.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote })
            });
            if (res.ok) {
                const note = await res.json();
                const updatedOrder = {
                    ...selectedOrder,
                    notes: [note, ...selectedOrder.notes],
                    updatedAt: new Date().toISOString()
                };
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
                setSelectedOrder(updatedOrder);
                setNewNote('');
            }
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrderData)
            });
            if (res.ok) {
                const order = await res.json();
                setOrders(prev => [order, ...prev]);
                setShowNewOrderModal(false);
                setNewOrderData({ customerName: '', customerPhone: '', customerEmail: '', total: 0, status: 'LEAD' });
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== id));
                if (selectedOrder?.id === id) setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const filteredOrders = orders.filter(o => 
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getOrdersByStage = (stageId: string) => filteredOrders.filter(o => o.status === stageId);

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Hace ${days} d`;
        if (hours > 0) return `Hace ${hours} h`;
        return `Hace ${minutes} m`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchBar}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente o # pedido..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className={styles.addButton} onClick={() => setShowNewOrderModal(true)}>
                    <Plus size={18} />
                    <span>Nuevo Pedido</span>
                </button>
            </div>

            <div className={styles.kanbanBoard}>
                {STAGES.map(stage => (
                    <div key={stage.id} className={styles.column}>
                        <div className={styles.columnHeader}>
                            <div className={styles.columnTitle}>
                                <span className={styles.stageDot} style={{ backgroundColor: stage.color }}></span>
                                <h3>{stage.name}</h3>
                                <span className={styles.count}>{getOrdersByStage(stage.id).length}</span>
                            </div>
                        </div>

                        <div className={styles.cardList}>
                            {getOrdersByStage(stage.id).map(order => (
                                <div 
                                    key={order.id} 
                                    className={`${styles.card} ${selectedOrder?.id === order.id ? styles.cardActive : ''}`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={styles.orderNumber}>{order.orderNumber}</span>
                                        <span className={styles.timeAgo}>{getTimeAgo(order.updatedAt)}</span>
                                    </div>
                                    <h4 className={styles.customerName}>{order.customerName}</h4>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.amount}>{formatPrice(order.total)}</span>
                                        {order.notes.length > 0 && (
                                            <div className={styles.noteIndicator}>
                                                <MessageSquare size={12} />
                                                <span>{order.notes.length}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* SIDE PANEL FOR ORDER DETAILS */}
            {selectedOrder && (
                <div className={styles.sidePanelOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.sidePanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{selectedOrder.orderNumber}</h2>
                                <p className={styles.panelSubtitle}>{selectedOrder.customerName}</p>
                            </div>
                            <button className={styles.closePanel} onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.panelContent}>
                            <div className={styles.section}>
                                <h3>Estado del Pedido</h3>
                                <div className={styles.statusGrid}>
                                    {STAGES.map(s => (
                                        <button 
                                            key={s.id}
                                            className={`${styles.statusBtn} ${selectedOrder.status === s.id ? styles.statusBtnActive : ''}`}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, s.id)}
                                            style={{ '--active-color': s.color } as any}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Información del Cliente</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <User size={16} />
                                        <span>{selectedOrder.customerName}</span>
                                    </div>
                                    {selectedOrder.customerPhone && (
                                        <div className={styles.infoItem}>
                                            <Phone size={16} />
                                            <a href={`https://wa.me/57${selectedOrder.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                {selectedOrder.customerPhone}
                                            </a>
                                        </div>
                                    )}
                                    {selectedOrder.customerEmail && (
                                        <div className={styles.infoItem}>
                                            <Mail size={16} />
                                            <span>{selectedOrder.customerEmail}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoItem}>
                                        <Clock size={16} />
                                        <span>Creado: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h3>Bitácora de Observaciones</h3>
                                    <span className={styles.noteCount}>{selectedOrder.notes.length}</span>
                                </div>
                                
                                <form onSubmit={handleAddNote} className={styles.noteForm}>
                                    <textarea 
                                        placeholder="Escribe una observación..." 
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        rows={3}
                                    />
                                    <button type="submit" disabled={isSavingNote || !newNote.trim()}>
                                        {isSavingNote ? 'Guardando...' : 'Añadir Nota'}
                                    </button>
                                </form>

                                <div className={styles.notesTimeline}>
                                    {selectedOrder.notes.map(note => (
                                        <div key={note.id} className={styles.noteItem}>
                                            <div className={styles.noteHeader}>
                                                <span className={styles.noteDate}>{new Date(note.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className={styles.noteContent}>{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.panelFooter}>
                                <button className={styles.deleteBtn} onClick={() => handleDeleteOrder(selectedOrder.id)}>
                                    <Trash2 size={16} />
                                    <span>Eliminar Pedido</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW ORDER MODAL */}
            {showNewOrderModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNewOrderModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nuevo Pedido</h2>
                            <button onClick={() => setShowNewOrderModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateOrder} className={styles.modalForm}>
                            <div className={styles.inputGroup}>
                                <label>Nombre del Cliente</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newOrderData.customerName}
                                    onChange={(e) => setNewOrderData({...newOrderData, customerName: e.target.value})}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label>Teléfono</label>
                                    <input 
                                        type="text" 
                                        value={newOrderData.customerPhone}
                                        onChange={(e) => setNewOrderData({...newOrderData, customerPhone: e.target.value})}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Total Estimado</label>
                                    <input 
                                        type="number" 
                                        value={newOrderData.total}
                                        onChange={(e) => setNewOrderData({...newOrderData, total: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={newOrderData.customerEmail}
                                    onChange={(e) => setNewOrderData({...newOrderData, customerEmail: e.target.value})}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Estado Inicial</label>
                                <select 
                                    value={newOrderData.status}
                                    onChange={(e) => setNewOrderData({...newOrderData, status: e.target.value})}
                                >
                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowNewOrderModal(false)}>Cancelar</button>
                                <button type="submit" className={styles.confirmBtn}>Crear Pedido</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
