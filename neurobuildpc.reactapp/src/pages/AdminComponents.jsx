// src/pages/AdminComponents.jsx
import { useState, useEffect } from 'react';
import { catalogApi, componentsApi, dictionariesApi } from '../api/services';
import { Edit, Trash2, Plus, X, Server, Search, Filter, Loader2, Image } from 'lucide-react';

const COMPONENT_SCHEMAS = {
    'CPU': [
        { name: 'socketTypeId', readName: 'socketName', label: 'Сокет', type: 'guid', dictionary: 'sockettypes' },
        { name: 'supportedMemoryId', readName: 'supportedMemoryName', label: 'Тип памяти', type: 'guid', dictionary: 'memorytypes' },
        { name: 'cores', label: 'Ядра', type: 'number' },
        { name: 'threads', label: 'Потоки', type: 'number' },
        { name: 'baseClockGhz', label: 'Базовая частота (GHz)', type: 'number', step: '0.1' },
        { name: 'tdpWattage', label: 'TDP (Ватт)', type: 'number' },
        { name: 'hasIntegratedGraphics', label: 'Встроенная графика', type: 'checkbox' },
    ],
    'GPU': [
        { name: 'gpuChipset', label: 'Чипсет (RTX 5070)', type: 'text' },
        { name: 'videoMemoryGB', label: 'Видеопамять (GB)', type: 'number' },
        { name: 'lengthMm', label: 'Длина (мм)', type: 'number' },
        { name: 'tdpWattage', label: 'TDP (Ватт)', type: 'number' },
        { name: 'recommendedPsuWattage', label: 'Рекомендуемый БП (Ватт)', type: 'number' },
    ],
    'Motherboard': [
        { name: 'socketTypeId', readName: 'socketName', label: 'Сокет', type: 'guid', dictionary: 'sockettypes' },
        { name: 'formFactorId', readName: 'formFactorName', label: 'Форм-фактор', type: 'guid', dictionary: 'formfactors' },
        { name: 'supportedMemoryId', readName: 'supportedMemoryName', label: 'Тип памяти', type: 'guid', dictionary: 'memorytypes' },
        { name: 'chipset', label: 'Чипсет', type: 'text' },
        { name: 'memorySlots', label: 'Слоты ОЗУ', type: 'number' },
        { name: 'maxMemoryCapacityGB', label: 'Макс. ОЗУ (GB)', type: 'number' },
        { name: 'm2Slots', label: 'Слоты M.2', type: 'number' },
    ],
    'RAM': [
        { name: 'memoryTypeId', readName: 'memoryTypeName', label: 'Тип', type: 'guid', dictionary: 'memorytypes' },
        { name: 'totalCapacityGB', label: 'Объем (GB)', type: 'number' },
        { name: 'modulesCount', label: 'Модулей', type: 'number' },
        { name: 'speedMHz', label: 'Частота (MHz)', type: 'number' },
        { name: 'casLatency', label: 'Тайминг (CL)', type: 'number' },
    ],
    'PSU': [
        { name: 'formFactorId', readName: 'formFactorName', label: 'Форм-фактор', type: 'guid', dictionary: 'formfactors' },
        { name: 'wattage', label: 'Мощность (Ватт)', type: 'number' },
        { name: 'efficiencyRating', label: 'Сертификат (80+ Gold)', type: 'text' },
        { name: 'isModular', label: 'Модульный', type: 'checkbox' },
    ],
    'Case': [
        { name: 'maxMotherboardSizeId', readName: 'maxMotherboardSizeName', label: 'Макс. мат. плата', type: 'guid', dictionary: 'formfactors' },
        { name: 'maxGpuLengthMm', label: 'Длина GPU (мм)', type: 'number' },
        { name: 'maxCpuCoolerHeightMm', label: 'Высота кулера (мм)', type: 'number' },
    ],
    'Storage': [
        { name: 'storageTypeId', readName: 'storageTypeName', label: 'Тип', type: 'guid', dictionary: 'storagetypes' },
        { name: 'capacityGB', label: 'Объем (GB)', type: 'number' },
        { name: 'readSpeedMBps', label: 'Скорость (MB/s)', type: 'number' },
    ],
    'Cooler': [
        { name: 'coolerTypeId', readName: 'coolerTypeName', label: 'Тип', type: 'guid', dictionary: 'coolertypes' },
        { name: 'maxCoolingTdpW', label: 'Отвод тепла (TDP)', type: 'number' },
        { name: 'heightMm', label: 'Высота (мм)', type: 'number' },
        { name: 'supportedSocketIds', label: 'Поддерживаемые сокеты', type: 'multiselect', dictionary: 'sockettypes' }
    ]
};

const CATEGORIES = [
    { id: 'CPU', method: 'getCpus' },
    { id: 'GPU', method: 'getGpus' },
    { id: 'Motherboard', method: 'getMotherboards' },
    { id: 'RAM', method: 'getRams' },
    { id: 'PSU', method: 'getPowerSupplies' },
    { id: 'Case', method: 'getCases' },
    { id: 'Cooler', method: 'getCoolers' },
    { id: 'Storage', method: 'getStorages' }
];

export default function AdminComponents() {
    const [activeTab, setActiveTab] = useState('CPU');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [params, setParams] = useState({ pageNumber: 1, pageSize: 10, searchTerm: '', minPrice: 0, maxPrice: 100000, orderBy: 'price asc' });
    const [pagination, setPagination] = useState(null);

    const [dictionaries, setDictionaries] = useState({
        manufacturers: [], sockettypes: [], formfactors: [], memorytypes: [], storagetypes: [], coolertypes: []
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchAllDictionaries = async () => {
            const types = Object.keys(dictionaries);
            const promises = types.map(type => dictionariesApi.getItems(type));
            const results = await Promise.all(promises);
            const newDicts = {};
            types.forEach((type, index) => newDicts[type] = results[index].data);
            setDictionaries(newDicts);
        };
        fetchAllDictionaries();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const categoryMeta = CATEGORIES.find(c => c.id === activeTab);
            const res = await catalogApi[categoryMeta.method](params);

            const paginationHeader = res.headers['x-pagination'];
            if (paginationHeader) setPagination(JSON.parse(paginationHeader));

            setItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadItems(); }, [activeTab, params.pageNumber, params.orderBy]);

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setShowMobileFilters(false);
        setParams(p => ({ ...p, pageNumber: 1 }));
        loadItems();
    };

    const handleCreateNew = () => {
        setEditingId(null);
        setImageFile(null);
        setFormData({ componentType: activeTab, name: '', description: '', manufacturerId: '', price: 0, stockQuantity: 10, imageUrl: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleEdit = async (id) => {
        try {
            const res = await componentsApi.getById(id);
            const data = res.data;
            setImageFile(null);

            const manufacturer = dictionaries.manufacturers.find(m => m.name === data.manufacturerName);
            const mappedData = { ...data, componentType: activeTab, manufacturerId: manufacturer ? manufacturer.id : '' };

            const schema = COMPONENT_SCHEMAS[activeTab] || [];
            schema.forEach(field => {
                if (field.type === 'guid' && field.readName) {
                    const stringName = data[field.readName];
                    const foundItem = (dictionaries[field.dictionary] || []).find(item => item.name === stringName);
                    mappedData[field.name] = foundItem ? foundItem.id : '';
                } else if (field.type === 'multiselect') {
                    mappedData[field.name] = data[field.name] || [];
                }
            });

            setFormData(mappedData);
            setEditingId(id);
            setIsModalOpen(true);
        } catch (error) {
            alert("Ошибка загрузки компонента");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Точно удалить?")) return;
        try {
            await componentsApi.delete(id);
            loadItems();
        } catch (error) {
            alert("Компонент задействован в сборке.");
        }
    };

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        let finalValue = value;
        if (type === 'checkbox') finalValue = checked;
        else if (type === 'number') finalValue = value === '' ? 0 : Number(value);
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCheckboxGroup = (fieldName, id, isChecked) => {
        setFormData(prev => {
            const list = prev[fieldName] || [];
            if (isChecked) return { ...prev, [fieldName]: [...list, id] };
            return { ...prev, [fieldName]: list.filter(item => item !== id) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalImageUrl = formData.imageUrl;
            if (imageFile) {
                try {
                    const uploadRes = await componentsApi.uploadImage(imageFile);
                    finalImageUrl = uploadRes.data.imageUrl;
                } catch (uploadError) {
                    alert("Ошибка загрузки Cloudinary.");
                    setIsSaving(false);
                    return;
                }
            }

            const payload = { ...formData, componentType: activeTab, imageUrl: finalImageUrl };

            if (editingId) await componentsApi.update(editingId, payload);
            else await componentsApi.create(payload);

            setIsModalOpen(false);
            loadItems();
        } catch (error) {
            alert("Проверьте заполнение обязательных полей.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-6 px-3 md:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <Server className="text-brand-primary" /> Детали ({activeTab})
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="md:hidden flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 font-bold"
                    >
                        Фильтры
                    </button>
                    <button onClick={handleCreateNew} className="flex-1 sm:flex-none bg-brand-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg">
                        <Plus size={18} /> Добавить
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-800 touch-pan-x scrollbar-none">
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setActiveTab(cat.id); setParams(p => ({ ...p, pageNumber: 1 })); }} className={`px-4 py-2 font-bold transition-colors whitespace-nowrap text-sm ${activeTab === cat.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-white'}`}>
                        {cat.id}
                    </button>
                ))}
            </div>

            <form onSubmit={handleApplyFilters} className={`${showMobileFilters ? 'grid' : 'hidden'} md:grid bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-6 grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-md`}>
                <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Поиск</label>
                    <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white outline-none" placeholder="Модель..." value={params.searchTerm} onChange={e => setParams({ ...params, searchTerm: e.target.value })} />
                </div>

                <div className="md:col-span-2">
                    <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>Мин</span>
                        <span className="text-brand-primary font-bold">{params.minPrice.toLocaleString()} BYN</span>
                    </label>
                    <input type="range" min="0" max="100000" step="50" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" value={params.minPrice} onChange={e => setParams({ ...params, minPrice: Number(e.target.value) })} />
                </div>

                <div className="md:col-span-2">
                    <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>Макс</span>
                        <span className="text-brand-primary font-bold">{params.maxPrice.toLocaleString()} BYN</span>
                    </label>
                    <input type="range" min="0" max="100000" step="50" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" value={params.maxPrice} onChange={e => setParams({ ...params, maxPrice: Number(e.target.value) })} />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Сортировка</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white outline-none" value={params.orderBy} onChange={e => setParams({ ...params, orderBy: e.target.value })}>
                        <option value="price asc">Цена (Возрастание)</option>
                        <option value="price desc">Цена (Убывание)</option>
                        <option value="name asc">Название (А-Я)</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg flex items-center justify-center transition"><Search size={18} /></button>
                </div>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
                <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-slate-800">
                    <table className="w-full text-left text-sm text-slate-300 min-w-[600px]">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 w-16">Фото</th>
                                <th className="px-6 py-4">Название</th>
                                <th className="px-6 py-4">Цена</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4" className="px-6 py-8 text-center text-brand-primary"><Loader2 className="animate-spin mx-auto" /></td></tr> :
                                items.length === 0 ? <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Ничего не найдено</td></tr> :
                                    items.map(item => (
                                        <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            <td className="px-6 py-2">
                                                {item.imageUrl ? <img src={item.imageUrl} alt="img" className="w-10 h-10 object-contain bg-white/5 rounded-lg border border-slate-800" /> : <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center"><Image size={16} /></div>}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white max-w-[250px] truncate">{item.name}</td>
                                            <td className="px-6 py-4 font-extrabold text-brand-accent">{item.price} BYN</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => handleEdit(item.id)} className="text-blue-400 bg-blue-400/10 p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 bg-red-400/10 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && pagination.TotalPages > 1 && (
                <div className="flex items-center gap-4 justify-center">
                    <button onClick={() => setParams({ ...params, pageNumber: params.pageNumber - 1 })} disabled={!pagination.HasPrevious} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 text-sm font-bold">Назад</button>
                    <span className="text-slate-400 text-sm font-bold">Страница {pagination.CurrentPage} из {pagination.TotalPages}</span>
                    <button onClick={() => setParams({ ...params, pageNumber: params.pageNumber + 1 })} disabled={!pagination.HasNext} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 text-sm font-bold">Вперед</button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-2 md:p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl my-auto shadow-2xl">
                        <div className="flex justify-between items-center p-5 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
                            <h2 className="text-lg md:text-xl font-bold text-white">{editingId ? 'Редактировать' : 'Добавить'} {activeTab}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={22} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-brand-primary font-bold uppercase text-xs tracking-wider">Базовые параметры</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1">Название *</label>
                                            <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-brand-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-slate-400 mb-1">Описание</label>
                                            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-brand-primary h-20 resize-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Производитель *</label>
                                            <select required name="manufacturerId" value={formData.manufacturerId || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none">
                                                <option value="">-- Выберите --</option>
                                                {dictionaries.manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Цена (BYN) *</label>
                                            <input required type="number" step="0.01" name="price" value={formData.price || 0} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Склад</label>
                                            <input required type="number" name="stockQuantity" value={formData.stockQuantity || 0} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none" />
                                        </div>
                                        <div className="md:col-span-2 mt-2">
                                            <label className="block text-xs text-slate-400 mb-2">Изображение</label>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                {formData.imageUrl && !imageFile && <img src={formData.imageUrl} alt="preview" className="w-16 h-16 object-contain bg-white/5 rounded-lg border border-slate-600" />}
                                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-800">
                                    <h3 className="text-brand-accent font-bold uppercase text-xs tracking-wider">Характеристики ({activeTab})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {COMPONENT_SCHEMAS[activeTab]?.map(field => (
                                            <div key={field.name} className={field.type === 'checkbox' ? 'flex items-end pb-2' : ''}>
                                                {field.type !== 'checkbox' && <label className="block text-xs text-slate-400 mb-1">{field.label} *</label>}
                                                {field.type === 'guid' ? (
                                                    <select required name={field.name} value={formData[field.name] || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none">
                                                        <option value="">-- Выберите --</option>
                                                        {dictionaries[field.dictionary]?.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                    </select>
                                                ) : field.type === 'multiselect' ? (
                                                    <div className="md:col-span-2">
                                                        <div className="flex flex-wrap gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700 max-h-40 overflow-y-auto scrollbar-none">
                                                            {dictionaries[field.dictionary]?.map(opt => (
                                                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-brand-accent transition">
                                                                    <input type="checkbox" checked={(formData[field.name] || []).includes(opt.id)} onChange={(e) => handleCheckboxGroup(field.name, opt.id, e.target.checked)} className="w-4 h-4 accent-brand-accent" />
                                                                    {opt.name}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : field.type === 'checkbox' ? (
                                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white">
                                                        <input type="checkbox" name={field.name} checked={!!formData[field.name]} onChange={handleChange} className="w-5 h-5 accent-brand-accent" /> {field.label}
                                                    </label>
                                                ) : (
                                                    <input required type={field.type} step={field.step || '1'} name={field.name} value={formData[field.name] || (field.type === 'number' ? 0 : '')} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {editingId && (
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-white p-3 bg-slate-800 rounded-xl border border-slate-700">
                                            <input type="checkbox" name="isActive" checked={!!formData.isActive} onChange={handleChange} className="w-5 h-5 accent-green-500" /> Активен
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-300 hover:bg-slate-800 rounded-lg text-sm font-semibold">Отмена</button>
                                <button type="submit" disabled={isSaving} className="bg-brand-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2 text-sm font-bold">
                                    {isSaving && <Loader2 className="animate-spin" size={16} />} Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}