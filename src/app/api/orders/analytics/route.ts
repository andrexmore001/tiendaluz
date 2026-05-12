import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                status: true,
                total: true,
                createdAt: true,
                updatedAt: true,
                customerName: true,
            }
        });

        const STAGES = ['LEAD', 'QUOTE', 'PROCESS', 'READY', 'DELIVERED'];
        const STAGE_LABELS: Record<string, string> = {
            LEAD: 'Lead',
            QUOTE: 'Cotización',
            PROCESS: 'En Proceso',
            READY: 'Listo',
            DELIVERED: 'Entregado',
        };

        // ---- Metrics by stage ----
        const byStage = STAGES.map(stage => {
            const stageOrders = orders.filter(o => o.status === stage);
            return {
                stage,
                label: STAGE_LABELS[stage],
                count: stageOrders.length,
                total: stageOrders.reduce((sum, o) => sum + o.total, 0),
            };
        });

        // ---- Pipeline totals (excluding DELIVERED & CANCELLED) ----
        const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
        const totalPipeline = activeOrders.reduce((sum, o) => sum + o.total, 0);
        const avgTicket = activeOrders.length > 0 ? totalPipeline / activeOrders.length : 0;

        // ---- Conversion rate: leads that became DELIVERED / total leads created ----
        const totalLeads = orders.length;
        const totalDelivered = orders.filter(o => o.status === 'DELIVERED').length;
        const conversionRate = totalLeads > 0 ? totalDelivered / totalLeads : 0;

        // ---- Revenue by month (last 6 months) ----
        const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
        const revenueByMonth: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            revenueByMonth[key] = 0;
        }
        for (const o of deliveredOrders) {
            const d = new Date(o.updatedAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (key in revenueByMonth) {
                revenueByMonth[key] += o.total;
            }
        }
        const revenueMonthly = Object.entries(revenueByMonth).map(([month, total]) => ({
            month,
            total,
            label: new Date(month + '-01').toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
        }));

        // ---- Top customers by total order value ----
        const customerMap: Record<string, number> = {};
        for (const o of orders) {
            customerMap[o.customerName] = (customerMap[o.customerName] || 0) + o.total;
        }
        const topCustomers = Object.entries(customerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, total]) => ({ name, total }));

        // ---- Avg days per stage (based on updatedAt - createdAt for delivered orders) ----
        const avgDaysInPipeline = deliveredOrders.length > 0
            ? deliveredOrders.reduce((sum, o) => {
                const diff = new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime();
                return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / deliveredOrders.length
            : 0;

        return NextResponse.json({
            totalPipeline,
            avgTicket,
            conversionRate,
            totalActive: activeOrders.length,
            totalDelivered,
            byStage,
            revenueMonthly,
            topCustomers,
            avgDaysInPipeline: Math.round(avgDaysInPipeline),
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Error al obtener analítica' }, { status: 500 });
    }
}
