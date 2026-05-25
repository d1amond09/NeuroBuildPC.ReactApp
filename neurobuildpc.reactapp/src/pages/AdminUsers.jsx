// src/pages/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { usersApi } from '../api/services';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldOff, Search, Loader2 } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [params, setParams] = useState({ pageNumber: 1, pageSize: 15, searchTerm: '', isBlocked: '', orderBy: 'UserName asc' });
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const res = await usersApi.getAll(params);
            setUsers(res.data);
            const pagHeader = res.headers['x-pagination'];
            if (pagHeader) setPagination(JSON.parse(pagHeader));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [params]);

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(users.map(u => u.id));
        else setSelectedIds([]);
    };

    const handleAction = async (actionFn) => {
        for (const id of selectedIds) await actionFn(id);
        setSelectedIds([]);
        load();
    };

    const toggleAdminRole = async (user) => {
        const isAdmin = user.roles?.includes("Admin");
        try {
            if (isAdmin) await usersApi.removeRole(user.id, "Admin");
            else await usersApi.addRole(user.id, "Admin");
            load();
        } catch {
            alert("Ошибка изменения роли");
        }
    };

    const isSingleSelected = selectedIds.length === 1;
    const selectedUser = isSingleSelected ? users.find(u => u.id === selectedIds[0]) : null;

    return (
        <div className="container mx-auto py-6 px-3 md:px-0">
            <h1 className="text-2xl md:text-3xl text-white font-bold mb-6">Пользователи</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex bg-slate-800 rounded-xl border border-slate-700 overflow-hidden focus-within:border-brand-primary transition">
                    <span className="p-3 text-slate-500"><Search size={16} /></span>
                    <input className="bg-transparent text-white w-full outline-none text-sm py-2.5" placeholder="Поиск по модели..." value={params.searchTerm} onChange={e => setParams({ ...params, searchTerm: e.target.value, pageNumber: 1 })} />
                </div>

                <select className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none text-sm cursor-pointer" value={params.isBlocked} onChange={e => setParams({ ...params, isBlocked: e.target.value, pageNumber: 1 })}>
                    <option value="">Все статусы</option>
                    <option value="true">Заблокированные</option>
                    <option value="false">Активные</option>
                </select>

                <select className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none text-sm cursor-pointer" value={params.orderBy} onChange={e => setParams({ ...params, orderBy: e.target.value, pageNumber: 1 })}>
                    <option value="UserName asc">Имя (А - Я)</option>
                    <option value="UserName desc">Имя (Я - А)</option>
                    <option value="Email asc">Почта (А - Я)</option>
                </select>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
                <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
                    <button onClick={() => handleAction(id => usersApi.updateStatus(id, 1))} className="bg-red-600/25 text-red-400 hover:bg-red-600 hover:text-white py-2.5 rounded-xl font-bold transition text-xs md:text-sm" disabled={!selectedIds.length}>Блок</button>
                    <button onClick={() => handleAction(id => usersApi.updateStatus(id, 0))} className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white py-2.5 rounded-xl font-bold transition text-xs md:text-sm" disabled={!selectedIds.length}>Разблок</button>
                    <button onClick={() => handleAction(id => usersApi.delete(id))} className="bg-red-950 text-red-200 hover:bg-red-800 hover:text-white py-2.5 rounded-xl font-bold transition text-xs md:text-sm" disabled={!selectedIds.length}>Удалить</button>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button onClick={() => navigate(`/admin/orders/${selectedIds[0]}`)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl font-bold transition text-xs md:text-sm disabled:opacity-50" disabled={!isSingleSelected}>
                        Заказы
                    </button>
                    <button onClick={() => toggleAdminRole(selectedUser)} className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 text-xs md:text-sm disabled:opacity-50" disabled={!isSingleSelected}>
                        {selectedUser?.roles?.includes("Admin") ? <><ShieldOff size={14} /> Снять права</> : <><Shield size={14} /> Права</>}
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
                <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-slate-800">
                    <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === users.length} className="w-4 h-4 accent-brand-primary" /></th>
                                <th className="p-4">Пользователь</th>
                                <th className="p-4">Электронная почта</th>
                                <th className="p-4">Роль в системе</th>
                                <th className="p-4">Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-brand-primary" /></td></tr> :
                                users.map(u => (
                                    <tr key={u.id} className={`border-b border-slate-800 hover:bg-slate-800/30 transition ${selectedIds.includes(u.id) ? 'bg-brand-primary/5' : ''}`}>
                                        <td className="p-4"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelect(u.id)} className="w-4 h-4 accent-brand-primary" /></td>
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={u.pictureUrl || 'https://via.placeholder.com/40'} alt="ava" className="w-9 h-9 rounded-full border border-slate-700 object-cover" />
                                            <div>
                                                <p className="font-bold text-white text-sm">{u.userName}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{u.firstName} {u.lastName}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">{u.email}</td>
                                        <td className="p-4">
                                            {u.roles?.includes("Admin") ? <span className="bg-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-lg border border-purple-500/20 font-bold">Администратор</span> : <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-lg">Пользователь</span>}
                                        </td>
                                        <td className="p-4">{u.isBlocked ? <span className="text-red-400 font-semibold text-xs">Заблокирован</span> : <span className="text-green-400 font-semibold text-xs">Активен</span>}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && pagination.TotalPages > 1 && (
                <div className="flex items-center gap-4 justify-center">
                    <button onClick={() => setParams({ ...params, pageNumber: params.pageNumber - 1 })} disabled={!pagination.HasPrevious} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 text-xs font-bold">Назад</button>
                    <span className="text-slate-400 text-xs font-bold">Страница {pagination.CurrentPage} из {pagination.TotalPages}</span>
                    <button onClick={() => setParams({ ...params, pageNumber: params.pageNumber + 1 })} disabled={!pagination.HasNext} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 text-xs font-bold">Вперед</button>
                </div>
            )}
        </div>
    );
}