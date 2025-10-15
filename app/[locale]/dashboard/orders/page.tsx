
'use client'
// import OrdersTable from '@/components/dashboard/ordersTable';
import OrdersTableW from '@/components/dashboard/whatsapp/order/OrdersTableWha';
import {useTranslations} from 'next-intl';

export default function OrdersPage() {
    const t = useTranslations('orders');
    
    return (
        <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
        <OrdersTableW/>
        </div>
    );
}
