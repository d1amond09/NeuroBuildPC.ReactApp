import { useState } from 'react';
import { authApi } from '../api/services';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const [form, setForm] = useState({ password: '', confirmPassword: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.resetPassword({ email, token, password: form.password, confirmPassword: form.confirmPassword });
            navigate('/login');
        } catch {
            alert('Ошибка сброса пароля');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Новый пароль</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    className="p-3 rounded bg-slate-800 text-white outline-none"
                    type="password"
                    placeholder="Новый пароль"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                />
                <input
                    className="p-3 rounded bg-slate-800 text-white outline-none"
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                />
                <button className="bg-brand-primary p-3 rounded text-white font-bold" type="submit">
                    Сохранить
                </button>
            </form>
        </div>
    );
}