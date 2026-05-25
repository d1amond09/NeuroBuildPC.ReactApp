// src/pages/PcBuilder.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import CompatibilityReport from '../components/CompatibilityReport';
import PaymentSection from '../components/PaymentSection';
import { Plus, Trash2, Cpu, HardDrive, Zap, Box, Fan, Database, Edit2, Check, X } from 'lucide-react';

const COMPONENT_SLOTS = [
    { type: 'CPU', catalogRoute: 'cpus', name: 'Процессор', icon: <Cpu /> },
    { type: 'Motherboard', catalogRoute: 'motherboards', name: 'Материнская плата', icon: <Box /> },
    { type: 'GPU', catalogRoute: 'gpus', name: 'Видеокарта', icon: <Zap /> },
    { type: 'RAM', catalogRoute: 'rams', name: 'Оперативная память', icon: <Database /> },
    { type: 'PSU', catalogRoute: 'power-supplies', name: 'Блок питания', icon: <Zap /> },
    { type: 'Case', catalogRoute: 'cases', name: 'Корпус', icon: <Box /> },
    { type: 'Cooler', catalogRoute: 'coolers', name: 'Охлаждение', icon: <Fan /> },
];

export default function PcBuilder() {
    const { activeBuildId, setActiveBuildId, userId } = useContext(BuilderContext);
    const [build, setBuild] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mlLoading, setMlLoading] = useState(false);
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
                console.error(error);
                if (error.response?.status === 404) {
                    setActiveBuildId(null);
                }
            } finally {
                setLoading(false);
            }
        };
        initOrLoadBuild();
    }, [activeBuildId, setActiveBuildId, userId]);

    const handleSaveName = async () => {
        if (!editNameValue.trim()) return setIsEditingName(false);
        try {
            await pcBuildsApi.updateBuildName(activeBuildId, editNameValue);
            setBuild({ ...build, name: editNameValue });
            setIsEditingName(false);
        } catch {
            alert("Не удалось переименовать сборку");
        }
    };

    const handleCreateNew = () => setActiveBuildId(null);

    const handleCheckCompatibility = async () => {
        setMlLoading(true);
        try {
            const res = await pcBuildsApi.checkCompatibility(activeBuildId);
            setReport(res.data);
            const buildRes = await pcBuildsApi.getBuild(activeBuildId);
            setBuild(buildRes.data);
        } catch {
            alert("Ошибка проверки.");
        } finally {
            setMlLoading(false);
        }
    };

    const handleRemoveComponent = async (componentType, componentId = null) => {
        try {
            await pcBuildsApi.removeComponent(activeBuildId, componentType, componentId);
            const res = await pcBuildsApi.getBuild(activeBuildId);
            setBuild(res.data);
            setReport(null);
        } catch (error) {
            console.error(error);
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
            default: return null;
        }
    };

    if (loading) return <div className="text-center mt-20 text-brand-primary animate-pulse">Загрузка конфигуратора...</div>;
    if (!build) return null;

    return (
        <div className="px-2 md:px-0 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
                <div className="flex-grow">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 w-full">
                            <input
                                autoFocus
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                className="bg-slate-800 border border-brand-primary rounded-lg px-3 py-2 text-xl font-bold text-white outline-none w-full max-w-sm"
                            />
                            <button onClick={handleSaveName} className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"><Check size={18} /></button>
                            <button onClick={() => { setIsEditingName(false); setEditNameValue(build.name); }} className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"><X size={18} /></button>
                        </div>
                    ) : (
                        <div className="group flex items-center gap-2.5">
                            <h1 className="text-2xl md:text-3xl font-bold text-white truncate max-w-[250px] md:max-w-none">{build.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-brand-primary transition">
                                <Edit2 size={18} />
                            </button>
                        </div>
                    )}
                    <p className="text-slate-400 text-xs mt-2 flex flex-wrap gap-x-4 gap-y-1 items-center">
                        <span className="truncate max-w-[150px] md:max-w-none">ID: <span className="font-mono text-slate-500">{build.id}</span></span>
                        <button onClick={handleCreateNew} className="text-brand-primary hover:underline flex items-center gap-1"><Plus size={12} /> Создать новый</button>
                    </p>
                </div>

                <div className="text-left md:text-right border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 flex flex-col justify-end">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Сумма комплекта</p>
                    <p className="text-3xl md:text-4xl font-black text-brand-primary">{build.totalPrice.toLocaleString()} BYN</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    {COMPONENT_SLOTS.map((slot) => {
                        const selected = getSelectedComponent(slot.type);
                        return (
                            <div key={slot.type} className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between border gap-4 transition-all ${selected ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-900 border-slate-800 border-dashed'}`}>
                                <div className="flex items-start gap-3.5">
                                    <div className={`p-3 rounded-xl shrink-0 ${selected ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-800 text-slate-500'}`}>
                                        {slot.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400 mb-0.5">{slot.name}</p>
                                        <p className={`font-bold text-sm md:text-base leading-snug truncate ${selected ? 'text-white' : 'text-slate-600'}`}>
                                            {selected ? selected.name : 'Слот не заполнен'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex sm:flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0 shrink-0">
                                    {selected ? (
                                        <>
                                            <span className="font-black text-lg text-slate-100">{selected.price.toLocaleString()} BYN</span>
                                            <button onClick={() => handleRemoveComponent(slot.type)} className="text-slate-500 hover:text-red-400 bg-slate-800/80 p-2.5 rounded-lg transition ml-auto sm:ml-0">
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/catalog/${slot.catalogRoute}`)}
                                            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 shadow-md shadow-brand-primary/10 transition font-bold text-sm"
                                        >
                                            <Plus size={16} /> Выбрать
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-brand-primary/20 text-brand-primary"><HardDrive /></div>
                                <h3 className="font-bold text-white text-sm">Накопители (SSD/HDD)</h3>
                            </div>
                            <button onClick={() => navigate('/catalog/storages')} className="text-xs text-brand-primary hover:text-white flex items-center gap-1 bg-brand-primary/10 px-3 py-2 rounded-lg transition font-semibold">
                                <Plus size={14} /> Добавить
                            </button>
                        </div>

                        <div className="space-y-3">
                            {build.storages?.length === 0 && <p className="text-xs text-slate-500 italic py-2">Накопители не добавлены</p>}
                            {build.storages?.map((st, index) => (
                                <div key={`${st.id}-${index}`} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-800/60 gap-3">
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate">{st.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase mt-0.5">{st.capacityGB} GB • {st.storageTypeName}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-black text-slate-200 text-sm">{st.price.toLocaleString()} BYN</span>
                                        <button onClick={() => handleRemoveComponent('Storage', st.id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-brand-accent/20 p-2 rounded-xl text-brand-accent">
                                <Zap size={22} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Нейро-проверка</h2>
                        </div>
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                            ИИ проверит совместимость комплектующих, баланс процессора и видеокарты, а также соответствие питания и размеров корпуса.
                        </p>
                        <button
                            onClick={handleCheckCompatibility}
                            disabled={mlLoading || build.totalPrice === 0}
                            className="w-full bg-gradient-to-r from-brand-accent to-purple-600 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3.5 px-4 rounded-xl transition disabled:opacity-50 shadow-md flex justify-center items-center gap-2 text-sm"
                        >
                            {mlLoading ? <Loader2 className="animate-spin" size={18} /> : 'Запустить ИИ-анализ'}
                        </button>
                        <div className="mt-5">
                            <CompatibilityReport report={report} />
                        </div>
                    </div>

                    <PaymentSection build={build} report={report} />
                </div>
            </div>
        </div>
    );
}