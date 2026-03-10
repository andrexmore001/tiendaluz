import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SK7SWA56v_pEOp.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SK7SWA56v_pEOp.ttf', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1e293b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    logoContainer: {
        width: 100,
    },
    logo: {
        width: 80,
        height: 80,
        objectFit: 'contain',
    },
    cityText: {
        textAlign: 'right',
        fontSize: 10,
        fontWeight: 'bold',
    },
    motto: {
        fontSize: 12,
        color: '#8B4B62',
        fontStyle: 'italic',
        marginBottom: 30,
        fontWeight: 'bold',
    },
    addressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 40,
    },
    addressBlock: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 5,
        borderBottom: '1 solid #e2e8f0',
        paddingBottom: 2,
    },
    addressText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#475569',
    },
    quoteTitle: {
        fontSize: 22,
        color: '#8B4B62',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    infoGrid: {
        flexDirection: 'row',
        background: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 25,
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1 solid #1e293b',
        paddingBottom: 5,
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5 solid #e2e8f0',
        paddingVertical: 8,
        alignItems: 'center',
    },
    colDesc: { flex: 4 },
    colQty: { flex: 1.5, textAlign: 'center' },
    colPrice: { flex: 1.5, textAlign: 'right' },
    colTax: { flex: 1.2, textAlign: 'right' },
    colTotal: { flex: 2, textAlign: 'right' },

    summarySection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    summaryBlock: {
        width: 200,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottom: '0.5 solid #e2e8f0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        fontWeight: 'bold',
        fontSize: 12,
    },
    notes: {
        marginTop: 30,
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: '0.5 solid #e2e8f0',
        paddingTop: 10,
        color: '#94a3b8',
        fontSize: 8,
    }
});

interface QuoteItem {
    description: string;
    qty: number;
    unitPrice: number;
    tax?: number;
}

interface QuotePDFProps {
    data: {
        quoteNumber: string;
        date: string;
        expiryDate: string;
        vendor: string;
        clientName: string;
        clientNit: string;
        billingAddress: string;
        shippingAddress: string;
        items: QuoteItem[];
        notes?: string;
        paymentTerms?: string;
    };
    logoUrl?: string;
}

const QuotePDF: React.FC<QuotePDFProps> = ({ data, logoUrl }) => {
    const subtotal = data.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const total = subtotal; // Simplified for now

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                    </View>
                    <Text style={styles.cityText}>Bogotá, Colombia</Text>
                </View>

                <Text style={styles.motto}>No es lo que das, es lo que transmites</Text>

                <View style={styles.addressSection}>
                    <View style={styles.addressBlock}>
                        <Text style={styles.addressTitle}>Dirección de facturación</Text>
                        <Text style={styles.addressText}>{data.clientName}</Text>
                        <Text style={styles.addressText}>{data.billingAddress}</Text>
                        <Text style={styles.addressText}>NIT: {data.clientNit}</Text>
                    </View>
                    <View style={styles.addressBlock}>
                        <Text style={styles.addressTitle}>Dirección de envío</Text>
                        <Text style={styles.addressText}>{data.clientName}</Text>
                        <Text style={styles.addressText}>{data.shippingAddress}</Text>
                    </View>
                </View>

                <Text style={styles.quoteTitle}>Número de cotización {data.quoteNumber}</Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Fecha de cotización</Text>
                        <Text style={styles.infoValue}>{data.date}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Vencimiento</Text>
                        <Text style={styles.infoValue}>{data.expiryDate}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Vendedor</Text>
                        <Text style={styles.infoValue}>{data.vendor}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Descripción</Text>
                        <Text style={styles.colQty}>Cantidad</Text>
                        <Text style={styles.colPrice}>Precio unitario</Text>
                        <Text style={styles.colTax}>Impuestos</Text>
                        <Text style={styles.colTotal}>Importe</Text>
                    </View>

                    {data.items.map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.qty.toLocaleString()} Unidades</Text>
                            <Text style={styles.colPrice}>{item.unitPrice.toLocaleString()}</Text>
                            <Text style={styles.colTax}>{item.tax ? item.tax.toLocaleString() : '0,00'}</Text>
                            <Text style={styles.colTotal}>$ {(item.qty * item.unitPrice).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryBlock}>
                        <View style={styles.summaryRow}>
                            <Text>Subtotal</Text>
                            <Text>$ {subtotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text>Total</Text>
                            <Text>$ {total.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.notes}>
                    <Text style={{ fontWeight: 'bold' }}>Términos y condiciones: https://www.artesana.com.co/terms</Text>
                    <Text style={{ marginTop: 5 }}>Términos de pago: {data.paymentTerms || 'pago inmediato'}</Text>
                    {data.notes && <Text style={{ marginTop: 10 }}>Notas: {data.notes}</Text>}
                </View>

                <View style={styles.footer}>
                    <Text>contacto@artesana.com.co</Text>
                    <Text style={{ marginTop: 5 }}>Página 1 / 1</Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuotePDF;
