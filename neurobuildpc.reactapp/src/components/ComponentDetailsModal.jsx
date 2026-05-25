// src/components/ComponentDetailsModal.jsx
import { useState, useEffect } from 'react';
import { componentsApi } from '../api/services';
import { X, Loader2, Cpu, Image } from 'lucide-react';

export default function ComponentDetailsModal({ id, onClose }) {
    const [spec, setSpec] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        componentsApi.getById(id)
            .then(res => setSpec(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (!id) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-950 border-t md:border border-slate-800 rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative h-[90vh] md:h-auto">

                <div className="flex justify-between items-center p-5 border-b border-slate-900 bg-slate-900/50">
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                        <Cpu className="text-brand-primary" size={18} />
                        Характеристики компонента
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
                        <X size={22} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
                ) : !spec ? (
                    <div className="p-8 text-center text-slate-500">Не удалось загрузить спецификации</div>
                ) : (
                    <div className="p-5 space-y-5 overflow-y-auto h-[calc(90vh-70px)] md:max-h-[70vh] scrollbar-none pb-12 md:pb-6">
                        <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div className="w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {spec.imageUrl ? <img src={spec.imageUrl} alt="img" className="max-h-full max-w-full object-contain" /> : <Image size={20} className="text-slate-600" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm leading-tight truncate">{spec.name}</h4>
                                <p className="text-xs text-brand-primary font-bold mt-1 uppercase">{spec.manufacturerName} • {spec.componentType}</p>
                            </div>
                        </div>

                        {spec.description && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Описание</h5>
                                <p className="text-sm text-slate-300 bg-slate-900/40 p-3.5 rounded-xl border border-slate-900/60 leading-relaxed text-xs md:text-sm">{spec.description}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Технические характеристики</h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-slate-900/30 p-4 rounded-xl border border-slate-900 text-xs md:text-sm">
                                {spec.componentType === 'CPU' && (
                                    <>
                                        <div className="text-slate-400">Сокет:</div><div className="text-white font-medium">{spec.socketName}</div>
                                        <div className="text-slate-400">Ядра / Потоки:</div><div className="text-white font-medium">{spec.cores} / {spec.threads}</div>
                                        <div className="text-slate-400">Частота:</div><div className="text-white font-medium">{spec.baseClockGhz} ГГц</div>
                                        <div className="text-slate-400">TDP:</div><div className="text-white font-medium">{spec.tdpWattage} Вт</div>
                                        <div className="text-slate-400">Тип ОЗУ:</div><div className="text-white font-medium">{spec.supportedMemoryName}</div>
                                        <div className="text-slate-400">Графика:</div><div className="text-white font-medium">{spec.hasIntegratedGraphics ? 'Есть' : 'Нет'}</div>
                                    </>
                                )}

                                {spec.componentType === 'GPU' && (
                                    <>
                                        <div className="text-slate-400">Чипсет:</div><div className="text-white font-medium">{spec.gpuChipset}</div>
                                        <div className="text-slate-400">Объем видеопамяти:</div><div className="text-white font-medium">{spec.videoMemoryGB} GB</div>
                                        <div className="text-slate-400">Длина видеокарты:</div><div className="text-white font-medium">{spec.lengthMm} мм</div>
                                        <div className="text-slate-400">TDP:</div><div className="text-white font-medium">{spec.tdpWattage} Вт</div>
                                        <div className="text-slate-400">Рек. БП:</div><div className="text-white font-medium">{spec.recommendedPsuWattage} Вт</div>
                                    </>
                                )}

                                {spec.componentType === 'Motherboard' && (
                                    <>
                                        <div className="text-slate-400">Сокет:</div><div className="text-white font-medium">{spec.socketName}</div>
                                        <div className="text-slate-400">Форм-фактор:</div><div className="text-white font-medium">{spec.formFactorName}</div>
                                        <div className="text-slate-400">Тип ОЗУ:</div><div className="text-white font-medium">{spec.supportedMemoryName}</div>
                                        <div className="text-slate-400">Чипсет:</div><div className="text-white font-medium">{spec.chipset}</div>
                                        <div className="text-slate-400">Слотов ОЗУ:</div><div className="text-white font-medium">{spec.memorySlots}</div>
                                        <div className="text-slate-400">Слотов M.2:</div><div className="text-white font-medium">{spec.m2Slots}</div>
                                    </>
                                )}

                                {spec.componentType === 'RAM' && (
                                    <>
                                        <div className="text-slate-400">Тип:</div><div className="text-white font-medium">{spec.memoryTypeName}</div>
                                        <div className="text-slate-400">Объем комплекта:</div><div className="text-white font-medium">{spec.totalCapacityGB} GB</div>
                                        <div className="text-slate-400">Кол-во планок:</div><div className="text-white font-medium">{spec.modulesCount} шт</div>
                                        <div className="text-slate-400">Частота:</div><div className="text-white font-medium">{spec.speedMHz} МГц</div>
                                        <div className="text-slate-400">Тайминг (CL):</div><div className="text-white font-medium">{spec.casLatency}</div>
                                    </>
                                )}

                                {spec.componentType === 'PSU' && (
                                    <>
                                        <div className="text-slate-400">Форм-фактор:</div><div className="text-white font-medium">{spec.formFactorName}</div>
                                        <div className="text-slate-400">Мощность:</div><div className="text-white font-medium">{spec.wattage} Вт</div>
                                        <div className="text-slate-400">Сертификат:</div><div className="text-white font-medium">{spec.efficiencyRating}</div>
                                        <div className="text-slate-400">Кабельная система:</div><div className="text-white font-medium">{spec.isModular ? 'Модульный' : 'Стандарт'}</div>
                                    </>
                                )}

                                {spec.componentType === 'Case' && (
                                    <>
                                        <div className="text-slate-400">Макс. мат.плата:</div><div className="text-white font-medium">{spec.maxMotherboardSizeName}</div>
                                        <div className="text-slate-400">Макс. длина GPU:</div><div className="text-white font-medium">{spec.maxGpuLengthMm} мм</div>
                                        <div className="text-slate-400">Макс. кулер CPU:</div><div className="text-white font-medium">{spec.maxCpuCoolerHeightMm} мм</div>
                                    </>
                                )}

                                {spec.componentType === 'Storage' && (
                                    <>
                                        <div className="text-slate-400">Тип диска:</div><div className="text-white font-medium">{spec.storageTypeName}</div>
                                        <div className="text-slate-400">Объем:</div><div className="text-white font-medium">{spec.capacityGB} GB</div>
                                        <div className="text-slate-400">Чтение (MB/s):</div><div className="text-white font-medium">{spec.readSpeedMBps}</div>
                                    </>
                                )}

                                {spec.componentType === 'Cooler' && (
                                    <>
                                        <div className="text-slate-400">Тип:</div><div className="text-white font-medium">{spec.coolerTypeName}</div>
                                        <div className="text-slate-400">Отвод тепла:</div><div className="text-white font-medium">{spec.maxCoolingTdpW} Вт</div>
                                        <div className="text-slate-400">Высота радиатора:</div><div className="text-white font-medium">{spec.heightMm} мм</div>
                                        <div className="text-slate-400">Совместимые сокеты:</div><div className="text-white font-medium text-[10px] leading-relaxed">{spec.supportedSockets?.join(', ')}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-900 flex justify-between items-center bg-slate-950 sticky bottom-0">
                            <span className="text-slate-500 text-[10px] font-mono">ID: {spec.id.substring(0, 8)}...</span>
                            <span className="text-xl md:text-2xl font-black text-brand-primary">{spec.price.toLocaleString()} BYN</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}