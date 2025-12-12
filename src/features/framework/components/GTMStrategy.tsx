import React, { useState } from 'react';
import { SectionHeader } from '@shared/ui/components';
import { GlobeIcon } from '@shared/ui/icons';
import { FormattedText } from '@shared/ui/FormattedText';

interface GTMStrategyProps {
    gtmPlan: string;
    onUpdateGTM: (value: string) => void;
    onGenerateGTM: () => void;
    isGenerating: boolean;
}

export const GTMStrategy: React.FC<GTMStrategyProps> = ({
    gtmPlan,
    onUpdateGTM,
    onGenerateGTM,
    isGenerating
}) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            <SectionHeader 
                step="Шаг 4" 
                title="Go-to-Market Strategy" 
                subtitle="Как мы будем это продавать и внедрять?" 
            />

            <div className="bg-white border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div className="max-w-xl">
                        <h3 className="text-lg font-bold text-emerald-900">План выхода на рынок</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Сгенерируйте план на основе описания проблемы и выбранного технического подхода.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {gtmPlan && (
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-all"
                            >
                                {isEditing ? 'Просмотр' : 'Редактировать'}
                            </button>
                        )}
                        <button 
                            onClick={onGenerateGTM}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            {isGenerating ? 'Генерирую...' : <><GlobeIcon /> Создать GTM План</>}
                        </button>
                    </div>
                </div>

                {isEditing || !gtmPlan ? (
                    <textarea
                        value={gtmPlan}
                        onChange={(e) => onUpdateGTM(e.target.value)}
                        placeholder="Здесь будет ваш GTM план (Target Audience, Channels, Value Prop)..."
                        className="w-full h-[500px] p-6 border border-emerald-100 bg-emerald-50/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-y text-slate-800 leading-relaxed font-medium"
                    />
                ) : (
                    <div className="prose prose-slate max-w-none p-6 border border-emerald-100 bg-emerald-50/20 rounded-xl min-h-[500px]">
                        <FormattedText text={gtmPlan} />
                    </div>
                )}
            </div>
        </div>
    );
};
