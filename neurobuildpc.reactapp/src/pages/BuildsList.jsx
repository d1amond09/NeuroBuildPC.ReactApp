// src/pages/BuildsList.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Edit3, Plus, Monitor, Calendar } from 'lucide-react';

export default function BuildsList() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setActiveBuildId, activeBuildId } = useContext(BuilderContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchBuilds = async () => {
        setLoading(true);
        try {
            const res = await pcBuildsApi.getAll({ userId: user?.id });
            setBuilds(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBuilds();
        }
    }, [user]);

    const handleContinueBuilding = (id) => {
        setActiveBuildId(id);
        navigate('/builder');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить эту сборку навсегда?")) return;
        try {
            await pcBuildsApi.deleteBuild(id);
            if (activeBuildId === id) setActiveBuildId(null);
            fetchBuilds();
        } catch (error) {
            alert("Ошибка удаления сборки");
        }
    };

    const handleCreateNew = () => {
        setActiveBuildId(null);
        navigate('/builder');
    };

    return (
        <div className="container mx-auto py-8 px-3 md:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <Monitor className="text-brand-primary" />
                    Мои сборки
                </h1>
                <button
                    onClick={handleCreateNew}
                    className="bg-brand-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg shadow-brand-primary/20 text-sm"
                >
                    <Plus size={18} /> Новая сборка
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Загрузка конфигураций...</div>
            ) : builds.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 text-center text-slate-400">
                    <Monitor size={64} className="mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">У вас пока нет сохраненных ПК</h2>
                    <p className="mb-6 text-sm">Создайте свою первую сборку в конфигураторе.</p>
                    <button onClick={handleCreateNew} className="text-brand-primary font-bold hover:underline text-sm">Перейти в конфигуратор →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {builds.map(build => (
                        <div key={build.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-brand-primary/30 transition flex flex-col group relative overflow-hidden shadow-xl">
                            {activeBuildId === build.id && (
                                <div className="absolute top-0 right-0 bg-green-500/15 text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-green-500/10">
                                    Активная
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-white mb-2 pr-16 truncate" title={build.name}>{build.name}</h3>

                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-6">
                                <Calendar size={14} />
                                {new Date(build.createdAt).toLocaleDateString('ru-RU')}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Стоимость</p>
                                    <p className="text-xl font-black text-brand-accent">{build.totalPrice.toLocaleString()} BYN</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleContinueBuilding(build.id)}
                                        className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white p-2.5 rounded-xl transition"
                                        title="Редактировать в конфигураторе"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(build.id)}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition"
                                        title="Удалить конфигурацию"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}