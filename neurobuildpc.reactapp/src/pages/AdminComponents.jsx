import { useState, useEffect } from 'react';
import { catalogApi, componentsApi, dictionariesApi } from '../api/services';
import { Edit, Trash2, Plus, X, Server } from 'lucide-react';

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
        { name: 'gpuChipset', label: 'Чипсет (напр. RTX 4090)', type: 'text' },
        { name: 'videoMemoryGB', label: 'Видеопамять (GB)', type: 'number' },
        { name: 'lengthMm', label: 'Длина (мм)', type: 'number' },
        { name: 'tdpWattage', label: 'TDP (Ватт)', type: 'number' },
        { name: 'recommendedPsuWattage', label: 'Рекомендуемый БП (Ватт)', type: 'number' },
    ],
    'Motherboard': [
        { name: 'socketTypeId', readName: 'socketName', label: 'Сокет', type: 'guid', dictionary: 'sockettypes' },
        { name: 'formFactorId', readName: 'formFactorName', label: 'Форм-фактор', type: 'guid', dictionary: 'formfactors' },
        { name: 'supportedMemoryId', readName: 'supportedMemoryName', label: 'Поддерживаемая память', type: 'guid', dictionary: 'memorytypes' },
        { name: 'chipset', label: 'Чипсет (напр. Z790)', type: 'text' },
        { name: 'memorySlots', label: 'Слоты памяти', type: 'number' },
        { name: 'maxMemoryCapacityGB', label: 'Макс. память (GB)', type: 'number' },
        { name: 'm2Slots', label: 'Слоты M.2', type: 'number' },
    ],
    'RAM': [
        { name: 'memoryTypeId', readName: 'memoryTypeName', label: 'Тип памяти', type: 'guid', dictionary: 'memorytypes' },
        { name: 'totalCapacityGB', label: 'Общий объем (GB)', type: 'number' },
        { name: 'modulesCount', label: 'Количество планок', type: 'number' },
        { name: 'speedMHz', label: 'Частота (MHz)', type: 'number' },
        { name: 'casLatency', label: 'Тайминг (CL)', type: 'number' },
    ],
    'PSU': [
        { name: 'formFactorId', readName: 'formFactorName', label: 'Форм-фактор', type: 'guid', dictionary: 'formfactors' },
        { name: 'wattage', label: 'Мощность (Ватт)', type: 'number' },
        { name: 'efficiencyRating', label: 'Сертификат (напр. 80+ Gold)', type: 'text' },
        { name: 'isModular', label: 'Модульный', type: 'checkbox' },
    ],
    'Case': [
        { name: 'maxMotherboardSizeId', readName: 'maxMotherboardSizeName', label: 'Макс. форм-фактор мат. платы', type: 'guid', dictionary: 'formfactors' },
        { name: 'maxGpuLengthMm', label: 'Макс. длина GPU (мм)', type: 'number' },
        { name: 'maxCpuCoolerHeightMm', label: 'Макс. высота кулера (мм)', type: 'number' },
    ],
    'Storage': [
        { name: 'storageTypeId', readName: 'storageTypeName', label: 'Тип накопителя', type: 'guid', dictionary: 'storagetypes' },
        { name: 'capacityGB', label: 'Объем (GB)', type: 'number' },
        { name: 'readSpeedMBps', label: 'Скорость чтения (MB/s)', type: 'number' },
    ],
    'Cooler': [
        { name: 'coolerTypeId', readName: 'coolerTypeName', label: 'Тип охлаждения', type: 'guid', dictionary: 'coolertypes' },
        { name: 'maxCoolingTdpW', label: 'Рассеиваемая мощность (TDP)', type: 'number' },
        { name: 'heightMm', label: 'Высота (мм)', type: 'number' },
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

    // Единое состояние для всех справочников
    const [dictionaries, setDictionaries] = useState({
        manufacturers: [],
        sockettypes: [],
        formfactors: [],
        memorytypes: [],
        storagetypes: [],
        coolertypes: []
    });

    // Состояние модалки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    // Загрузка всех справочников при старте
    useEffect(() => {
        const fetchAllDictionaries = async () => {
            try {
                const types = Object.keys(dictionaries);
                const promises = types.map(type => dictionariesApi.getItems(type));
                const results = await Promise.all(promises);

                const newDicts = {};
                types.forEach((type, index) => {
                    newDicts[type] = results[index].data;
                });

                setDictionaries(newDicts);
            } catch (err) {
                console.error("Ошибка загрузки справочников", err);
            }
        };
        fetchAllDictionaries();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Обновленная функция загрузки
    const loadItems = async (isLoadMore = false) => {
        const targetPage = isLoadMore ? page + 1 : 1;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const categoryMeta = CATEGORIES.find(c => c.id === activeTab);
            // Берем по 15 штук на страницу для админки
            const params = { pageNumber: targetPage, pageSize: 15 };

            const res = await catalogApi[categoryMeta.method](params);

            // Обработка X-Pagination
            const paginationHeader = res.headers['x-pagination'];
            if (paginationHeader) {
                const meta = JSON.parse(paginationHeader);
                setHasMore(meta.HasNext || meta.hasNext);
            } else {
                setHasMore(false);
            }

            if (isLoadMore) {
                setItems(prev => [...prev, ...res.data]);
            } else {
                setItems(res.data);
            }

            setPage(targetPage);
        } catch (error) {
            console.error("Ошибка загрузки списка", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Обновленный useEffect
    useEffect(() => {
        setItems([]);
        loadItems(false);
    }, [activeTab]);

    const handleCreateNew = () => {
        setEditingId(null);
        setFormData({
            componentType: activeTab,
            name: '',
            manufacturerId: '',
            price: 0,
            stockQuantity: 10,
            imageUrl: '',
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (id) => {
        try {
            const res = await componentsApi.getById(id);
            const data = res.data;

            // 1. Восстанавливаем ID производителя по его имени из DTO
            const manufacturer = dictionaries.manufacturers.find(m => m.name === data.manufacturerName);
            const manufacturerId = manufacturer ? manufacturer.id : '';

            // Базовые данные формы
            const mappedData = {
                ...data,
                componentType: activeTab,
                manufacturerId
            };

            // 2. Восстанавливаем ID для специфичных полей-справочников (Сокеты, Память и т.д.)
            const schema = COMPONENT_SCHEMAS[activeTab] || [];
            schema.forEach(field => {
                if (field.type === 'guid' && field.readName) {
                    // Берем текстовое имя, которое прислал бэкенд (напр. "AM5")
                    const stringNameFromBackend = data[field.readName];
                    // Ищем этот элемент в нашем справочнике
                    const dictionaryArray = dictionaries[field.dictionary] || [];
                    const foundItem = dictionaryArray.find(item => item.name === stringNameFromBackend);

                    // Записываем найденный Guid в форму
                    mappedData[field.name] = foundItem ? foundItem.id : '';
                }
            });

            setFormData(mappedData);
            setEditingId(id);
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            alert("Ошибка загрузки компонента");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Точно удалить этот компонент?")) return;
        try {
            await componentsApi.delete(id);
            loadItems();
        } catch (error) {
            alert("Ошибка удаления. Возможно компонент используется в сборке.");
        }
    };

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;

        let finalValue = value;
        if (type === 'checkbox') finalValue = checked;
        else if (type === 'number') finalValue = value === '' ? 0 : Number(value);

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, componentType: activeTab };

            if (editingId) {
                await componentsApi.update(editingId, payload);
            } else {
                await componentsApi.create(payload);
            }

            setIsModalOpen(false);
            loadItems();
        } catch (error) {
            console.log(editingId);
            console.log(formData);
            console.log(payload);
            console.error(error);
            alert("Ошибка сохранения. Убедитесь, что заполнены все выпадающие списки!");
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Server className="text-brand-primary" />
                    Управление компонентами
                </h1>
                <button
                    onClick={handleCreateNew}
                    className="bg-brand-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
                >
                    <Plus size={20} /> Добавить {activeTab}
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === cat.id
                                ? 'text-brand-primary border-b-2 border-brand-primary'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {cat.id}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Название</th>
                            <th className="px-6 py-4">Цена</th>
                            <th className="px-6 py-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500 animate-pulse">Загрузка...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">Нет данных</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                    <td className="px-6 py-4 font-bold text-brand-accent">{item.price} ₽</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => handleEdit(item.id)} className="text-blue-400 hover:text-blue-300 p-2 bg-blue-400/10 rounded-lg transition">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Кнопка подгрузки в админке */}
            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => loadItems(true)}
                        disabled={loadingMore}
                        className="bg-slate-800 hover:bg-slate-700 text-brand-primary font-medium py-2 px-6 rounded-lg border border-slate-700 transition"
                    >
                        {loadingMore ? 'Загрузка...' : 'Загрузить следующие 15 записей ↓'}
                    </button>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl my-8 relative shadow-2xl">

                        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-white">
                                {editingId ? 'Редактировать' : 'Добавить'} {activeTab}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* БАЗОВЫЕ ПОЛЯ */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-brand-primary font-semibold uppercase text-xs tracking-wider">Базовые характеристики</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Название *</label>
                                            <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition" />
                                        </div>
                                        <div>
                                            {/* Производитель - это тоже выпадающий список (берется из dictionaries.manufacturers) */}
                                            <label className="block text-sm text-slate-400 mb-1">Производитель *</label>
                                            <select required name="manufacturerId" value={formData.manufacturerId || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-primary outline-none transition">
                                                <option value="">-- Выберите --</option>
                                                {dictionaries.manufacturers.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Цена (₽) *</label>
                                            <input required type="number" step="0.01" name="price" value={formData.price || 0} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-primary outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Остаток на складе</label>
                                            <input required type="number" name="stockQuantity" value={formData.stockQuantity || 0} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-primary outline-none transition" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-slate-400 mb-1">URL Изображения</label>
                                            <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-primary outline-none transition" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                <hr className="md:col-span-2 border-slate-800 my-2" />

                                {/* СПЕЦИФИЧНЫЕ ПОЛЯ (С ИСПОЛЬЗОВАНИЕМ ВЫПАДАЮЩИХ СПИСКОВ) */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-brand-accent font-semibold uppercase text-xs tracking-wider">Технические характеристики ({activeTab})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {COMPONENT_SCHEMAS[activeTab]?.map(field => (
                                            <div key={field.name} className={field.type === 'checkbox' ? 'flex items-end pb-2' : ''}>

                                                {field.type !== 'checkbox' && <label className="block text-sm text-slate-400 mb-1">{field.label} *</label>}

                                                {/* Если тип поля - GUID (Справочник), рендерим Select */}
                                                {field.type === 'guid' ? (
                                                    <select
                                                        required
                                                        name={field.name}
                                                        value={formData[field.name] || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-accent outline-none transition"
                                                    >
                                                        <option value="">-- Выберите --</option>
                                                        {/* Берем нужный массив из состояния dictionaries */}
                                                        {dictionaries[field.dictionary]?.map(opt => (
                                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                        ))}
                                                    </select>
                                                )
                                                    // Если тип поля - Checkbox
                                                    : field.type === 'checkbox' ? (
                                                        <label className="flex items-center gap-2 cursor-pointer text-white">
                                                            <input
                                                                type="checkbox"
                                                                name={field.name}
                                                                checked={!!formData[field.name]}
                                                                onChange={handleChange}
                                                                className="w-5 h-5 accent-brand-accent bg-slate-800 rounded"
                                                            />
                                                            {field.label}
                                                        </label>
                                                    )
                                                        // Иначе - обычный Input (text/number)
                                                        : (
                                                            <input
                                                                required
                                                                type={field.type}
                                                                step={field.step || '1'}
                                                                name={field.name}
                                                                value={formData[field.name] || (field.type === 'number' ? 0 : '')}
                                                                onChange={handleChange}
                                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition"
                                                            />
                                                        )}
                                            </div>
                                        ))}

                                    </div>
                                </div>

                                {editingId && (
                                    <div className="md:col-span-2 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-white p-3 bg-slate-800/50 rounded-lg border border-slate-700 transition hover:bg-slate-800">
                                            <input type="checkbox" name="isActive" checked={!!formData.isActive} onChange={handleChange} className="w-5 h-5 accent-green-500 rounded" />
                                            Товар активен (виден в каталоге)
                                        </label>
                                    </div>
                                )}

                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800 bg-slate-900 sticky bottom-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition">Отмена</button>
                                <button type="submit" className="bg-brand-primary hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-brand-primary/20 transition">
                                    {editingId ? 'Сохранить изменения' : 'Создать деталь'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}