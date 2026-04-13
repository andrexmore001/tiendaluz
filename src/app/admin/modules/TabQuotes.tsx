"use client";
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    Download,
    Search,
    User,
    Calendar,
    MapPin,
    Hash,
    History,
    RefreshCw
} from 'lucide-react';
import { Product } from '@/types/product';
import styles from '../admin.module.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from '@/components/Quotes/QuotePDF';
import { formatPrice } from '@/lib/format';

interface TabQuotesProps {
    products: Product[];
    onMenuClick: () => void;
    settings: any;
}

export default function TabQuotes({ products, onMenuClick, settings }: TabQuotesProps) {
    const [quoteData, setQuoteData] = useState({
        quoteNumber: `S${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('es-ES'),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        vendor: 'Administrador Artesana',
        clientName: '',
        clientNit: '',
        billingAddress: '',
        shippingAddress: '',
        items: [] as any[],
        notes: '',
        paymentTerms: 'pago inmediato'
    });

    const [pastQuotes, setPastQuotes] = useState<any[]>([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        setIsLoadingQuotes(true);
        try {
            const res = await fetch('/api/quotes');
            if (res.ok) {
                const data = await res.json();
                setPastQuotes(data);
            }
        } catch (error) {
            console.error("Error fetching quotes:", error);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const saveQuote = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...quoteData,
                    subtotal,
                    total: subtotal
                })
            });
            if (res.ok) {
                fetchQuotes();
            }
        } catch (error) {
            console.error("Error saving quote:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const loadQuote = (quote: any) => {
        setQuoteData({
            quoteNumber: quote.quoteNumber,
            date: quote.date,
            expiryDate: quote.expiryDate,
            vendor: quote.vendor,
            clientName: quote.clientName,
            clientNit: quote.clientNit,
            billingAddress: quote.billingAddress,
            shippingAddress: quote.shippingAddress,
            items: quote.items.map((item: any) => {
                const product = products.find(p => p.name === item.description.split(' (')[0]);
                return {
                    ...item,
                    originalProduct: product
                };
            }),
            notes: quote.notes || '',
            paymentTerms: quote.paymentTerms || 'pago inmediato'
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addItem = () => {
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        setQuoteData(prev => ({
            ...prev,
            items: [...prev.items, {
                id: product.id,
                description: `${product.name} (${product.dimensions?.width}x${product.dimensions?.height}x${product.dimensions?.depth})`,
                qty: 1,
                unitPrice: product.price,
                originalProduct: product // Keep reference for price tier calculation
            }]
        }));
        setSelectedProductId('');
    };

    const removeItem = (idx: number) => {
        setQuoteData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx)
        }));
    };

    const updateItemQty = (idx: number, qty: number) => {
        const items = [...quoteData.items];
        const item = items[idx];
        const product = item.originalProduct;

        // Calculate price based on tiers if available
        let unitPrice = product.price;
        if (product.priceTiers && product.priceTiers.length > 0) {
            const tier = product.priceTiers.find((t: any) =>
                qty >= t.minQty && (!t.maxQty || qty <= t.maxQty)
            );
            if (tier) unitPrice = tier.unitPrice;
        }

        items[idx] = { ...item, qty, unitPrice };
        setQuoteData({ ...quoteData, items });
    };

    const subtotal = quoteData.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

    return (
        <div className={styles.tabContent}>
            <header className={styles.header}>
                <div className={styles.headerTitleGroup}>
                    <h1>Generador de Cotizaciones</h1>
                </div>
                <button className={styles.menuTrigger} onClick={onMenuClick}>Menu</button>
            </header>

            <div className={styles.quoteCreatorGrid}>
                {/* Form Side */}
                <div className={styles.quoteForm}>
                    <div className={styles.formGroup}>
                        <h3 className={styles.formGroupTitle}>Datos del Cliente</h3>
                        <div className={styles.inputGroup}>
                            <label><User size={14} /> Nombre del Cliente / Empresa</label>
                            <input
                                type="text"
                                value={quoteData.clientName}
                                onChange={e => setQuoteData({ ...quoteData, clientName: e.target.value })}
                                placeholder="Ej: Mandomedio SAS"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label><Hash size={14} /> NIT / Identificación</label>
                            <input
                                type="text"
                                value={quoteData.clientNit}
                                onChange={e => setQuoteData({ ...quoteData, clientNit: e.target.value })}
                                placeholder="Ej: 900.000.000-1"
                            />
                        </div>
                        <div className={styles.dimensionsRow}>
                            <div className={styles.inputGroup}>
                                <label><MapPin size={14} /> Dir. Facturación</label>
                                <input
                                    type="text"
                                    value={quoteData.billingAddress}
                                    onChange={e => setQuoteData({ ...quoteData, billingAddress: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label><MapPin size={14} /> Dir. Envío</label>
                                <input
                                    type="text"
                                    value={quoteData.shippingAddress}
                                    onChange={e => setQuoteData({ ...quoteData, shippingAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                        <h3 className={styles.formGroupTitle}>Productos</h3>
                        <div className={styles.addItemRow} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className={styles.searchSelectWrapper} style={{ flex: 1, position: 'relative' }}>
                                <select
                                    value={selectedProductId}
                                    onChange={e => setSelectedProductId(e.target.value)}
                                    className={styles.pSelect}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn-primary" onClick={addItem} disabled={!selectedProductId}>
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className={styles.quoteItemsList}>
                            {quoteData.items.map((item, idx) => (
                                <div key={idx} className={styles.quoteItemRow}>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.description}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Unit: ${formatPrice(item.unitPrice)}</p>
                                    </div>
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                                        min="1"
                                    />
                                    <p style={{ fontWeight: 'bold', textAlign: 'right' }}>${formatPrice(item.qty * item.unitPrice)}</p>
                                    <button className={styles.iconBtnDelete} onClick={() => removeItem(idx)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview & Summary Side */}
                <div className={styles.quotePreview}>
                    <div className={styles.previewCard} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B4B62' }}>COTIZACIÓN</div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold' }}>#{quoteData.quoteNumber}</p>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{quoteData.date}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Cliente</p>
                            <p style={{ fontWeight: 'bold' }}>{quoteData.clientName || '---'}</p>
                            <p style={{ fontSize: '0.9rem' }}>{quoteData.clientNit || '---'}</p>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>${formatPrice(subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', color: '#1e293b' }}>
                                <span>Total</span>
                                <span>${formatPrice(subtotal)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem' }}>
                            <PDFDownloadLink
                                document={<QuotePDF data={quoteData} logoUrl={settings.logo} />}
                                fileName={`Cotizacion_${quoteData.quoteNumber}_${quoteData.clientName}.pdf`}
                                className="btn-primary"
                                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                onClick={() => saveQuote()}
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'Generando PDF...' : (
                                        <>
                                            <Download size={18} /> Descargar PDF
                                        </>
                                    )
                                }
                            </PDFDownloadLink>

                            <button
                                className={styles.secondaryBtn}
                                style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={saveQuote}
                                disabled={isSaving}
                            >
                                {isSaving ? <RefreshCw className={styles.animateSpin} size={18} /> : <FileText size={18} />}
                                Guardar en Historial
                            </button>

                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>
                                Al descargar o guardar, la cotización quedará registrada en el historial.
                            </p>
                        </div>
                    </div>

                    <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                        <label>Términos de Pago</label>
                        <input
                            type="text"
                            value={quoteData.paymentTerms}
                            onChange={e => setQuoteData({ ...quoteData, paymentTerms: e.target.value })}
                        />
                        <label style={{ marginTop: '1rem', display: 'block' }}>Notas Adicionales</label>
                        <textarea
                            rows={3}
                            value={quoteData.notes}
                            onChange={e => setQuoteData({ ...quoteData, notes: e.target.value })}
                            placeholder="Ej: Incluye envío a nivel nacional..."
                        />
                    </div>

                    {/* Recent Quotes List */}
                    <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className={styles.formGroupTitle} style={{ margin: 0 }}><History size={16} /> Historial Reciente</h3>
                            <button className={styles.refreshBtn} onClick={fetchQuotes} title="Actualizar">
                                <RefreshCw size={14} className={isLoadingQuotes ? styles.animateSpin : ''} />
                            </button>
                        </div>
                        <div className={styles.quoteHistoryBox} style={{ maxHeight: '200px', overflowY: 'auto', background: '#f8fafc', borderRadius: '12px', padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                            {pastQuotes.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No hay cotizaciones registradas.</p>
                            ) : (
                                pastQuotes.map((q, idx) => (
                                    <div key={idx} onClick={() => loadQuote(q)} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.2s' }} className={styles.historyRow}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{q.quoteNumber}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.date}</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.clientName || 'Sin cliente'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
