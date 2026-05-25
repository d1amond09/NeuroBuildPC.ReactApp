// src/pages/AdminOrders.jsx
import { useState, useEffect, useContext } from 'react';
import { ordersApi, usersApi } from '../api/services';
import { AuthContext } from '../context/AuthContext';
import BuildDetailsModal from '../components/BuildDetailsModal';
import { PackageSearch, Loader2, Check, User, Eye, Trash2 } from 'lucide-react';

const statuses = [
    { id: 'Pending', numericId: 0, label: 'Ожидает оплаты', color: 'text-yellow-500' },
    { id: 'Paid', numericId: 1, label: 'Оплачен', color: 'text-blue-400' },
    { id: 'Assembling', numericId: 2, label: 'В сборке', color: 'text-purple-400' },
    { id: 'Ready', numericId: 3, label: 'Готов', color: 'text-indigo-400' },
    { id: 'Completed', numericId: 4, label: 'Завершен', color: 'text-green-400' }
];

export default function AdminOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [successId, setSuccessId] = useState(null);
    const [selectedBuildId, setSelectedBuildId] = useState(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const [ordersRes, usersRes] = await Promise.all([
                ordersApi.getAll(),
                usersApi.getAll({ pageSize: 100 })
            ]);
            setOrders(ordersRes.data);
            const map = {};
            usersRes.data.forEach(u => { map[u.id] = u; });
            setUsersMap(map);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await ordersApi.updateStatus(orderId, { status: newStatus, adminId: user.id });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setSuccessId(orderId);
            setTimeout(() => setSuccessId(null), 2000);
        } catch {
            alert('Ошибка обновления статуса.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить неоплаченный заказ? Сборка вернется пользователю.")) return;
        try {
            await ordersApi.delete(id);
            loadOrders();
        } catch {
            alert("Ошибка удаления заказа.");
        }
    };

    if (loading) return <div className="text-center mt-20 text-brand-primary flex justify-center"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="container mx-auto py-8 px-3 md:px-0">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-brand-primary/20 rounded-xl">
                    <PackageSearch className="text-brand-primary" size={26} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl text-white font-bold">Панель заказов</h1>
                    <p className="text-slate-400 text-xs mt-1">Отслеживание и смена статусов всех заказов клиентов</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-slate-800">
                    <table className="w-full text-left text-sm text-slate-300 min-w-[800px]">
                        <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Покупатель</th>
                                <th className="px-6 py-4 font-semibold">Сборка</th>
                                <th className="px-6 py-4 font-semibold">Оплата</th>
                                <th className="px-6 py-4 font-semibold w-64">Управление статусом</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {orders.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-10 text-slate-500">Заказов пока нет</td></tr>
                            ) : (
                                orders.map(order => {
                                    const currentStatusObj = statuses.find(s => s.id === order.status || s.numericId === Number(order.status)) || statuses[0];
                                    const currentStatusColor = currentStatusObj.color;
                                    const selectValue = currentStatusObj.id;
                                    const customer = usersMap[order.userId];

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-800/30 transition group">
                                            <td className="px-6 py-4">
                                                {customer ? (
                                                    <div className="flex items-center gap-2">
                                                        <User className="text-slate-500 shrink-0" size={16} />
                                                        <div>
                                                            <p className="text-white font-bold text-sm">{customer.userName}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic text-xs">Пользователь удален</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-bold text-white text-sm mb-0.5">{order.build?.buildName}</p>
                                                        <p className="text-[10px] text-slate-500">ID: {order.id.substring(0, 8)}...</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedBuildId(order.buildId)}
                                                        className="text-slate-400 hover:text-brand-primary p-2 bg-slate-800 rounded-lg transition shrink-0"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-extrabold text-brand-primary text-sm mb-0.5">{order.totalPrice.toLocaleString()} BYN</p>
                                                <p className="text-[10px] text-slate-500">{order.paymentMethod || 'Не оплачено'}</p>
                                            </td>

                                            <td className="px-6 py-4 relative">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={selectValue}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={updatingId === order.id}
                                                        className={`bg-slate-800 border ${updatingId === order.id ? 'border-slate-600 opacity-50' : 'border-slate-700 hover:border-slate-500'} rounded-lg p-2 font-medium outline-none transition w-full cursor-pointer appearance-none text-xs md:text-sm ${currentStatusColor}`}
                                                    >
                                                        {statuses.map(s => (
                                                            <option key={s.id} value={s.id} className="text-slate-200 bg-slate-900 text-xs">{s.label}</option>
                                                        ))}
                                                    </select>

                                                    {selectValue === 'Pending' && (
                                                        <button
                                                            onClick={() => handleDelete(order.id)}
                                                            className="text-red-400 hover:text-white bg-red-400/10 hover:bg-red-600 p-2 rounded-lg transition shrink-0"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}

                                                    <div className="w-5 flex justify-center shrink-0">
                                                        {updatingId === order.id && <Loader2 size={16} className="animate-spin text-brand-primary" />}
                                                        {successId === order.id && <Check size={18} className="text-green-500" />}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBuildId && (
                <BuildDetailsModal
                    id={selectedBuildId}
                    onClose={() => setSelectedBuildId(null)}
                />
            )}
        </div>
    );
}