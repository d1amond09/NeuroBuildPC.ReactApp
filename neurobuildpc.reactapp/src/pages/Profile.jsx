// src/pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import { usersApi } from '../api/services';
import { AuthContext } from '../context/AuthContext';
import { Camera, Save, Loader2 } from 'lucide-react';

export default function Profile() {
    const { user, loadUser } = useContext(AuthContext);
    const [form, setForm] = useState({ firstName: '', lastName: '', userName: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', userName: user.userName || '' });
            setPreview(user.pictureUrl || 'https://via.placeholder.com/150');
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await usersApi.updateMe(form);
            if (file) await usersApi.uploadAvatar(file);
            await loadUser();
            alert('Профиль успешно обновлен!');
        } catch {
            alert('Ошибка. Убедитесь, что никнейм уникален.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto mt-6 px-3 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Настройки профиля</h1>

            <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-800">
                <form onSubmit={handleUpdate}>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-8">
                        <div className="relative group cursor-pointer">
                            <img src={preview} alt="avatar" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-800 group-hover:border-brand-primary transition duration-300" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                <Camera size={26} />
                                <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="flex-grow space-y-4 w-full">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Никнейм (Уникальный) *</label>
                                <input required className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-brand-primary transition" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Имя *</label>
                                    <input required className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-brand-primary transition" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Фамилия *</label>
                                    <input required className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-brand-primary transition" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email (Только просмотр)</label>
                                <input disabled className="w-full p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-sm text-slate-500 cursor-not-allowed" value={user.email} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-slate-800">
                        <button type="submit" disabled={saving} className="w-full sm:w-auto bg-brand-primary hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}