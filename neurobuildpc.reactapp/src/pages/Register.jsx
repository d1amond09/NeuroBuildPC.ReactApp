import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';

export default function Register() {
    const [form, setForm] = useState({ firstName: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '', clientUri: window.location.origin });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.register(form);
            navigate('/login');
        } catch {
            alert('Ошибка регистрации');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Регистрация</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input className="p-3 rounded bg-slate-800 text-white outline-none" placeholder="Имя" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                <input className="p-3 rounded bg-slate-800 text-white outline-none" placeholder="Фамилия" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                <input className="p-3 rounded bg-slate-800 text-white outline-none" placeholder="Username" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} required />
                <input className="p-3 rounded bg-slate-800 text-white outline-none" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <input className="p-3 rounded bg-slate-800 text-white outline-none" type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <input className="p-3 rounded bg-slate-800 text-white outline-none" type="password" placeholder="Повторите пароль" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                <button className="bg-brand-primary p-3 rounded text-white font-bold" type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
}