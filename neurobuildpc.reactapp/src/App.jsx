import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BuilderProvider } from './context/BuilderContext';
import Navbar from './components/Navbar';
import PcBuilder from './pages/PcBuilder';
import AdminComponents from './pages/AdminComponents';
import AdminDictionaries from './pages/AdminDictionaries';
import Catalog from './pages/Catalog';
import BuildsList from './pages/BuildsList';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
            <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight">
                Нейросеть соберет ваш <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Идеальный ПК</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl">
                Выберите комплектующие, а наш ИИ проверит совместимость разъемов, питания и габаритов с точностью 99%.
            </p>
            <a href="/builder" className="bg-brand-primary hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all text-xl uppercase tracking-wide">
                Начать конфигурацию
            </a>
        </div>
    );
}

function App() {
    return (
        <BuilderProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-brand-dark flex flex-col font-sans">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/builder" element={<PcBuilder />} />
                            <Route path="/catalog/:category?" element={<Catalog />} />
                            <Route path="/admin" element={<AdminComponents />} />
                            <Route path="/admin/dictionaries" element={<AdminDictionaries />} />
                            <Route path="/builds" element={<BuildsList />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </BuilderProvider>
    );
}

export default App;