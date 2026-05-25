import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { AuthContext } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "730563147431-2obpt5h75t08rvtv90vu1hp72o3tn1da.apps.googleusercontent.com";

export default function Login() {
    const [form, setForm] = useState({ emailOrUserName: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi.login(form);
            login(res.data.accessToken);
            navigate('/');
        } catch {
            alert('Неверные данные для входа');
        }
    };

    const handleGoogle = async (credentialResponse) => {
        try {
            const res = await authApi.google(credentialResponse.credential);
            login(res.data.accessToken);
            navigate('/');
        } catch {
            alert('Ошибка авторизации через Google');
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="max-w-md mx-auto mt-20 bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Вход в аккаунт</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-6">
                    <div>
                        <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-brand-primary transition" placeholder="Email или Username" value={form.emailOrUserName} onChange={e => setForm({ ...form, emailOrUserName: e.target.value })} required />
                    </div>
                    <div>
                        <input className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-brand-primary transition" type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="bg-brand-primary hover:bg-blue-600 p-3 rounded-xl text-white font-bold transition shadow-lg shadow-brand-primary/20" type="submit">
                        Войти
                    </button>
                </form>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-slate-700 w-full absolute"></div>
                    <span className="bg-slate-900 px-3 text-slate-500 text-sm relative">ИЛИ</span>
                </div>

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogle}
                        onError={() => alert('Окно Google закрыто или произошла ошибка')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div className="flex justify-between text-sm font-medium">
                    <Link to="/register" className="text-slate-400 hover:text-brand-primary transition">Создать аккаунт</Link>
                    <Link to="/forgot-password" className="text-slate-400 hover:text-brand-primary transition">Забыли пароль?</Link>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}