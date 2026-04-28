"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from 'recharts';
import { Search, Plus, MessageSquare, Clock, User, Phone, Mail, X, Trash2, TrendingUp, BarChart2, AlertCircle, Package, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import styles from './TabOrders.module.css';

interface OrderNote { id: string; content: string; createdAt: string; }
interface OrderItem { name: string; qty: number; price: number; }
interface Order {
  id: string; orderNumber: string; status: string;
  customerName: string; customerEmail?: string; customerPhone?: string;
  total: number; items?: OrderItem[]; notes: OrderNote[];
  createdAt: string; updatedAt: string; customerId?: string;
  source?: string;
}
interface Analytics {
  totalPipeline: number; avgTicket: number; conversionRate: number;
  totalActive: number; totalDelivered: number;
  byStage: { stage: string; label: string; count: number; total: number }[];
  revenueMonthly: { month: string; label: string; total: number }[];
  topCustomers: { name: string; total: number }[];
  avgDaysInPipeline: number;
}

const STAGES = [
  { id: 'LEAD', name: 'Lead', color: '#64748b', emoji: '🎯' },
  { id: 'QUOTE', name: 'Cotización', color: '#8B4B62', emoji: '📋' },
  { id: 'PROCESS', name: 'En Proceso', color: '#D4AF37', emoji: '⚙️' },
  { id: 'READY', name: 'Listo', color: '#10b981', emoji: '📦' },
  { id: 'DELIVERED', name: 'Entregado', color: '#3b82f6', emoji: '✅' },
];

const STAGE_COLORS: Record<string, string> = STAGES.reduce((acc, s) => ({ ...acc, [s.id]: s.color }), {});

const INACTIVITY_WARN = 3;
const INACTIVITY_DANGER = 7;

function getDaysInactive(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function getTimeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

export default function TabOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'analytics'>('kanban');
  const [search, setSearch] = useState('');
  const [filterInactive, setFilterInactive] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);
  const [editedTotal, setEditedTotal] = useState(0);
  const [showItems, setShowItems] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerName: '', customerCompany: '', customerPhone: '', customerEmail: '', total: 0, status: 'LEAD', source: 'whatsapp' });
  const [customerHistory, setCustomerHistory] = useState<{quotes: any[], orders: any[]}|null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showLostPrompt, setShowLostPrompt] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  const fetchCustomerSuggestions = async (q: string) => {
    if (q.length < 1) { setCustomerSuggestions([]); return; }
    try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
        if (res.ok) setCustomerSuggestions(await res.json());
    } catch { /* ignore */ }
  };

  const applyCustomer = (c: any) => {
      setNewOrder(prev => ({
          ...prev,
          customerName: c.name,
          customerCompany: c.companyName || prev.customerCompany,
          customerEmail: c.email || prev.customerEmail,
          customerPhone: c.phone || prev.customerPhone,
      }));
      setCustomerSuggestions([]);
      setShowCustomerSuggestions(false);
  };

  const fetchCustomerHistory = async (customerId?: string) => {
    if (!customerId) {
        setCustomerHistory(null);
        return;
    }
    setLoadingHistory(true);
    try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (res.ok) {
            const data = await res.json();
            setCustomerHistory({ quotes: data.quotes || [], orders: data.orders || [] });
        }
    } catch { /* ignore */ }
    setLoadingHistory(false);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
    setLoading(false);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch('/api/orders/analytics');
    const data = await res.json();
    setAnalytics(data);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (view === 'analytics') fetchAnalytics(); }, [view, fetchAnalytics]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) {
      const updated = await res.json();
      setOrders(p => p.map(o => o.id === id ? updated : o));
      if (selectedOrder?.id === id) setSelectedOrder(updated);
    }
  };

  const updateTotal = async (id: string, total: number) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ total }) });
    if (res.ok) {
      const updated = await res.json();
      setOrders(p => p.map(o => o.id === id ? updated : o));
      setSelectedOrder(updated);
      setEditingTotal(false);
    }
  };

  const updateSource = async (id: string, source: string) => {
    const res = await fetch(`/api/orders/${id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ source }) 
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(p => p.map(o => o.id === id ? updated : o));
      if (selectedOrder?.id === id) setSelectedOrder(updated);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newNote.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/orders/${selectedOrder.id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newNote }) });
    if (res.ok) {
      const note = await res.json();
      const updated = { ...selectedOrder, notes: [note, ...selectedOrder.notes] };
      setOrders(p => p.map(o => o.id === selectedOrder.id ? updated : o));
      setSelectedOrder(updated);
      setNewNote('');
    }
    setSavingNote(false);
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
    if (res.ok) {
      const o = await res.json();
      setOrders(p => [o, ...p]);
      setShowNewModal(false);
      setNewOrder({ customerName: '', customerCompany: '', customerPhone: '', customerEmail: '', total: 0, status: 'LEAD', source: 'whatsapp' });
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setOrders(p => p.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const order = orders.find(o => o.id === draggableId);
    if (order && order.status !== newStatus) updateStatus(draggableId, newStatus);
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchInactive = !filterInactive || getDaysInactive(o.updatedAt) >= INACTIVITY_WARN;
    const isNotLost = o.status !== 'LOST';
    
    let matchDate = true;
    if (dateFilter !== 'all') {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        if (dateFilter === 'today') {
            matchDate = orderDate >= today;
        } else if (dateFilter === 'week') {
            const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Lunes
            matchDate = orderDate >= firstDay;
        } else if (dateFilter === 'month') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            matchDate = orderDate >= firstDay;
        } else if (dateFilter === 'custom') {
            if (customDateRange.start) {
                matchDate = matchDate && orderDate >= new Date(customDateRange.start + 'T00:00:00');
            }
            if (customDateRange.end) {
                matchDate = matchDate && orderDate <= new Date(customDateRange.end + 'T23:59:59');
            }
        }
    }

    return matchSearch && matchInactive && isNotLost && matchDate;
  });

  const byStage = (stageId: string) => filtered.filter(o => o.status === stageId);
  const stageTotal = (stageId: string) => byStage(stageId).reduce((s, o) => s + o.total, 0);
  const totalPipeline = orders.filter(o => o.status !== 'DELIVERED').reduce((s, o) => s + o.total, 0);
  const totalActive = orders.filter(o => o.status !== 'DELIVERED').length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;
  const convRate = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;
  const avgTicket = totalActive > 0 ? totalPipeline / totalActive : 0;

  return (
    <div className={styles.root}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.viewToggle}>
            <button className={view === 'kanban' ? styles.viewBtnActive : styles.viewBtn} onClick={() => setView('kanban')}><BarChart2 size={16} />Kanban</button>
            <button className={view === 'analytics' ? styles.viewBtnActive : styles.viewBtn} onClick={() => setView('analytics')}><TrendingUp size={16} />Analítica</button>
          </div>
          <div className={styles.searchBar}>
            <Search size={16} />
            <input placeholder="Buscar cliente o # pedido..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
          >
              <option value="all">📅 Todo el tiempo</option>
              <option value="today">📅 Hoy</option>
              <option value="week">📅 Esta semana</option>
              <option value="month">📅 Este mes</option>
              <option value="custom">📅 Rango personalizado</option>
          </select>
          {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="date" value={customDateRange.start} onChange={e => setCustomDateRange(prev => ({...prev, start: e.target.value}))} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                  <span style={{color: '#64748b'}}>-</span>
                  <input type="date" value={customDateRange.end} onChange={e => setCustomDateRange(prev => ({...prev, end: e.target.value}))} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </div>
          )}
          <button className={filterInactive ? styles.filterBtnActive : styles.filterBtn} onClick={() => setFilterInactive(p => !p)}>
            <AlertCircle size={15} />Inactivos
          </button>
        </div>
        <button className={styles.addBtn} onClick={() => setShowNewModal(true)}><Plus size={18} />Nuevo Pedido</button>
      </div>

      {/* METRICS ROW */}
      <div className={styles.metricsRow}>
        <div className={styles.metric}><span className={styles.metricLabel}>Pipeline Total</span><span className={styles.metricValue}>{formatPrice(totalPipeline)}</span></div>
        <div className={styles.metric}><span className={styles.metricLabel}>Ticket Promedio</span><span className={styles.metricValue}>{formatPrice(avgTicket)}</span></div>
        <div className={styles.metric}><span className={styles.metricLabel}>Pedidos Activos</span><span className={styles.metricValue}>{totalActive}</span></div>
        <div className={styles.metric}><span className={styles.metricLabel}>Tasa de Cierre</span><span className={`${styles.metricValue} ${styles.metricGreen}`}>{convRate}%</span></div>
        <div className={styles.metric}><span className={styles.metricLabel}>Entregados</span><span className={`${styles.metricValue} ${styles.metricBlue}`}>{delivered}</span></div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {STAGES.map(stage => (
              <div key={stage.id} className={styles.col}>
                <div className={styles.colHeader} style={{ borderTopColor: stage.color }}>
                  <div className={styles.colTitle}>
                    <span>{stage.emoji}</span>
                    <h3>{stage.name}</h3>
                    <span className={styles.colCount}>{byStage(stage.id).length}</span>
                  </div>
                  <div className={styles.colTotal}>{formatPrice(stageTotal(stage.id))}</div>
                </div>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${styles.cardList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                    >
                      {byStage(stage.id).map((order, idx) => {
                        const days = getDaysInactive(order.updatedAt);
                        const isWarn = days >= INACTIVITY_WARN && days < INACTIVITY_DANGER;
                        const isDanger = days >= INACTIVITY_DANGER;
                        return (
                          <Draggable key={order.id} draggableId={order.id} index={idx}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`${styles.card} ${selectedOrder?.id === order.id ? styles.cardActive : ''} ${snap.isDragging ? styles.cardDragging : ''}`}
                                style={{ ...prov.draggableProps.style, '--stage-color': stage.color } as any}
                                onClick={() => { setSelectedOrder(order); setShowItems(false); setEditingTotal(false); fetchCustomerHistory(order.customerId); }}
                              >
                                <div className={styles.cardTop}>
                                  <span className={styles.orderNum}>{order.orderNumber}</span>
                                  <span className={styles.timeAgo}>{getTimeAgo(order.updatedAt)}</span>
                                </div>
                                <div className={styles.customerName}>{order.customerName}</div>
                                {(isWarn || isDanger) && (
                                  <div className={isDanger ? styles.badgeDanger : styles.badgeWarn}>
                                    <AlertCircle size={11} />{days}d sin mover
                                  </div>
                                )}
                                <div className={styles.cardBottom}>
                                  <span className={styles.cardAmt}>{formatPrice(order.total)}</span>
                                  <div className={styles.cardIcons}>
                                    {order.notes.length > 0 && <span className={styles.noteChip}><MessageSquare size={11} />{order.notes.length}</span>}
                                    {Array.isArray(order.items) && order.items.length > 0 && <span className={styles.itemChip}><Package size={11} />{order.items.length}</span>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && analytics && (
        <div className={styles.analytics}>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <h4>Revenue Mensual (Entregados)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.revenueMonthly}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: any) => formatPrice(v)} />
                  <Bar dataKey="total" fill="#8B4B62" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.analyticsCard}>
              <h4>Embudo por Etapa</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.byStage} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: any) => [`${v} pedidos`]} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {analytics.byStage.map((_, i) => (
                      <Cell key={i} fill={STAGES[i]?.color || '#8B4B62'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.analyticsCard}>
              <h4>Valor por Etapa</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.byStage} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: any) => formatPrice(v)} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {analytics.byStage.map((_, i) => (
                      <Cell key={i} fill={STAGES[i]?.color || '#8B4B62'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.analyticsCard}>
              <h4>Top 5 Clientes</h4>
              <div className={styles.topCustomers}>
                {analytics.topCustomers.map((c, i) => (
                  <div key={i} className={styles.topCustomerRow}>
                    <span className={styles.topCustomerRank}>#{i + 1}</span>
                    <span className={styles.topCustomerName}>{c.name}</span>
                    <span className={styles.topCustomerVal}>{formatPrice(c.total)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.analyticsStats}>
                <div><span>Tasa de cierre</span><strong>{Math.round(analytics.conversionRate * 100)}%</strong></div>
                <div><span>Días promedio</span><strong>{analytics.avgDaysInPipeline}d</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDE PANEL */}
      {selectedOrder && (
        <div className={styles.overlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>{selectedOrder.orderNumber}</h2>
                <p>{selectedOrder.customerName}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className={styles.panelBody}>
              {/* Stage selector */}
              <section>
                <label className={styles.sectionLabel}>ESTADO</label>
                <div className={styles.stageGrid}>
                  {STAGES.map(s => (
                    <button key={s.id}
                      className={`${styles.stageBtn} ${selectedOrder.status === s.id ? styles.stageBtnActive : ''}`}
                      style={{ '--c': s.color } as any}
                      onClick={() => updateStatus(selectedOrder.id, s.id)}
                    >{s.emoji} {s.name}</button>
                  ))}
                </div>
              </section>
              {/* Total */}
              <section>
                <label className={styles.sectionLabel}>VALOR</label>
                <div className={styles.totalRow}>
                  {editingTotal ? (
                    <>
                      <input type="number" className={styles.totalInput} value={editedTotal} onChange={e => setEditedTotal(parseFloat(e.target.value) || 0)} autoFocus />
                      <button className={styles.saveBtn} onClick={() => updateTotal(selectedOrder.id, editedTotal)}><Check size={16} />Guardar</button>
                    </>
                  ) : (
                    <>
                      <span className={styles.totalAmt}>{formatPrice(selectedOrder.total)}</span>
                      <button className={styles.editBtn} onClick={() => { setEditedTotal(selectedOrder.total); setEditingTotal(true); }}><Edit2 size={14} /></button>
                    </>
                  )}
                </div>
              </section>
              {/* Source */}
              <section>
                <label className={styles.sectionLabel}>ORIGEN DEL LEAD</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select 
                        value={['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(selectedOrder.source || '') ? (selectedOrder.source || 'whatsapp') : 'otro'} 
                        onChange={e => {
                            if (e.target.value !== 'otro') updateSource(selectedOrder.id, e.target.value);
                        }}
                        style={{ padding: '0.6rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.88rem', outline: 'none' }}
                    >
                        <option value="whatsapp">WhatsApp 🟢</option>
                        <option value="facebook">Facebook 🔵</option>
                        <option value="instagram">Instagram 🟣</option>
                        <option value="referido">Referido 🤝</option>
                        <option value="web">Web / Orgánico 🌐</option>
                        <option value="otro">Otro / Personalizado ✏️</option>
                    </select>
                    {(!['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(selectedOrder.source || '') || (selectedOrder.source === 'otro')) && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="text"
                                placeholder="Especificar origen..."
                                defaultValue={['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(selectedOrder.source || '') ? '' : selectedOrder.source}
                                onBlur={e => {
                                    if (e.target.value.trim() && e.target.value !== selectedOrder.source) {
                                        updateSource(selectedOrder.id, e.target.value.trim());
                                    }
                                }}
                                style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1.5px solid #8B4B62', background: 'white', fontSize: '0.88rem', outline: 'none' }}
                            />
                        </div>
                    )}
                </div>
              </section>
              {/* Customer info */}
              <section>
                <label className={styles.sectionLabel}>CLIENTE</label>
                <div className={styles.infoList}>
                  <div className={styles.infoRow}><User size={14} /><span>{selectedOrder.customerName}</span></div>
                  {selectedOrder.customerPhone && (
                    <div className={styles.infoRow}><Phone size={14} />
                      <a href={`https://wa.me/57${selectedOrder.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{selectedOrder.customerPhone}</a>
                    </div>
                  )}
                  {selectedOrder.customerEmail && <div className={styles.infoRow}><Mail size={14} /><span>{selectedOrder.customerEmail}</span></div>}
                  <div className={styles.infoRow}><Clock size={14} /><span>Creado: {new Date(selectedOrder.createdAt).toLocaleDateString('es-CO')}</span></div>
                </div>
              </section>
              {/* Items */}
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <section>
                  <div className={styles.sectionToggle} onClick={() => setShowItems(p => !p)}>
                    <label className={styles.sectionLabel}><Package size={13} /> PRODUCTOS ({selectedOrder.items.length})</label>
                    {showItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {showItems && (
                    <div className={styles.itemsList}>
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className={styles.itemRow}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>x{item.qty}</span>
                          <span className={styles.itemPrice}>{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
              {/* Customer History */}
              {selectedOrder.customerId && (
                <section>
                  <label className={styles.sectionLabel}>HISTORIAL DEL CLIENTE</label>
                  {loadingHistory ? (
                      <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Cargando historial...</p>
                  ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {customerHistory?.quotes && customerHistory.quotes.length > 0 && (
                              <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>COTIZACIONES ({customerHistory.quotes.length})</div>
                                  {customerHistory.quotes.map((q: any) => (
                                      <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#475569' }}>
                                          <span style={{ fontWeight: '600' }}>{q.quoteNumber}</span>
                                          <span style={{ color: '#8B4B62', fontWeight: 'bold' }}>{formatPrice(q.total)}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                          {customerHistory?.orders && customerHistory.orders.length > 1 && (
                              <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>OTROS PEDIDOS ({customerHistory.orders.length - 1})</div>
                                  {customerHistory.orders.filter((o:any) => o.id !== selectedOrder.id).map((o: any) => (
                                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#475569' }}>
                                          <span style={{ fontWeight: '600' }}>{o.orderNumber}</span>
                                          <span style={{ background: STAGE_COLORS[o.status] ? `${STAGE_COLORS[o.status]}15` : '#f1f5f9', color: STAGE_COLORS[o.status] || '#64748b', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>{STAGES.find(s=>s.id===o.status)?.name || o.status}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                          {customerHistory && customerHistory.quotes.length === 0 && customerHistory.orders.length <= 1 && (
                              <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>No hay otro historial para este cliente.</p>
                          )}
                      </div>
                  )}
                </section>
              )}
              {/* Notes */}
              <section>
                <div className={styles.sectionHeader}>
                  <label className={styles.sectionLabel}>OBSERVACIONES</label>
                  <span className={styles.noteCount}>{selectedOrder.notes.length}</span>
                </div>
                <form onSubmit={addNote} className={styles.noteForm}>
                  <textarea placeholder="Escribe una observación..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} />
                  <button type="submit" disabled={savingNote || !newNote.trim()}>{savingNote ? 'Guardando...' : 'Añadir nota'}</button>
                </form>
                <div className={styles.timeline}>
                  {selectedOrder.notes.map(note => (
                    <div key={note.id} className={styles.timelineItem}>
                      <span className={styles.noteDate}>{new Date(note.createdAt).toLocaleString('es-CO')}</span>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className={styles.panelFooter} style={{display: 'flex', gap: '0.5rem'}}>
              {selectedOrder.status !== 'LOST' && (
                  <button className={styles.deleteBtn} style={{flex: 1, background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3'}} onClick={() => setShowLostPrompt(true)}>
                    <AlertCircle size={15} /> Marcar Perdido
                  </button>
              )}
              <button className={styles.deleteBtn} style={{flex: selectedOrder.status === 'LOST' ? 1 : undefined}} onClick={() => deleteOrder(selectedOrder.id)}>
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOST PROMPT MODAL */}
      {showLostPrompt && selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowLostPrompt(false)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
                  <div className={styles.modalHeader}>
                      <h2 style={{color: '#e11d48', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><AlertCircle size={20} /> Marcar como Perdido</h2>
                      <button onClick={() => setShowLostPrompt(false)}><X size={20} /></button>
                  </div>
                  <div style={{marginBottom: '1rem', color: '#475569', fontSize: '0.9rem'}}>
                      Por favor, indica el motivo por el cual se perdió este pedido. Ya no aparecerá en el Kanban principal.
                  </div>
                  <textarea 
                      autoFocus
                      rows={3} 
                      placeholder="Ej: Precio muy alto, compró a la competencia..." 
                      value={lostReason} 
                      onChange={e => setLostReason(e.target.value)}
                      style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '1rem', fontFamily: 'inherit'}}
                  />
                  <div className={styles.modalActions}>
                      <button type="button" onClick={() => setShowLostPrompt(false)}>Cancelar</button>
                      <button 
                          type="button" 
                          disabled={!lostReason.trim()}
                          style={{background: '#e11d48', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: lostReason.trim() ? 1 : 0.5}}
                          onClick={async () => {
                              const res = await fetch(`/api/orders/${selectedOrder.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'LOST', lostReason }) });
                              if (res.ok) {
                                  const updated = await res.json();
                                  setOrders(p => p.map(o => o.id === selectedOrder.id ? updated : o));
                                  setSelectedOrder(null);
                                  setShowLostPrompt(false);
                                  setLostReason('');
                              }
                          }}
                      >Confirmar Pérdida</button>
                  </div>
              </div>
          </div>
      )}

      {/* NEW ORDER MODAL */}
      {showNewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2>Nuevo Pedido</h2><button onClick={() => setShowNewModal(false)}><X size={20} /></button></div>
            <form onSubmit={createOrder} className={styles.modalForm}>
              <div className={styles.field} style={{ position: 'relative' }}>
                <label>Nombre *</label>
                <input 
                  required 
                  placeholder="Nombre del cliente" 
                  value={newOrder.customerName} 
                  onChange={e => {
                      setNewOrder({ ...newOrder, customerName: e.target.value });
                      fetchCustomerSuggestions(e.target.value);
                      setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                />
                {showCustomerSuggestions && customerSuggestions.length > 0 && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '4px', maxHeight: '180px', overflowY: 'auto'
                    }}>
                        {customerSuggestions.map(c => (
                            <div key={c.id}
                                onClick={() => applyCustomer(c)}
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{c.name}</div>
                                {(c.nit || c.email || c.phone) && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone} {c.email ? `- ${c.email}` : ''}</div>}
                            </div>
                        ))}
                    </div>
                )}
              </div>
              <div className={styles.field}><label>Empresa</label><input placeholder="Ej: Mandomedio SAS" value={newOrder.customerCompany} onChange={e => setNewOrder({ ...newOrder, customerCompany: e.target.value })} /></div>
              <div className={styles.fieldRow}>
                <div className={styles.field}><label>Teléfono</label><input placeholder="300 123 4567" value={newOrder.customerPhone} onChange={e => setNewOrder({ ...newOrder, customerPhone: e.target.value })} /></div>
                <div className={styles.field}><label>Total estimado</label><input type="number" value={newOrder.total} onChange={e => setNewOrder({ ...newOrder, total: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className={styles.field}><label>Email</label><input type="email" placeholder="correo@ejemplo.com" value={newOrder.customerEmail} onChange={e => setNewOrder({ ...newOrder, customerEmail: e.target.value })} /></div>
              <div className={styles.fieldRow}>
                  <div className={styles.field}>
                      <label>Origen del Lead</label>
                      <select 
                        value={['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(newOrder.source) ? newOrder.source : 'otro'} 
                        onChange={e => setNewOrder({ ...newOrder, source: e.target.value === 'otro' ? '' : e.target.value })}
                      >
                          <option value="whatsapp">WhatsApp 🟢</option>
                          <option value="facebook">Facebook 🔵</option>
                          <option value="instagram">Instagram 🟣</option>
                          <option value="referido">Referido 🤝</option>
                          <option value="web">Web / Orgánico 🌐</option>
                          <option value="otro">Otro ✏️</option>
                      </select>
                  </div>
                  {(!['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(newOrder.source) || (newOrder.source === 'otro')) && (
                      <div className={styles.field}>
                          <label>Especificar Origen</label>
                          <input 
                            placeholder="Ej: TikTok, Expo..." 
                            value={['whatsapp', 'facebook', 'instagram', 'referido', 'web'].includes(newOrder.source) ? '' : newOrder.source} 
                            onChange={e => setNewOrder({ ...newOrder, source: e.target.value })}
                          />
                      </div>
                  )}
              </div>
              <div className={styles.field}><label>Etapa inicial</label>
                <select value={newOrder.status} onChange={e => setNewOrder({ ...newOrder, status: e.target.value })}>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className={styles.confirmBtn}>Crear Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className={styles.loadingOverlay}><div className={styles.spinner} /></div>}
    </div>
  );
}
