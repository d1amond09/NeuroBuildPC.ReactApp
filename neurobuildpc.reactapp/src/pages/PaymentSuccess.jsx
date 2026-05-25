import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '../api/services';

export default function PaymentSuccess() {
    const [syncing, setSyncing] = useState(true);

    useEffect(() => {
        const syncOrder = async () => {
            const orderId = localStorage.getItem('lastPendingOrderId');
            if (orderId) {
                try {
                    await ordersApi.forceSyncLocal(orderId);
                } catch (e) {
                    console.error("Сбой локальной синхронизации:", e);
                }
                localStorage.removeItem('lastPendingOrderId');
            }
            setSyncing(false);
        };
        syncOrder();
    }, []);

    if (syncing) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-primary w-16 h-16 mb-4" />
                <h1 className="text-2xl text-white">Подтверждение оплаты банком...</h1>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto mt-20 text-center bg-slate-900 p-10 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/10">
            <CheckCircle className="text-green-500 w-24 h-24 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Оплата прошла успешно!</h1>
            <p className="text-slate-400 mb-8 text-lg">
                Ваш заказ передан в отдел сборки. Мы пришлем уведомление, как только ПК будет готов.
            </p>
            <Link to="/orders" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                Перейти к заказам
            </Link>
        </div>
    );
}