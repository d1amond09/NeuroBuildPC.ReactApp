import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function CompatibilityReport({ report }) {
    if (!report) return null;

    return (
        <div className={`p-6 rounded-lg mt-6 ${report.isCompatible ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
            <div className="flex items-center gap-3 mb-4">
                {report.isCompatible ? <CheckCircle className="text-green-500 w-8 h-8" /> : <AlertTriangle className="text-red-500 w-8 h-8" />}
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {report.isCompatible ? 'Сборка совместима!' : 'Внимание! Есть проблемы совместимости'}
                    </h3>
                    <p className="text-sm text-slate-400">Оценка нейросети: {(report.compatibilityScore * 100).toFixed(0)}/100</p>
                </div>
            </div>

            {report.potentialIssues?.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Проблемы:</h4>
                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                        {report.potentialIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                    </ul>
                </div>
            )}

            {report.recommendations && (
                <div>
                    <h4 className="font-semibold text-brand-primary flex items-center gap-2 mb-2"><Info size={16} /> Рекомендации ИИ:</h4>
                    <p className="text-sm text-slate-300">{report.recommendations}</p>
                </div>
            )}
        </div>
    );
}