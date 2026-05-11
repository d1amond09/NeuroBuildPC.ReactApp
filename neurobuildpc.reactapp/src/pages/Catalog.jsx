import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogApi, pcBuildsApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import { ShoppingCart, Check, ChevronLeft, Plus, Database, Box, Loader2 } from 'lucide-react';

const CATEGORIES = [
    { id: 'cpus', name: 'Процессоры' },
    { id: 'motherboards', name: 'Материнские платы' },
    { id: 'gpus', name: 'Видеокарты' },
    { id: 'rams', name: 'Оперативная память' },
    { id: 'power-supplies', name: 'Блоки питания' },
    { id: 'cases', name: 'Корпуса' },
    { id: 'coolers', name: 'Кулеры' },
    { id: 'storages', name: 'Накопители' },
];

export default function Catalog() {
    const { category } = useParams();
    const navigate = useNavigate();
    const { activeBuildId } = useContext(BuilderContext);

    const activeCategory = category || 'cpus';

    // Состояния данных
    const [items, setItems] = useState([]);
    const [addingId, setAddingId] = useState(null);

    // Состояния пагинации
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Функция загрузки данных (isLoadMore = true, если нажали "Показать еще")
    const fetchItems = async (isLoadMore = false) => {
        const targetPage = isLoadMore ? page + 1 : 1;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            // Передаем параметры пагинации на бэкенд
            const params = { pageNumber: targetPage, pageSize: 8 };

            let res;
            switch (activeCategory) {
                case 'cpus': res = await catalogApi.getCpus(params); break;
                case 'gpus': res = await catalogApi.getGpus(params); break;
                case 'motherboards': res = await catalogApi.getMotherboards(params); break;
                case 'rams': res = await catalogApi.getRams(params); break;
                case 'power-supplies': res = await catalogApi.getPowerSupplies(params); break;
                case 'cases': res = await catalogApi.getCases(params); break;
                case 'coolers': res = await catalogApi.getCoolers(params); break;
                case 'storages': res = await catalogApi.getStorages(params); break;
                default: res = { data: [] };
            }

            // Читаем заголовок пагинации (Axios переводит названия в нижний регистр)
            const paginationHeader = res.headers['x-pagination'];
            if (paginationHeader) {
                setPagination(JSON.parse(paginationHeader));
            }

            // Если это "Показать еще", добавляем к старым. Иначе - заменяем.
            if (isLoadMore) {
                setItems(prev => [...prev, ...res.data]);
            } else {
                setItems(res.data);
            }

            setPage(targetPage);

        } catch (error) {
            console.error("Ошибка загрузки каталога", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // При смене категории грузим 1-ю страницу
    useEffect(() => {
        setItems([]); // Очищаем старые данные, чтобы не мелькали
        fetchItems(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory]);

    const handleAddToBuild = async (componentId) => {
        if (!activeBuildId) {
            alert("Сначала создайте сборку в конфигураторе!");
            navigate('/builder');
            return;
        }
        setAddingId(componentId);
        try {
            await pcBuildsApi.addComponent(activeBuildId, componentId);
            navigate('/builder');
        } catch (error) {
            alert("Не удалось добавить компонент. Возможно слот уже занят.");
        } finally {
            setAddingId(null);
        }
    };

    // Проверяем, есть ли следующая страница (зависит от того, как бэкенд сериализует JSON, обычно HasNext или hasNext)
    const hasMore = pagination && (pagination.HasNext || pagination.hasNext);

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                {activeBuildId && (
                    <button onClick={() => navigate('/builder')} className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-2 rounded-lg transition">
                        <ChevronLeft size={18} /> Назад в конфигуратор
                    </button>
                )}
                <h1 className="text-3xl font-bold text-white">Каталог комплектующих</h1>
            </div>

            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/catalog/${cat.id}`)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-medium transition-all ${activeCategory === cat.id
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n} className="bg-slate-800 h-80 rounded-2xl"></div>)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl">В этой категории пока нет товаров</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-brand-primary/50 transition-colors flex flex-col group">
                                <div className="bg-white/5 rounded-xl p-4 mb-4 flex items-center justify-center h-48">
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" /> : <Box size={48} className="text-slate-700" />}
                                </div>
                                <h3 className="font-semibold text-slate-200 mb-1 leading-tight">{item.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">{item.manufacturerName && `${item.manufacturerName} • `}{item.componentType}</p>

                                <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-xl font-bold text-white">{item.price.toLocaleString()} ₽</span>
                                    {activeBuildId ? (
                                        <button onClick={() => handleAddToBuild(item.id)} disabled={addingId === item.id} className="bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white p-2.5 rounded-lg transition-colors">
                                            {addingId === item.id ? <Check size={20} /> : <Plus size={20} />}
                                        </button>
                                    ) : (
                                        <button className="bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg transition-colors"><ShoppingCart size={20} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* БЛОК ПАГИНАЦИИ */}
                    {hasMore && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => fetchItems(true)}
                                disabled={loadingMore}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-xl border border-slate-700 transition flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <><Loader2 className="animate-spin" size={20} /> Загружаем...</>
                                ) : (
                                    'Показать еще'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}