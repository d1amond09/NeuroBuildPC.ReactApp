import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import CompatibilityReport from '../components/CompatibilityReport';
import { Plus, Trash2, Cpu, HardDrive, Zap, Box, Fan, Database, Edit2, Check, X } from 'lucide-react';

const COMPONENT_SLOTS = [
    { type: 'CPU', catalogRoute: 'cpus', name: 'Процессор', icon: <Cpu /> },
    { type: 'Motherboard', catalogRoute: 'motherboards', name: 'Материнская плата', icon: <Box /> },
    { type: 'GPU', catalogRoute: 'gpus', name: 'Видеокарта', icon: <Zap /> },
    { type: 'RAM', catalogRoute: 'rams', name: 'Оперативная память', icon: <Database /> },
    { type: 'PSU', catalogRoute: 'power-supplies', name: 'Блок питания', icon: <Zap /> },
    { type: 'Case', catalogRoute: 'cases', name: 'Корпус', icon: <Box /> },
    { type: 'Cooler', catalogRoute: 'coolers', name: 'Охлаждение (Кулер)', icon: <Fan /> },
    { type: 'Storage', catalogRoute: 'storages', name: 'Накопитель', icon: <HardDrive /> },
];

export default function PcBuilder() {
    const { activeBuildId, setActiveBuildId, userId } = useContext(BuilderContext);
    const [build, setBuild] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mlLoading, setMlLoading] = useState(false);

    // Состояния для редактирования имени
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const initOrLoadBuild = async () => {
            try {
                if (activeBuildId) {
                    const res = await pcBuildsApi.getBuild(activeBuildId);
                    setBuild(res.data);
                    setEditNameValue(res.data.name);
                } else {
                    const res = await pcBuildsApi.createBuild({ name: "Новая сборка", userId });
                    setActiveBuildId(res.data.id);
                    setBuild(res.data);
                    setEditNameValue(res.data.name);
                }
            } catch (error) {
                console.error("Ошибка загрузки сборки", error);
                if (error.response?.status === 404) {
                    setActiveBuildId(null);
                }
            } finally {
                setLoading(false);
            }
        };
        initOrLoadBuild();
    }, [activeBuildId, setActiveBuildId, userId]);

    // Функция сохранения нового имени сборки
    const handleSaveName = async () => {
        if (!editNameValue.trim()) return setIsEditingName(false);
        try {
            await pcBuildsApi.updateBuildName(activeBuildId, editNameValue);
            setBuild({ ...build, name: editNameValue });
            setIsEditingName(false);
        } catch (error) {
            alert("Не удалось переименовать сборку");
        }
    };

    const handleCreateNew = () => {
        setActiveBuildId(null); // Сброс вызовет useEffect и создаст новую сборку
    };

    const handleCheckCompatibility = async () => {
        setMlLoading(true);
        try {
            const res = await pcBuildsApi.checkCompatibility(activeBuildId);
            setReport(res.data);
        } catch (error) {
            alert("Ошибка при проверке совместимости.");
        } finally {
            setMlLoading(false);
        }
    };

    const handleRemoveComponent = async (componentType) => {
        try {
            await pcBuildsApi.removeComponent(activeBuildId, componentType);
            const res = await pcBuildsApi.getBuild(activeBuildId);
            setBuild(res.data);
            setReport(null);
        } catch (error) {
            console.error("Ошибка удаления", error);
        }
    };

    const getSelectedComponent = (type) => {
        if (!build) return null;
        switch (type) {
            case 'CPU': return build.selectedCpu;
            case 'Motherboard': return build.selectedMotherboard;
            case 'GPU': return build.selectedGpu;
            case 'RAM': return build.selectedRam;
            case 'PSU': return build.selectedPsu;
            case 'Case': return build.selectedCase;
            case 'Cooler': return build.selectedCooler;
            case 'Storage': return build.storages?.length > 0 ? build.storages[0] : null;
            default: return null;
        }
    };

    if (loading) return <div className="text-center mt-20 text-brand-primary animate-pulse">Загрузка конфигуратора...</div>;
    if (!build) return null;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
                <div className="flex-grow">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                autoFocus
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                className="bg-slate-800 border border-brand-primary rounded-lg px-3 py-1.5 text-2xl font-bold text-white outline-none w-full max-w-md"
                            />
                            <button onClick={handleSaveName} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"><Check size={20} /></button>
                            <button onClick={() => { setIsEditingName(false); setEditNameValue(build.name); }} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"><X size={20} /></button>
                        </div>
                    ) : (
                        <div className="group flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{build.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={20} />
                            </button>
                        </div>
                    )}
                    <p className="text-slate-400 text-sm flex gap-4">
                        <span>ID: <span className="font-mono text-xs text-slate-500">{build.id}</span></span>
                        <button onClick={handleCreateNew} className="text-brand-primary hover:underline text-xs flex items-center gap-1"><Plus size={12} /> Создать новую</button>
                    </p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                    <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Итоговая стоимость</p>
                    <p className="text-4xl font-black text-brand-primary">{build.totalPrice.toLocaleString()} ₽</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Левая колонка - Слоты комплектующих */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {COMPONENT_SLOTS.map((slot) => {
                        const selected = getSelectedComponent(slot.type);
                        return (
                            <div key={slot.type} className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between border transition-all ${selected ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-900 border-slate-800 border-dashed'}`}>
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className={`p-3 rounded-lg ${selected ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-800 text-slate-500'}`}>
                                        {slot.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">{slot.name}</p>
                                        <p className={`font-semibold ${selected ? 'text-white' : 'text-slate-600'}`}>
                                            {selected ? selected.name : 'Слот свободен'}
                                        </p>
                                        {/* Небольшой вывод характеристик для красоты */}
                                        {selected?.componentType === 'CPU' && <span className="text-xs text-slate-400 block mt-1">Сокет: {selected.socketName} • Ядра: {selected.cores}</span>}
                                        {selected?.componentType === 'GPU' && <span className="text-xs text-slate-400 block mt-1">Память: {selected.videoMemoryGB}GB</span>}
                                    </div>
                                </div>

                                {selected ? (
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                        <span className="font-bold text-lg text-slate-200">{selected.price.toLocaleString()} Br</span>
                                        <button onClick={() => handleRemoveComponent(slot.type)} className="text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-400/10 p-2 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/catalog/${slot.catalogRoute}`)}
                                        className="flex items-center justify-center w-full sm:w-auto gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 shadow-lg shadow-brand-primary/20 transition-all font-medium"
                                    >
                                        <Plus size={18} /> Выбрать
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Правая колонка - ML Проверка */}
                <div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 sticky top-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-brand-accent/20 p-2 rounded-lg text-brand-accent">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Нейро-проверка</h2>
                        </div>

                        <p className="text-sm text-slate-400 mb-6">
                            ML-модель проанализирует вашу сборку на узкие места (bottlenecks), совместимость сокетов, габариты корпуса и мощность БП.
                        </p>

                        <button
                            onClick={handleCheckCompatibility}
                            disabled={mlLoading || build.totalPrice === 0}
                            className="w-full bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2"
                        >
                            {mlLoading ? <Fan className="animate-spin" /> : 'Запустить анализ (ИИ)'}
                        </button>

                        <div className="mt-6">
                            <CompatibilityReport report={report} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}