import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFail() {
    return (
        <div className="max-w-lg mx-auto mt-20 text-center bg-slate-900 p-10 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/10">
            <XCircle className="text-red-500 w-24 h-24 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Ошибка оплаты</h1>
            <p className="text-slate-400 mb-8 text-lg">
                К сожалению, транзакция была отклонена банком или вы отменили платеж.
            </p>
            <Link to="/orders" className="bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                Вернуться к заказам и попробовать снова
            </Link>
        </div>
    );
}