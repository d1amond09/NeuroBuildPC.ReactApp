// src/pages/OrdersList.jsx
import { useState, useEffect, useContext } from 'react';
import { ordersApi } from '../api/services';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import BuildDetailsModal from '../components/BuildDetailsModal';
import { Package, CreditCard, Clock, CheckCircle, Settings, Truck, Loader2, Eye, Trash2 } from 'lucide-react';

const statuses = [
    { id: 'Pending', numericId: 0, text: 'Ожидает оплаты', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: <CreditCard size={14} /> },
    { id: 'Paid', numericId: 1, text: 'Оплачен (Сборка)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock size={14} /> },
    { id: 'Assembling', numericId: 2, text: 'В процессе', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Settings size={14} /> },
    { id: 'Ready', numericId: 3, text: 'Готов', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: <Package size={14} /> },
    { id: 'Completed', numericId: 4, text: 'Завершен', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle size={14} /> }
];

export default function OrdersList() {
    const { user } = useContext(AuthContext);
    const { userId } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [selectedBuildId, setSelectedBuildId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const targetId = userId || user?.id;
            if (!targetId) return;
            const res = await ordersApi.getByUser(targetId);
            setOrders(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [user, userId]);

    const handlePayWithWebPay = async (orderId) => {
        setProcessingId(orderId);
        try {
            localStorage.setItem('lastPendingOrderId', orderId);
            const res = await ordersApi.initPayment(orderId);
            const { paymentUrl } = res.data;
            window.location.href = paymentUrl;
        } catch (error) {
            alert('Сбой инициализации платежа. Обратитесь в поддержку.');
            setProcessingId(null);
        }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("Отменить этот заказ? Сборка вернется в ваш список конфигураций.")) return;
        try {
            await ordersApi.delete(id);
            load();
        } catch {
            alert("Ошибка отмены заказа.");
        }
    };

    const StatusBadge = ({ status }) => {
        const s = statuses.find(x => x.id === status || x.numericId === Number(status)) || statuses[0];
        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.color}`}>
                {s.icon} {s.text}
            </span>
        );
    };

    if (loading) return <div className="text-center mt-20 text-brand-primary">Загрузка заказов...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-3 mb-8">
                <Truck className="text-brand-primary" size={32} />
                <h1 className="text-3xl text-white font-bold">{userId ? 'История заказов пользователя' : 'Мои заказы'}</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Package size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl">Здесь пока пусто. Создайте сборку и оформите заказ!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map(o => {
                        const isPending = o.status === 'Pending' || o.status === 0 || o.status === '0';

                        return (
                            <div key={o.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl text-white font-bold">{o.build?.buildName || 'Конфигурация ПК'}</h2>
                                            <button
                                                onClick={() => setSelectedBuildId(o.buildId)}
                                                className="text-slate-400 hover:text-brand-primary p-2 bg-slate-800 rounded-lg transition"
                                                title="Посмотреть состав сборки"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                        <StatusBadge status={o.status} />
                                    </div>
                                    <div className="text-sm text-slate-400 space-y-1">
                                        <p>Номер заказа: <span className="font-mono text-slate-300">{o.id}</span></p>
                                        <p>Оформлен: {new Date(o.createdAt).toLocaleString('ru-RU')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase">Сумма к оплате</p>
                                        <p className="text-2xl font-black text-white">{o.totalPrice.toLocaleString()} BYN</p>
                                    </div>

                                    {isPending && !userId && (
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handlePayWithWebPay(o.id)}
                                                disabled={processingId === o.id}
                                                className="flex-grow bg-brand-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {processingId === o.id ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                                                {processingId === o.id ? 'Перенаправление...' : 'Оплатить через WebPay'}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteOrder(o.id)}
                                                className="bg-red-950/40 text-red-400 hover:bg-red-800 hover:text-white p-3 rounded-xl border border-red-900/50 transition-colors"
                                                title="Отменить заказ"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedBuildId && (
                <BuildDetailsModal
                    id={selectedBuildId}
                    onClose={() => setSelectedBuildId(null)}
                />
            )}
        </div>
    );
}