"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    RefreshCw,
    RotateCcw,
    Percent,
    DollarSign
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
        customerCompany: '',
        clientNit: '',
        billingAddress: '',
        shippingAddress: '',
        items: [] as any[],
        notes: '',
        discountReason: '',
        paymentTerms: 'pago inmediato'
    });

    const [pastQuotes, setPastQuotes] = useState<any[]>([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const comboboxRef = useRef<HTMLDivElement>(null);
    // Customer autocomplete
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
    const customerRef = useRef<HTMLDivElement>(null);

    const fetchCustomerSuggestions = async (q: string) => {
        if (q.length < 1) { setCustomerSuggestions([]); return; }
        try {
            const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
            if (res.ok) setCustomerSuggestions(await res.json());
        } catch { /* ignore */ }
    };

    const applyCustomer = (c: any) => {
        setQuoteData(prev => ({
            ...prev,
            clientName: c.name,
            customerCompany: c.companyName || prev.customerCompany,
            clientNit: c.nit || prev.clientNit,
            billingAddress: c.billingAddress || prev.billingAddress,
            shippingAddress: c.shippingAddress || prev.shippingAddress,
        }));
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
    };

    // Cerrar el dropdown al hacer clic fuera del combobox
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
                setShowCustomerSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const deleteQuote = async (quoteNumber: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la cotización ${quoteNumber}? Esta acción no se puede deshacer.`)) return;
        setIsLoadingQuotes(true);
        try {
            const res = await fetch(`/api/quotes?quoteNumber=${quoteNumber}`, { method: 'DELETE' });
            if (res.ok) {
                setPastQuotes(prev => prev.filter(q => q.quoteNumber !== quoteNumber));
                alert('Cotización eliminada con éxito');
            } else {
                alert('Error al eliminar la cotización');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al eliminar');
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const searchableItems = useMemo(() => {
        const items: any[] = [];
        products.forEach(p => {
            if (p.variants && p.variants.length > 0) {
                // Si tiene variantes, agregamos cada variante
                p.variants.forEach(v => {
                    const variantAttributesStr = v.attributes && v.attributes.length > 0 
                        ? v.attributes.map((a: any) => a.attributeValue?.value).filter(Boolean).join(' - ') 
                        : '';
                    const variantName = variantAttributesStr ? `${p.name} - ${variantAttributesStr}` : p.name;
                    items.push({
                        id: v.id,
                        productId: p.id,
                        variantId: v.id,
                        name: variantName,
                        price: v.price ?? p.price,
                        originalProduct: p,
                        variant: v,
                        dimensions: p.dimensions
                    });
                });
            } else {
                // Si no tiene variantes, agregamos el producto base
                items.push({
                    id: p.id,
                    productId: p.id,
                    name: p.name,
                    price: p.price,
                    originalProduct: p,
                    dimensions: p.dimensions
                });
            }
        });
        return items;
    }, [products]);

    const loadQuote = (quote: any) => {
        setQuoteData({
            quoteNumber: quote.quoteNumber,
            date: quote.date,
            expiryDate: quote.expiryDate,
            vendor: quote.vendor,
            clientName: quote.clientName,
            customerCompany: quote.customerCompany || '',
            clientNit: quote.clientNit,
            billingAddress: quote.billingAddress,
            shippingAddress: quote.shippingAddress,
            items: quote.items.map((item: any) => {
                const searchItem = searchableItems.find(si => si.name === item.description.split(' (')[0]);
                return {
                    ...item,
                    originalProduct: searchItem?.originalProduct,
                    variantId: searchItem?.variantId
                };
            }),
            notes: quote.notes || '',
            discountReason: quote.discountReason || '',
            paymentTerms: quote.paymentTerms || 'pago inmediato'
        });
    };

    const resetForm = () => {
        if (!confirm('¿Estás seguro de que deseas limpiar todos los campos de la cotización actual?')) return;
        setQuoteData({
            quoteNumber: `S${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleDateString('es-ES'),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            vendor: 'Administrador Artesana',
            clientName: '',
            customerCompany: '',
            clientNit: '',
            billingAddress: '',
            shippingAddress: '',
            items: [] as any[],
            notes: '',
            discountReason: '',
            paymentTerms: 'pago inmediato'
        });
        setSearchTerm('');
        setSelectedItem(null);
    };

    const filteredItems = searchableItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasData = quoteData.clientName || quoteData.items.length > 0 || quoteData.notes || quoteData.clientNit || quoteData.billingAddress || quoteData.shippingAddress;

    const selectProduct = (item: any) => {
        setSelectedItem(item);
        setSearchTerm(item.name);
        setSearchOpen(false);
    };

    const addItem = () => {
        if (!selectedItem) return;

        const dimensions = selectedItem.dimensions;
        const hasDimensions = dimensions && (dimensions.width > 0 || dimensions.height > 0 || dimensions.depth > 0);
        const dimensionsStr = hasDimensions 
            ? ` (${dimensions.width}x${dimensions.height}x${dimensions.depth})`
            : '';

        setQuoteData(prev => ({
            ...prev,
            items: [...prev.items, {
                id: selectedItem.variantId || selectedItem.productId,
                description: selectedItem.name + dimensionsStr,
                qty: 1,
                unitPrice: selectedItem.price,
                originalPrice: selectedItem.price,
                discountValue: 0,
                discountType: 'percentage', // percentage or amount
                originalProduct: selectedItem.originalProduct,
                variantId: selectedItem.variantId
            }]
        }));
        // Limpiar selección
        setSelectedItem(null);
        setSearchTerm('');
        setSearchOpen(false);
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

    const updateItemDiscount = (idx: number, field: 'discountValue' | 'discountType', value: any) => {
        const items = [...quoteData.items];
        const item = items[idx];
        const newItem = { ...item, [field]: value };

        // Recalculate unitPrice based on discount
        let discountedPrice = item.originalPrice;
        if (newItem.discountType === 'percentage') {
            discountedPrice = item.originalPrice * (1 - (newItem.discountValue / 100));
        } else {
            discountedPrice = Math.max(0, item.originalPrice - newItem.discountValue);
        }

        items[idx] = { ...newItem, unitPrice: discountedPrice };
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
                        <div className={styles.inputGroup} ref={customerRef} style={{ position: 'relative' }}>
                            <label><User size={14} /> Nombre del Contacto *</label>
                            <input
                                type="text"
                                value={quoteData.clientName}
                                onChange={e => {
                                    setQuoteData({ ...quoteData, clientName: e.target.value });
                                    fetchCustomerSuggestions(e.target.value);
                                    setShowCustomerSuggestions(true);
                                }}
                                onFocus={() => setShowCustomerSuggestions(true)}
                                placeholder="Ej: Mandomedio SAS"
                            />
                            {showCustomerSuggestions && customerSuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '4px', maxHeight: '200px', overflowY: 'auto'
                                }}>
                                    {customerSuggestions.map(c => (
                                        <div key={c.id}
                                            onClick={() => applyCustomer(c)}
                                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{c.name}</div>
                                            {(c.companyName || c.nit || c.email) && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.companyName ? c.companyName + ' - ' : ''} NIT {c.nit} {c.email ? `- ${c.email}` : ''}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.inputGroup}>
                            <label><User size={14} /> Nombre de la Empresa</label>
                            <input
                                type="text"
                                value={quoteData.customerCompany}
                                onChange={e => setQuoteData({ ...quoteData, customerCompany: e.target.value })}
                                placeholder="Ej: Artesana SAS"
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
                        <div className={styles.addItemRow} style={{ marginBottom: '1.5rem' }}>
                            {/* Combobox con búsqueda */}
                            <div className={styles.productSearchCombobox} ref={comboboxRef}>
                                <div className={styles.searchBar}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar producto por nombre..."
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setSelectedItem(null);
                                            setSearchOpen(true);
                                        }}
                                        onFocus={() => setSearchOpen(true)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className={styles.clearSearchBtn}
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedItem(null);
                                                setSearchOpen(false);
                                            }}
                                            title="Limpiar"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {searchOpen && searchTerm && (
                                    <div className={styles.searchDropdown}>
                                        {filteredItems.length === 0 ? (
                                            <p className={styles.searchDropdownEmpty}>No se encontraron productos</p>
                                        ) : (
                                            filteredItems.slice(0, 8).map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`${styles.searchDropdownItem} ${selectedItem?.id === item.id ? styles.searchDropdownItemActive : ''}`}
                                                    onClick={() => selectProduct(item)}
                                                >
                                                    <span className={styles.searchDropdownName}>{item.name}</span>
                                                    <span className={styles.productBadgePrice}>${formatPrice(item.price)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <button className="btn-primary" onClick={addItem} disabled={!selectedItem} title="Agregar producto">
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
                                    <div className={styles.itemQuantitySection}>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                                            min="1"
                                            className={styles.qtyInput}
                                        />
                                    </div>
                                    <div className={styles.itemDiscountSection} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                value={item.discountValue}
                                                onChange={e => updateItemDiscount(idx, 'discountValue', parseFloat(e.target.value) || 0)}
                                                style={{ width: '60px', padding: '4px 20px 4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                                                placeholder="0"
                                            />
                                            <button 
                                                onClick={() => updateItemDiscount(idx, 'discountType', item.discountType === 'percentage' ? 'amount' : 'percentage')}
                                                style={{ position: 'absolute', right: '4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
                                                title={item.discountType === 'percentage' ? 'Cambiar a valor fijo' : 'Cambiar a porcentaje'}
                                            >
                                                {item.discountType === 'percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                        {item.discountValue > 0 && (
                                            <p style={{ fontSize: '0.7rem', color: '#ef4444', textDecoration: 'line-through', marginBottom: 0 }}>
                                                ${formatPrice(item.qty * item.originalPrice)}
                                            </p>
                                        )}
                                        <p style={{ fontWeight: 'bold', margin: 0 }}>${formatPrice(item.qty * item.unitPrice)}</p>
                                    </div>
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
                                document={<QuotePDF data={quoteData} logoUrl={settings.logo} nequiQrUrl={settings.nequiQr} />}
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

                            {hasData && (
                                <button
                                    className={styles.secondaryBtn}
                                    style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', color: '#ef4444', borderColor: '#fecaca' }}
                                    onClick={resetForm}
                                >
                                    <RotateCcw size={18} /> Limpiar Cotización
                                </button>
                            )}

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
                        <label style={{ marginTop: '1rem', display: 'block' }}>Motivo del Descuento</label>
                        <textarea
                            rows={2}
                            value={quoteData.discountReason}
                            onChange={e => setQuoteData({ ...quoteData, discountReason: e.target.value })}
                            placeholder="Ej: Descuento por pronto pago / Cliente recurrente..."
                        />
                        <label style={{ marginTop: '1rem', display: 'block' }}>Notas Adicionales</label>
                        <textarea
                            rows={2}
                            value={quoteData.notes}
                            onChange={e => setQuoteData({ ...quoteData, notes: e.target.value })}
                            placeholder="Ej: Incluye envío a nivel nacional..."
                        />
                    </div>

                    {/* Recent Quotes List */}
                    <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className={styles.formGroupTitle} style={{ margin: 0 }}><History size={16} /> Historial Reciente</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por # o cliente..." 
                                        value={historySearchTerm}
                                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                                        style={{ padding: '0.3rem 0.5rem 0.3rem 1.8rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', width: '160px' }}
                                    />
                                </div>
                                <button className={styles.refreshBtn} onClick={fetchQuotes} title="Actualizar">
                                    <RefreshCw size={14} className={isLoadingQuotes ? styles.animateSpin : ''} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.quoteHistoryBox} style={{ maxHeight: '250px', overflowY: 'auto', background: '#f8fafc', borderRadius: '12px', padding: '0.5rem', border: '1px solid #e2e8f0' }}>
                            {pastQuotes.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No hay cotizaciones registradas.</p>
                            ) : (
                                pastQuotes
                                .filter(q => 
                                    q.quoteNumber.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
                                    (q.clientName || '').toLowerCase().includes(historySearchTerm.toLowerCase())
                                )
                                .map((q, idx) => (
                                    <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className={styles.historyRow}>
                                        <div onClick={() => loadQuote(q)} style={{ cursor: 'pointer', flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', paddingRight: '1rem' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{q.quoteNumber}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.date}</span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{q.clientName || 'Sin cliente'}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); deleteQuote(q.quoteNumber); }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' }}
                                            title="Eliminar cotización"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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
