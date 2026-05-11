import { useState, useEffect } from 'react';
import { dictionariesApi } from '../api/services';
import { Edit, Trash2, Plus, X, BookOpen, Copy, Check } from 'lucide-react';

const DICTIONARY_TYPES = [
    { id: 'manufacturers', name: 'Производители' },
    { id: 'sockettypes', name: 'Сокеты' },
    { id: 'formfactors', name: 'Форм-факторы' },
    { id: 'memorytypes', name: 'Типы памяти' },
    { id: 'storagetypes', name: 'Типы накопителей' },
    { id: 'coolertypes', name: 'Типы охлаждения' }
];

export default function AdminDictionaries() {
    const [activeType, setActiveType] = useState('manufacturers');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Состояние копирования ID
    const [copiedId, setCopiedId] = useState(null);

    // Состояние модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [itemName, setItemName] = useState('');

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await dictionariesApi.getItems(activeType);
            setItems(res.data);
        } catch (error) {
            console.error("Ошибка загрузки справочника", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [activeType]);

    // Копирование GUID в буфер обмена
    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); // Убираем галочку через 2 сек
    };

    const handleCreateNew = () => {
        setEditingId(null);
        setItemName('');
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setItemName(item.name);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Точно удалить этот элемент? Это может сломать привязанные детали!")) return;
        try {
            await dictionariesApi.delete(activeType, id);
            loadItems();
        } catch (error) {
            alert("Ошибка удаления. Возможно, этот элемент уже используется в деталях.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await dictionariesApi.update(activeType, editingId, { name: itemName });
            } else {
                await dictionariesApi.create(activeType, { name: itemName });
            }
            setIsModalOpen(false);
            loadItems();
        } catch (error) {
            alert("Ошибка сохранения.");
        }
    };

    const activeTypeName = DICTIONARY_TYPES.find(t => t.id === activeType)?.name;

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="text-brand-accent" />
                    Справочники
                </h1>
                <button 
                    onClick={handleCreateNew}
                    className="bg-brand-accent hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-lg shadow-brand-accent/20"
                >
                    <Plus size={20} /> Добавить запись
                </button>
            </div>

            {/* Навигация по типам справочников */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {DICTIONARY_TYPES.map(type => (
                    <button 
                        key={type.id}
                        onClick={() => setActiveType(type.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeType === type.id 
                            ? 'bg-slate-800 text-brand-accent border border-slate-700' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* Таблица */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                    <h2 className="text-lg font-semibold text-white">Список: {activeTypeName}</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-xs border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Название</th>
                                <th className="px-6 py-4">ID (Guid)</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500 animate-pulse">Загрузка данных...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">В этом справочнике пока нет записей</td></tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white text-base">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleCopyId(item.id)}
                                                className="flex items-center gap-2 text-slate-500 hover:text-brand-primary font-mono text-xs bg-slate-800 px-3 py-1.5 rounded-md transition"
                                                title="Копировать ID"
                                            >
                                                {item.id}
                                                {copiedId === item.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 p-2 bg-blue-400/10 rounded-lg transition">
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
            </div>

            {/* МОДАЛЬНОЕ ОКНО */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        
                        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
                            <h2 className="text-lg font-bold text-white">
                                {editingId ? 'Редактировать запись' : 'Новая запись'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm text-slate-400 mb-2">Название ({activeTypeName}) *</label>
                                <input 
                                    required
                                    autoFocus
                                    type="text" 
                                    value={itemName} 
                                    onChange={(e) => setItemName(e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition"
                                    placeholder="Введите название..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition">
                                    Отмена
                                </button>
                                <button type="submit" className="bg-brand-accent hover:bg-purple-600 text-white font-medium px-5 py-2 rounded-lg shadow-lg shadow-brand-accent/20 transition">
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}