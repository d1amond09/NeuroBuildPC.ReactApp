import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import { Trash2, Edit3, Plus, Monitor, Calendar } from 'lucide-react';

export default function BuildsList() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setActiveBuildId, activeBuildId } = useContext(BuilderContext);
    const navigate = useNavigate();

    const fetchBuilds = async () => {
        setLoading(true);
        try {
            // В будущем сюда можно передавать { userId: currentUserId }, чтобы сервер фильтровал
            const res = await pcBuildsApi.getAll(); 
            setBuilds(res.data);
        } catch (error) {
            console.error("Ошибка загрузки сборок", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuilds();
    }, []);

    const handleContinueBuilding = (id) => {
        setActiveBuildId(id);
        navigate('/builder');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить эту сборку навсегда?")) return;
        try {
            await pcBuildsApi.deleteBuild(id);
            // Если удалили активную сборку, сбрасываем контекст
            if (activeBuildId === id) setActiveBuildId(null);
            fetchBuilds();
        } catch (error) {
            alert("Ошибка удаления сборки");
        }
    };

    const handleCreateNew = () => {
        setActiveBuildId(null); // Сбрасываем ID, конфигуратор сам создаст новую
        navigate('/builder');
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Monitor className="text-brand-primary" /> 
                    Управление сборками
                </h1>
                <button 
                    onClick={handleCreateNew}
                    className="bg-brand-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition shadow-lg shadow-brand-primary/20"
                >
                    <Plus size={20} /> Новая сборка
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Загрузка ваших конфигураций...</div>
            ) : builds.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Monitor size={64} className="mx-auto mb-4 opacity-20" />
                    <h2 className="text-2xl font-semibold text-white mb-2">У вас пока нет сохраненных ПК</h2>
                    <p className="mb-6">Создайте свою первую сборку и нейросеть проверит её на совместимость.</p>
                    <button onClick={handleCreateNew} className="text-brand-primary hover:underline">Перейти в конфигуратор →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {builds.map(build => (
                        <div key={build.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-brand-primary/50 transition-colors flex flex-col group relative overflow-hidden shadow-xl">
                            {/* Индикатор "Активной" сборки */}
                            {activeBuildId === build.id && (
                                <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    Текущая
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2 pr-10">{build.name}</h3>
                            
                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                <Calendar size={14} />
                                {new Date(build.createdAt).toLocaleDateString('ru-RU')}
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Итог</p>
                                    <p className="text-xl font-black text-brand-accent">{build.totalPrice.toLocaleString()} ₽</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleContinueBuilding(build.id)} 
                                        className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white p-2.5 rounded-lg transition"
                                        title="Редактировать"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(build.id)} 
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded-lg transition"
                                        title="Удалить"
                                    >
                                        <Trash2 size={20} />
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