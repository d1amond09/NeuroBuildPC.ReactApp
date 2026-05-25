// src/pages/AdminSettings.jsx
import { useState, useEffect } from 'react';
import { settingsApi } from '../api/services';
import { Bot, Key, Save, Loader2, Info, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
    const [form, setForm] = useState({ modelName: '', apiKey: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsApi.get();
                if (res.data) setForm({ modelName: res.data.modelName || '', apiKey: res.data.apiKey || '' });
            } catch (error) {
                console.error("Ошибка загрузки настроек", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            await settingsApi.update(form);
            setSuccessMessage('Настройки нейросети успешно применены.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch {
            alert('Ошибка при сохранении настроек.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-20 text-brand-primary flex justify-center"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-primary/20 rounded-xl">
                    <Bot className="text-brand-primary" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl text-white font-bold">Интеграция ИИ</h1>
                    <p className="text-slate-400 text-sm mt-1">Настройка модели Google Gemini для проверки совместимости сборок</p>
                </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 mb-8 flex gap-4 text-blue-200">
                <Info className="shrink-0 text-blue-400" />
                <p className="text-sm">
                    Указанные здесь данные используются глобально для всей системы. Выберите актуальную версию модели (например, <span className="font-mono bg-blue-900/50 px-1 rounded">gemini-1.5-pro</span>) и укажите действующий API-ключ из Google AI Studio.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative">

                {successMessage && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg animate-bounce">
                        <CheckCircle size={16} /> {successMessage}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            <Bot size={16} className="text-slate-500" /> Название Модели
                        </label>
                        <input
                            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                            placeholder="gemini-1.5-pro"
                            value={form.modelName}
                            onChange={e => setForm({ ...form, modelName: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            <Key size={16} className="text-slate-500" /> API Ключ
                        </label>
                        <div className="relative">
                            <input
                                className="w-full p-4 pr-12 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition font-mono"
                                type={showKey ? "text" : "password"}
                                placeholder="AIzaSyB..."
                                value={form.apiKey}
                                onChange={e => setForm({ ...form, apiKey: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                            >
                                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end pt-6 border-t border-slate-800">
                    <button
                        disabled={saving}
                        className="bg-brand-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        type="submit"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Применение...' : 'Сохранить конфигурацию'}
                    </button>
                </div>
            </form>
        </div>
    );
}