import { Link } from 'react-router-dom';
import { Cpu, Settings, BookOpen, Layers } from 'lucide-react'; // Добавили Layers

export default function Navbar() {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 py-4 px-6">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
                    <Cpu className="text-brand-primary" />
                    NeuroBuild<span className="text-brand-accent">PC</span>
                </Link>
                <div className="flex gap-4 md:gap-6 items-center flex-wrap">
                    <Link to="/catalog/cpus" className="hover:text-brand-primary transition text-slate-300 hover:text-white">Каталог</Link>
                    <Link to="/builder" className="hover:text-brand-primary transition text-slate-300 hover:text-white">Конфигуратор</Link>
                    <Link to="/builds" className="flex items-center gap-1 text-brand-primary hover:text-blue-400 font-medium transition">
                        <Layers size={18} /> Мои сборки
                    </Link>

                    <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>

                    <Link to="/admin" className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-md transition">
                        <Settings size={16} /> Детали
                    </Link>
                    <Link to="/admin/dictionaries" className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-md transition">
                        <BookOpen size={16} /> Справочники
                    </Link>
                </div>
            </div>
        </nav>
    );
}