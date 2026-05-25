import { useState } from 'react';
import { authApi } from '../api/services';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.forgotPassword({ email, clientUri: `${window.location.origin}/reset-password` });
            setMessage('Ссылка для сброса пароля отправлена на почту.');
        } catch {
            setMessage('Произошла ошибка. Проверьте правильность email.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Сброс пароля</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    className="p-3 rounded bg-slate-800 text-white outline-none"
                    type="email"
                    placeholder="Введите ваш Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <button className="bg-brand-primary p-3 rounded text-white font-bold" type="submit">
                    Отправить
                </button>
            </form>
            {message && <p className="mt-4 text-slate-300 text-sm text-center">{message}</p>}
            <div className="mt-4 text-center">
                <Link to="/login" className="text-brand-primary text-sm hover:underline">Вернуться ко входу</Link>
            </div>
        </div>
    );
}