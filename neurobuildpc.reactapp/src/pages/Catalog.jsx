import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogApi, componentsApi, pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import ComponentDetailsModal from '../components/ComponentDetailsModal';
import { ShoppingCart, Check, ChevronLeft, Plus, Database, Box, Loader2, Search, Filter, Eye, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', name: 'Все детали' },
    { id: 'cpus', name: 'Процессоры' },
    { id: 'motherboards', name: 'Материнские платы' },
    { id: 'gpus', name: 'Видеокарты' },
    { id: 'rams', name: 'ОЗУ' },
    { id: 'power-supplies', name: 'БП' },
    { id: 'cases', name: 'Корпуса' },
    { id: 'coolers', name: 'Кулеры' },
    { id: 'storages', name: 'Накопители' },
];

export default function Catalog() {
    const { category } = useParams();
    const navigate = useNavigate();
    const { activeBuildId } = useContext(BuilderContext);

    const activeCategory = category || 'all';

    const [items, setItems] = useState([]);
    const [addingId, setAddingId] = useState(null);
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [params, setParams] = useState({
        searchTerm: '',
        minPrice: 0,
        maxPrice: 100000,
        orderBy: 'price asc',
        componentType: ''
    });

    const fetchItems = async (isLoadMore = false) => {
        const targetPage = isLoadMore ? page + 1 : 1;
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const queryParams = {
                pageNumber: targetPage,
                pageSize: 12,
                searchTerm: params.searchTerm,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                orderBy: params.orderBy
            };

            let res;
            if (activeCategory === 'all') {
                if (params.componentType) queryParams.componentType = params.componentType;
                res = await componentsApi.getAll(queryParams);
            } else {
                switch (activeCategory) {
                    case 'cpus': res = await catalogApi.getCpus(queryParams); break;
                    case 'gpus': res = await catalogApi.getGpus(queryParams); break;
                    case 'motherboards': res = await catalogApi.getMotherboards(queryParams); break;
                    case 'rams': res = await catalogApi.getRams(queryParams); break;
                    case 'power-supplies': res = await catalogApi.getPowerSupplies(queryParams); break;
                    case 'cases': res = await catalogApi.getCases(queryParams); break;
                    case 'coolers': res = await catalogApi.getCoolers(queryParams); break;
                    case 'storages': res = await catalogApi.getStorages(queryParams); break;
                    default: res = { data: [] };
                }
            }

            const paginationHeader = res.headers['x-pagination'];
            if (paginationHeader) setPagination(JSON.parse(paginationHeader));

            if (isLoadMore) setItems(prev => [...prev, ...res.data]);
            else setItems(res.data);
            setPage(targetPage);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setItems([]);
        fetchItems(false);
    }, [activeCategory, params.orderBy, params.componentType]);

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setShowMobileFilters(false);
        fetchItems(false);
    };

    const handleAddToBuild = async (componentId) => {
        if (!activeBuildId) {
            alert("Создайте сборку в конфигураторе!");
            navigate('/builder');
            return;
        }
        setAddingId(componentId);
        try {
            await pcBuildsApi.addComponent(activeBuildId, componentId);
            navigate('/builder');
        } catch (error) {
            alert("Компонент несовместим или этот слот уже занят.");
        } finally {
            setAddingId(null);
        }
    };

    const hasMore = pagination && (pagination.HasNext || pagination.hasNext);

    return (
        <div className="px-2 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    {activeBuildId && (
                        <button onClick={() => navigate('/builder')} className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-2 rounded-xl transition">
                            <ChevronLeft size={16} /> Назад
                        </button>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Каталог деталей</h1>
                </div>

                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="md:hidden w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition border border-slate-700"
                >
                    <SlidersHorizontal size={18} />
                    {showMobileFilters ? "Скрыть фильтры" : "Параметры и фильтры"}
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 touch-pan-x">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/catalog/${cat.id}`)}
                        className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <form
                onSubmit={handleApplyFilters}
                className={`${showMobileFilters ? 'block' : 'hidden'} md:grid bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-8 grid-cols-1 md:grid-cols-12 gap-5 items-end shadow-xl animate-fade-in`}
            >
                <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Название</label>
                    <div className="flex bg-slate-800 rounded-xl border border-slate-700 overflow-hidden focus-within:border-brand-primary transition">
                        <input className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none" placeholder="Поиск по модели..." value={params.searchTerm} onChange={e => setParams({ ...params, searchTerm: e.target.value })} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                        <span>Мин. цена</span>
                        <span className="text-brand-primary font-bold">{params.minPrice.toLocaleString()} BYN</span>
                    </label>
                    <input type="range" min="0" max="100000" step="50" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" value={params.minPrice} onChange={e => setParams({ ...params, minPrice: Number(e.target.value) })} />
                </div>

                <div className="md:col-span-2">
                    <label className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                        <span>Макс. цена</span>
                        <span className="text-brand-primary font-bold">{params.maxPrice.toLocaleString()} BYN</span>
                    </label>
                    <input type="range" min="0" max="100000" step="50" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" value={params.maxPrice} onChange={e => setParams({ ...params, maxPrice: Number(e.target.value) })} />
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Сортировка</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer" value={params.orderBy} onChange={e => setParams({ ...params, orderBy: e.target.value })}>
                        <option value="price asc">Дешевые сначала</option>
                        <option value="price desc">Дорогие сначала</option>
                        <option value="name asc">А - Я</option>
                        <option value="name desc">Я - А</option>
                    </select>
                </div>

                {activeCategory === 'all' && (
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Раздел</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none" value={params.componentType} onChange={e => setParams({ ...params, componentType: e.target.value })}>
                            <option value="">Все категории</option>
                            <option value="CPU">Процессоры</option>
                            <option value="GPU">Видеокарты</option>
                            <option value="Motherboard">Мат. платы</option>
                            <option value="RAM">ОЗУ</option>
                            <option value="PSU">Блоки питания</option>
                            <option value="Case">Корпуса</option>
                            <option value="Cooler">Охлаждение</option>
                        </select>
                    </div>
                )}

                <div className="md:col-span-2">
                    <button type="submit" className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                        <Filter size={16} /> Применить
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(n => <div key={n} className="bg-slate-900 h-80 rounded-2xl border border-slate-800"></div>)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Нет подходящих товаров</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-brand-primary/50 transition flex flex-col group shadow-md">
                                <div
                                    onClick={() => setSelectedComponentId(item.id)}
                                    className="bg-white/5 rounded-xl p-4 mb-4 flex items-center justify-center h-44 overflow-hidden cursor-pointer hover:bg-white/10 transition"
                                >
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" /> : <Box size={40} className="text-slate-700" />}
                                </div>

                                <h3
                                    onClick={() => setSelectedComponentId(item.id)}
                                    className="font-bold text-slate-200 text-sm mb-1 leading-tight line-clamp-2 cursor-pointer hover:text-brand-primary transition"
                                    title={item.name}
                                >
                                    {item.name}
                                </h3>

                                <p className="text-xs text-slate-500 mb-4">{item.manufacturerName && `${item.manufacturerName} • `}{item.componentType}</p>

                                <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-lg font-black text-white">{item.price.toLocaleString()} BYN</span>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setSelectedComponentId(item.id)}
                                            className="bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg transition"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {activeBuildId ? (
                                            <button onClick={() => handleAddToBuild(item.id)} disabled={addingId === item.id} className="bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white p-2.5 rounded-lg transition">
                                                {addingId === item.id ? <Check size={18} /> : <Plus size={18} />}
                                            </button>
                                        ) : (
                                            <button className="bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg transition"><ShoppingCart size={18} /></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => fetchItems(true)}
                                disabled={loadingMore}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-lg"
                            >
                                {loadingMore ? <><Loader2 className="animate-spin" size={18} /> Загрузка...</> : 'Показать еще'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedComponentId && (
                <ComponentDetailsModal
                    id={selectedComponentId}
                    onClose={() => setSelectedComponentId(null)}
                />
            )}
        </div>
    );
}