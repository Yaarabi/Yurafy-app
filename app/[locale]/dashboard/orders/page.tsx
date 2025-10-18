
'use client'
import OrdersTableWhatPlan from '@/components/dashboard/order/OrdersTableWhatPlan';
// import OrdersTableW from '@/components/dashboard/order/OrdersTable';
import {useTranslations} from 'next-intl';

export default function OrdersPage() {
    const t = useTranslations('orders');
    
    return (
        <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
        {/* <OrdersTableW/> */}
        <OrdersTableWhatPlan/>
        </div>
    );
}
