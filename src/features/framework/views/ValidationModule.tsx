
import React from 'react';
import { ShieldAlertIcon, RefreshIcon } from '@shared/ui/icons';
import { ValidationItem } from '@shared/types';

interface ValidationModuleProps {
    questions: ValidationItem[];
    onGenerate: () => void;
    onUpdateAnswer: (id: string, answer: string) => void;
    isLoading: boolean;
}

export const ValidationModule: React.FC<ValidationModuleProps> = ({ 
    questions, 
    onGenerate, 
    onUpdateAnswer, 
    isLoading 
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                   <ShieldAlertIcon /> 👮‍♂️ Business Challenge
                 </h3>
                 <p className="text-sm text-slate-500">
                   Ответьте на вопросы стейкхолдеров. Эти ответы будут учтены при генерации финальной стратегии.
                 </p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                 {questions.length === 0 ? (
                    <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                       <p className="text-slate-400 text-sm mb-4">Вопросов пока нет. Сгенерируйте их, чтобы проверить стратегию на прочность.</p>
                       <button 
                         onClick={onGenerate}
                         disabled={isLoading}
                         className="px-5 py-2.5 bg-white border border-slate-300 hover:border-primary-400 hover:text-primary-600 text-slate-600 font-bold rounded-lg shadow-sm transition-all"
                       >
                         {isLoading ? 'Генерирую вопросы...' : 'Сгенерировать вопросы от Бизнеса'}
                       </button>
                    </div>
                 ) : (
                    <>
                       {questions.map((item, i) => (
                            <div key={item.id} className="animate-fade-in">
                                <div className="flex gap-3 mb-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 font-bold rounded-full flex items-center justify-center text-xs mt-0.5">{i+1}</span>
                                    <span className="text-slate-800 font-medium text-sm">{item.question}</span>
                                </div>
                                <div className="pl-9">
                                    <textarea 
                                        value={item.answer}
                                        onChange={(e) => onUpdateAnswer(item.id, e.target.value)}
                                        placeholder="Ваш ответ / защита..."
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-slate-400 min-h-[80px]"
                                    />
                                </div>
                            </div>
                       ))}
                    </>
                 )}
            </div>

            {questions.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Ответьте на вопросы, затем пересоздайте стратегию.</span>
                    <button 
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <RefreshIcon /> {isLoading ? 'Обновляю...' : 'Новые вопросы'}
                    </button>
                </div>
            )}
        </div>
    );
};
