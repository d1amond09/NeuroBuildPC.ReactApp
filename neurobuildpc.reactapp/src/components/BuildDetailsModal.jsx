// src/components/BuildDetailsModal.jsx
import { useState, useEffect } from 'react';
import { pcBuildsApi } from '../api/services';
import ComponentDetailsModal from './ComponentDetailsModal';
import { X, Loader2, Monitor, Eye, Image } from 'lucide-react';

export default function BuildDetailsModal({ id, onClose }) {
    const [build, setBuild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedComponentId, setSelectedComponentId] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        pcBuildsApi.getBuild(id)
            .then(res => setBuild(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (!id) return null;

    const getComponentsList = () => {
        if (!build) return [];
        const list = [];
        if (build.selectedCpu) list.push(build.selectedCpu);
        if (build.selectedMotherboard) list.push(build.selectedMotherboard);
        if (build.selectedGpu) list.push(build.selectedGpu);
        if (build.selectedRam) list.push(build.selectedRam);
        if (build.selectedPsu) list.push(build.selectedPsu);
        if (build.selectedCase) list.push(build.selectedCase);
        if (build.selectedCooler) list.push(build.selectedCooler);
        if (build.storages && build.storages.length > 0) {
            build.storages.forEach(s => list.push(s));
        }
        return list;
    };

    const components = getComponentsList();

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/85 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border-t md:border border-slate-800 rounded-t-2xl md:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden h-[90vh] md:h-auto">

                    <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50">
                        <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            <Monitor className="text-brand-primary shrink-0" size={22} />
                            <span className="truncate max-w-[200px] sm:max-w-none">{build?.name || 'Загрузка...'}</span>
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
                            <X size={24} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-brand-primary" size={36} /></div>
                    ) : (
                        <div className="p-5 space-y-5 h-[calc(90vh-70px)] md:h-auto">
                            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1 scrollbar-none pb-12 md:pb-2">
                                {components.length === 0 ? (
                                    <p className="text-center text-slate-500 italic py-12">В этой сборке еще нет выбранных деталей</p>
                                ) : (
                                    components.map((c, index) => (
                                        <div key={`${c.id}-${index}`} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-brand-primary/50 transition duration-200 gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                                    {c.imageUrl ? <img src={c.imageUrl} alt="img" className="max-h-full max-w-full object-contain" /> : <Image size={16} className="text-slate-700" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold text-sm truncate leading-tight">{c.name}</p>
                                                    <p className="text-[10px] text-brand-primary font-bold mt-1 uppercase tracking-wider">{c.componentType}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-extrabold text-slate-200 text-sm">{c.price.toLocaleString()} BYN</span>
                                                <button
                                                    onClick={() => setSelectedComponentId(c.id)}
                                                    className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-lg transition"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900 sticky bottom-0">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Общая стоимость</p>
                                    <p className="text-3xl font-black text-brand-primary">{build.totalPrice.toLocaleString()} BYN</p>
                                </div>
                                <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition">
                                    Закрыть состав
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedComponentId && (
                <ComponentDetailsModal
                    id={selectedComponentId}
                    onClose={() => setSelectedComponentId(null)}
                />
            )}
        </>
    );
}