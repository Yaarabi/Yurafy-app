
'use client'
import OrdersTableWhatPlan from '@/components/dashboard/order/OrdersTableWhatPlan';
// import OrdersTableW from '@/components/dashboard/order/OrdersTable';
import {useTranslations} from 'next-intl';
import { useUserFeatures } from '@/hooks/useUserFeatures';

export default function OrdersPage() {
    const t = useTranslations('orders');
    const { data: featuresData } = useUserFeatures();
    const hasWhatsApp = featuresData?.planFeatures?.hasWhatsApp ?? false;
    
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('title')}</h2>
        {/* <OrdersTableW/> */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <OrdersTableWhatPlan hasWhatsApp={hasWhatsApp} />
        </div>
        </div>
    );
}
