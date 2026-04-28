"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Plus, Search, X, Edit2, Trash2, Phone, Mail, MapPin,
    Hash, FileText, ArrowRightLeft, TrendingUp, ChevronRight,
    Check, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { formatPrice } from '@/lib/format';
import styles from './TabCustomers.module.css';

interface Customer {
    id: string;
    name: string;
    nit?: string;
    phone?: string;
    email?: string;
    billingAddress?: string;
    shippingAddress?: string;
    notes?: string;
    createdAt: string;
    quotesCount: number;
    ordersCount: number;
    totalValue: number;
    quotes?: any[];
    orders?: any[];
}

const STAGE_COLORS: Record<string, string> = {
    LEAD: '#64748b', QUOTE: '#8B4B62', PROCESS: '#D4AF37',
    READY: '#10b981', DELIVERED: '#3b82f6',
};
const STAGE_LABELS: Record<string, string> = {
    LEAD: 'Lead', QUOTE: 'Cotización', PROCESS: 'En Proceso',
    READY: 'Listo', DELIVERED: 'Entregado',
};

const EMPTY: Customer = {
    id: '', name: '', nit: '', phone: '', email: '',
    billingAddress: '', shippingAddress: '', notes: '',
    createdAt: '', quotesCount: 0, ordersCount: 0, totalValue: 0,
};

export default function TabCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Customer | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [migrateResult, setMigrateResult] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/customers');
        if (res.ok) setCustomers(await res.json());
        setLoading(false);
    }, []);

    const fetchDetail = useCallback(async (id: string) => {
        setDetailLoading(true);
        const res = await fetch(`/api/customers/${id}`);
        if (res.ok) {
            const data = await res.json();
            setSelected(prev => prev ? { ...prev, ...data } : data);
        }
        setDetailLoading(false);
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY);
        setShowForm(true);
    };

    const openEdit = (c: Customer) => {
        setEditing(c);
        setForm(c);
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { id, quotesCount, ordersCount, totalValue, quotes, orders, ...data } = form;
        const res = editing
            ? await fetch(`/api/customers/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            : await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

        if (res.ok) {
            const saved = await res.json();
            if (editing) {
                setCustomers(p => p.map(c => c.id === saved.id ? { ...c, ...saved } : c));
                if (selected?.id === saved.id) setSelected(prev => prev ? { ...prev, ...saved } : saved);
            } else {
                setCustomers(p => [{ ...saved, quotesCount: 0, ordersCount: 0, totalValue: 0 }, ...p]);
            }
            setShowForm(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar al cliente "${name}"? Sus cotizaciones y pedidos no se borran, solo se desvinculan.`)) return;
        const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setCustomers(p => p.filter(c => c.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const handleSelect = (c: Customer) => {
        setSelected(c);
        fetchDetail(c.id);
    };

    const handleMigrate = async () => {
        if (!confirm('¿Crear clientes automáticamente desde el historial de cotizaciones?')) return;
        setMigrating(true);
        const res = await fetch('/api/customers/migrate', { method: 'POST' });
        const data = await res.json();
        setMigrateResult(data.message || 'Hecho');
        await fetchCustomers();
        setMigrating(false);
        setTimeout(() => setMigrateResult(null), 5000);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.nit || '').includes(search) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
    );

    return (
        <div className={styles.root}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.searchBar}>
                        <Search size={16} />
                        <input placeholder="Buscar por nombre, NIT, email, teléfono..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.migrateBtn} onClick={handleMigrate} disabled={migrating} title="Crear clientes automáticamente desde cotizaciones existentes">
                        {migrating ? <RefreshCw size={15} className={styles.spin} /> : <Zap size={15} />}
                        Importar desde Cotizaciones
                    </button>
                    <button className={styles.addBtn} onClick={openNew}><Plus size={16} />Nuevo Cliente</button>
                </div>
            </div>

            {migrateResult && (
                <div className={styles.migrateSuccess}>
                    <Check size={15} />{migrateResult}
                </div>
            )}

            {/* METRICS */}
            <div className={styles.metricsRow}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Total Clientes</span>
                    <span className={styles.metricVal}>{customers.length}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Con Cotizaciones</span>
                    <span className={styles.metricVal}>{customers.filter(c => c.quotesCount > 0).length}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Con Pedidos Activos</span>
                    <span className={styles.metricVal}>{customers.filter(c => c.ordersCount > 0).length}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Valor Total Pipeline</span>
                    <span className={`${styles.metricVal} ${styles.accent}`}>{formatPrice(customers.reduce((s, c) => s + c.totalValue, 0))}</span>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className={styles.layout}>
                {/* LIST */}
                <div className={styles.list}>
                    {loading && <div className={styles.loadingMsg}><RefreshCw size={18} className={styles.spin} />Cargando clientes...</div>}
                    {!loading && filtered.length === 0 && (
                        <div className={styles.empty}>
                            <Users size={40} />
                            <p>No hay clientes aún.</p>
                            <p className={styles.emptyHint}>Usa "Importar desde Cotizaciones" para crear clientes automáticamente desde el historial.</p>
                        </div>
                    )}
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            className={`${styles.card} ${selected?.id === c.id ? styles.cardActive : ''}`}
                            onClick={() => handleSelect(c)}
                        >
                            <div className={styles.cardMain}>
                                <div className={styles.avatar}>{c.name.charAt(0).toUpperCase()}</div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardName}>{c.name}</span>
                                    {c.nit && <span className={styles.cardNit}>NIT {c.nit}</span>}
                                    <div className={styles.cardMeta}>
                                        {c.phone && <span><Phone size={11} />{c.phone}</span>}
                                        {c.email && <span><Mail size={11} />{c.email}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statVal}>{c.quotesCount}</span>
                                    <span className={styles.statLabel}>Cotiz.</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={`${styles.statVal} ${styles.accent}`}>{formatPrice(c.totalValue)}</span>
                                    <span className={styles.statLabel}>Total</span>
                                </div>
                                <ChevronRight size={16} className={styles.arrow} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* DETAIL PANEL */}
                {selected && (
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelAvatar}>{selected.name.charAt(0).toUpperCase()}</div>
                            <div className={styles.panelTitle}>
                                <h2>{selected.name}</h2>
                                {selected.nit && <span>NIT {selected.nit}</span>}
                            </div>
                            <div className={styles.panelActions}>
                                <button className={styles.iconBtn} onClick={() => openEdit(selected)} title="Editar"><Edit2 size={15} /></button>
                                <button className={styles.iconBtnDanger} onClick={() => handleDelete(selected.id, selected.name)} title="Eliminar"><Trash2 size={15} /></button>
                                <button className={styles.iconBtn} onClick={() => setSelected(null)}><X size={16} /></button>
                            </div>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <FileText size={18} />
                                    <span className={styles.statBig}>{selected.quotesCount ?? 0}</span>
                                    <span>Cotizaciones</span>
                                </div>
                                <div className={styles.statCard}>
                                    <ArrowRightLeft size={18} />
                                    <span className={styles.statBig}>{selected.ordersCount ?? 0}</span>
                                    <span>Pedidos</span>
                                </div>
                                <div className={styles.statCard}>
                                    <TrendingUp size={18} />
                                    <span className={`${styles.statBig} ${styles.accent}`}>{formatPrice(selected.totalValue ?? 0)}</span>
                                    <span>Valor total</span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <section>
                                <label className={styles.sectionLabel}>CONTACTO</label>
                                <div className={styles.infoGrid}>
                                    {selected.phone && <div className={styles.infoRow}><Phone size={14} /><a href={`https://wa.me/57${(selected.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{selected.phone}</a></div>}
                                    {selected.email && <div className={styles.infoRow}><Mail size={14} /><a href={`mailto:${selected.email}`}>{selected.email}</a></div>}
                                    {selected.billingAddress && <div className={styles.infoRow}><MapPin size={14} /><span>{selected.billingAddress}</span></div>}
                                    {selected.shippingAddress && selected.shippingAddress !== selected.billingAddress && (
                                        <div className={styles.infoRow}><MapPin size={14} /><span>{selected.shippingAddress} (envío)</span></div>
                                    )}
                                    {!selected.phone && !selected.email && !selected.billingAddress && (
                                        <p className={styles.noInfo}>Sin información de contacto. <button onClick={() => openEdit(selected)}>Agregar →</button></p>
                                    )}
                                </div>
                            </section>

                            {/* Notes */}
                            {selected.notes && (
                                <section>
                                    <label className={styles.sectionLabel}>NOTAS</label>
                                    <p className={styles.notes}>{selected.notes}</p>
                                </section>
                            )}

                            {/* Orders History */}
                            {detailLoading ? (
                                <div className={styles.loadingMsg}><RefreshCw size={16} className={styles.spin} />Cargando historial...</div>
                            ) : (
                                <>
                                    {selected.orders && selected.orders.length > 0 && (
                                        <section>
                                            <label className={styles.sectionLabel}>PEDIDOS ({selected.orders.length})</label>
                                            <div className={styles.historyList}>
                                                {selected.orders.map(o => (
                                                    <div key={o.id} className={styles.historyItem}>
                                                        <div className={styles.historyItemLeft}>
                                                            <span className={styles.historyNum}>{o.orderNumber}</span>
                                                            <span
                                                                className={styles.historyStatus}
                                                                style={{ background: `${STAGE_COLORS[o.status]}18`, color: STAGE_COLORS[o.status] }}
                                                            >{STAGE_LABELS[o.status] || o.status}</span>
                                                        </div>
                                                        <span className={styles.historyAmt}>{formatPrice(o.total)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {selected.quotes && selected.quotes.length > 0 && (
                                        <section>
                                            <label className={styles.sectionLabel}>COTIZACIONES ({selected.quotes.length})</label>
                                            <div className={styles.historyList}>
                                                {selected.quotes.map(q => (
                                                    <div key={q.id} className={styles.historyItem}>
                                                        <div className={styles.historyItemLeft}>
                                                            <span className={styles.historyNum}>{q.quoteNumber}</span>
                                                            <span className={styles.historyDate}>{new Date(q.date).toLocaleDateString('es-CO')}</span>
                                                        </div>
                                                        <span className={styles.historyAmt}>{formatPrice(q.total)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FORM MODAL */}
            {showForm && (
                <div className={styles.overlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.field}>
                                    <label>Nombre / Empresa *</label>
                                    <input required placeholder="Ej: Empresa SAS" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className={styles.field}>
                                    <label>NIT / Identificación</label>
                                    <input placeholder="900.000.000-1" value={form.nit || ''} onChange={e => setForm({ ...form, nit: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.field}>
                                    <label>Teléfono</label>
                                    <input placeholder="300 123 4567" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className={styles.field}>
                                    <label>Email</label>
                                    <input type="email" placeholder="correo@empresa.com" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Dirección de Facturación</label>
                                <input placeholder="Calle 123, Ciudad" value={form.billingAddress || ''} onChange={e => setForm({ ...form, billingAddress: e.target.value })} />
                            </div>
                            <div className={styles.field}>
                                <label>Dirección de Envío</label>
                                <input placeholder="Igual que facturación o diferente" value={form.shippingAddress || ''} onChange={e => setForm({ ...form, shippingAddress: e.target.value })} />
                            </div>
                            <div className={styles.field}>
                                <label>Notas internas</label>
                                <textarea rows={3} placeholder="Preferencias, condiciones especiales..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button type="submit" className={styles.confirmBtn} disabled={saving}>
                                    {saving ? <RefreshCw size={15} className={styles.spin} /> : <Check size={15} />}
                                    {editing ? 'Guardar Cambios' : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
