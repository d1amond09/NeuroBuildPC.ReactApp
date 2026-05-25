import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/services';
import { BuilderContext } from '../context/BuilderContext';
import { AuthContext } from '../context/AuthContext';

export default function PaymentSection({ build }) {
    const { user } = useContext(AuthContext);
    const { activeBuildId, setActiveBuildId } = useContext(BuilderContext);
    const navigate = useNavigate();

    const handleCreateOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await ordersApi.create({ userId: user.id, buildId: activeBuildId });
            setActiveBuildId(null); 
            navigate('/orders');
        } catch {
            alert('Ошибка создания заказа');
        }
    };

    const isAiApproved = build.isAiChecked &&
        (build.aiCompatibilityScore >= 0.7 || build.aiCompatibilityScore >= 70);

    const btnText = !build.isAiChecked
        ? "Сначала запустите нейро-проверку"
        : !isAiApproved
            ? "ИИ запретил оплату (оценка ниже 70%)"
            : "Перейти к оформлению заказа";

    return (
        <div className="mt-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Оформление заказа</h2>
            <button
                onClick={handleCreateOrder}
                disabled={!isAiApproved || build.totalPrice === 0}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
            >
                {btnText}
            </button>
        </div>
    );
}