// src/components/Navbar.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Settings, BookOpen, Layers, User, LogOut, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 py-4 px-4 md:px-6 relative z-40">
            <div className="container mx-auto flex justify-between items-center">

                <div className="flex items-center gap-8 lg:gap-12">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white shrink-0">
                        <Cpu className="text-brand-primary" />
                        NeuroBuild<span className="text-brand-accent">PC</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        <Link to="/catalog/all" className="text-slate-300 hover:text-white transition font-medium text-sm lg:text-base">Каталог</Link>
                        <Link to="/builder" className="text-slate-300 hover:text-white transition font-medium text-sm lg:text-base">Конфигуратор</Link>

                        {user && (
                            <Link to="/builds" className="flex items-center gap-1.5 text-brand-primary hover:text-blue-400 font-medium transition text-sm lg:text-base whitespace-nowrap">
                                <Layers size={18} /> Мои сборки
                            </Link>
                        )}
                    </div>
                </div>

                <button onClick={() => setIsOpen(true)} className="md:hidden text-slate-300 hover:text-white transition focus:outline-none p-1">
                    <Menu size={24} />
                </button>

                <div className="hidden md:flex gap-6 lg:gap-8 items-center">
                    {user?.roles?.includes('Admin') && (
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-slate-400 hover:text-white font-medium transition py-2 text-sm lg:text-base">
                                <span>Администрирование</span>
                                <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
                            </button>

                            <div className="absolute top-full right-0 mt-1 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                                <Link to="/admin/users" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-850 hover:text-white transition">
                                    <User size={14} /> Пользователи
                                </Link>
                                <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-850 hover:text-white transition">
                                    <Settings size={14} /> Компоненты
                                </Link>
                                <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-850 hover:text-white transition">
                                    <Layers size={14} /> Заказы
                                </Link>
                                <Link to="/admin/dictionaries" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-850 hover:text-white transition">
                                    <BookOpen size={14} /> Справочники
                                </Link>
                                <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-850 hover:text-white transition">
                                    <Settings size={14} /> ИИ Настройки
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="w-px h-6 bg-slate-800"></div>

                    {user ? (
                        <div className="flex items-center gap-4 lg:gap-6">
                            <Link to="/profile" className="flex items-center gap-2 text-white hover:text-brand-primary transition">
                                <img src={user.pictureUrl || '/default.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                                <span className="max-w-[100px] truncate font-medium text-sm lg:text-base">{user.userName}</span>
                            </Link>
                            <Link to="/orders" className="text-slate-300 hover:text-white text-sm transition">Заказы</Link>
                            <button onClick={handleLogout} className="text-red-400 hover:text-red-500 transition">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-300 hover:text-white font-medium transition text-sm lg:text-base">Войти</Link>
                            <Link to="/register" className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition text-sm lg:text-base">Регистрация</Link>
                        </div>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-slate-950 w-full max-w-[280px] h-full p-6 border-l border-slate-800 flex flex-col justify-between overflow-y-auto scrollbar-none animate-slide-in">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-900">
                                <span className="text-lg font-bold text-white flex items-center gap-2">
                                    <Cpu size={20} className="text-brand-primary" /> Меню
                                </span>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 text-sm font-medium">
                                <Link to="/catalog/all" className="text-slate-300 hover:text-white py-1">Каталог</Link>
                                <Link to="/builder" className="text-slate-300 hover:text-white py-1">Конфигуратор</Link>
                                {user && (
                                    <Link to="/builds" className="text-brand-primary hover:text-blue-400 py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                        <Layers size={16} /> Мои сборки
                                    </Link>
                                )}

                                {user?.roles?.includes('Admin') && (
                                    <div className="border-t border-slate-900 pt-3">
                                        <button
                                            onClick={() => setIsAdminOpen(!isAdminOpen)}
                                            className="w-full flex justify-between items-center text-slate-400 hover:text-white py-1.5 focus:outline-none"
                                        >
                                            <span className="flex items-center gap-2"><Settings size={16} /> Админ-панель</span>
                                            {isAdminOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {isAdminOpen && (
                                            <div className="pl-6 flex flex-col gap-2.5 mt-2 border-l border-slate-800/80">
                                                <Link to="/admin/users" className="text-slate-400 hover:text-white text-xs py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                                    <User size={14} /> Пользователи
                                                </Link>
                                                <Link to="/admin" className="text-slate-400 hover:text-white text-xs py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                                    <Settings size={14} /> Компоненты
                                                </Link>
                                                <Link to="/admin/orders" className="text-slate-400 hover:text-white text-xs py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                                    <Layers size={14} /> Заказы
                                                </Link>
                                                <Link to="/admin/dictionaries" className="text-slate-400 hover:text-white text-xs py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                                    <BookOpen size={14} /> Справочники
                                                </Link>
                                                <Link to="/admin/settings" className="text-slate-400 hover:text-white text-xs py-1 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                                    <Settings size={14} /> ИИ Настройки
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-900 mt-6 space-y-4">
                            {user ? (
                                <div className="flex flex-col gap-3">
                                    <Link to="/profile" className="flex items-center gap-3 text-white" onClick={() => setIsOpen(false)}>
                                        <img src={user.pictureUrl || '/default.png'} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                                        <span className="font-semibold text-sm truncate">{user.userName}</span>
                                    </Link>
                                    <Link to="/orders" className="text-slate-300 hover:text-white text-xs py-1" onClick={() => setIsOpen(false)}>Мои заказы</Link>
                                    <button onClick={handleLogout} className="text-red-400 hover:text-red-500 flex items-center gap-2 py-2 text-xs border-t border-slate-900/60 w-full text-left">
                                        <LogOut size={16} /> Выйти
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    <Link to="/login" className="text-slate-300 hover:text-white text-center py-2 rounded-xl border border-slate-800 text-sm font-semibold" onClick={() => setIsOpen(false)}>Войти</Link>
                                    <Link to="/register" className="bg-brand-primary text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600" onClick={() => setIsOpen(false)}>Регистрация</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}