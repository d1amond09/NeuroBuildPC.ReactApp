import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BuilderProvider } from './context/BuilderContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PcBuilder from './pages/PcBuilder';
import AdminComponents from './pages/AdminComponents';
import AdminDictionaries from './pages/AdminDictionaries';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminOrders from './pages/AdminOrders';
import Catalog from './pages/Catalog';
import BuildsList from './pages/BuildsList';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrdersList from './pages/OrdersList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import { Sparkles, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 md:px-0 py-10 md:py-16">
            <div className="max-w-4xl flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold mb-6 animate-pulse">
                    <Sparkles size={14} /> Нейро-сборка ПК 2026
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight md:leading-none">
                    Соберите свой <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Идеальный ПК</span> под контролем ИИ
                </h1>

                <p className="text-md md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                    Добавьте любые комплектующие, а наша продвинутая нейросеть мгновенно проверит сокеты, тепловыделение кулера, длину видеокарты и мощность блока питания.
                </p>

                <a href="/builder" className="w-full sm:w-auto bg-brand-primary hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all text-md md:text-lg uppercase tracking-wider">
                    Запустить конфигуратор
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 max-w-5xl w-full text-left">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-brand-primary/30 transition flex gap-4 items-start shadow-md">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><CheckCircle2 size={24} /></div>
                    <div>
                        <h3 className="font-bold text-white text-md mb-1">Точность 100%</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Интеллектуальная сверка габаритов и спецификаций до миллиметра.</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-brand-primary/30 transition flex gap-4 items-start shadow-md">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><Sparkles size={24} /></div>
                    <div>
                        <h3 className="font-bold text-white text-md mb-1">Нейро-Оптимизация</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">ИИ выявит бутылочные горлышки (bottlenecks) в конфигурации.</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-brand-primary/30 transition flex gap-4 items-start shadow-md">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><ShieldCheck size={24} /></div>
                    <div>
                        <h3 className="font-bold text-white text-md mb-1">Безопасная оплата</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Оформление через защищенный шлюз WebPay сразу после проверки ИИ.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BuilderProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-brand-dark flex flex-col font-sans">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/builder" element={<PcBuilder />} />
                                <Route path="/catalog/:category?" element={<Catalog />} />
                                <Route path="/builds" element={<BuildsList />} />
                                <Route path="/orders" element={<OrdersList />} />
                                <Route path="/admin" element={<AdminComponents />} />
                                <Route path="/admin/dictionaries" element={<AdminDictionaries />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/settings" element={<AdminSettings />} />
                                <Route path="/admin/orders" element={<AdminOrders />} />
                                <Route path="/admin/orders/:userId" element={<OrdersList />} />
                                <Route path="/payment/success" element={<PaymentSuccess />} />
                                <Route path="/payment/fail" element={<PaymentFail />} />
                            </Routes>
                        </main>
                        <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
                            <p className="flex items-center justify-center gap-1">© 2026 NeuroBuildPC. Сделано с <Heart size={12} className="text-red-500 fill-red-500" /></p>
                        </footer>
                    </div>
                </BrowserRouter>
            </BuilderProvider>
        </AuthProvider>
    );
}

export default App;