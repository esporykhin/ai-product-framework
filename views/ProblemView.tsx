
import React, { useState } from 'react';
import { ProblemEntry, Step2Data, Step6Data } from '../types';
import { TrashIcon, SparklesIcon, RobotIcon, GlobeIcon, LayoutIcon } from '../components/icons';
import { SectionHeader, Card, InputField, TextAreaField, FactorCard, FormattedText } from '../components/ui';
import { AI_APPROACHES } from '../constants';
import { calculateProblemScore, getVerdict } from '../utils';
import { ResearchModule } from './ResearchModule';

// Custom Beaker Icon for Research
const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;

interface ProblemViewProps {
    activeProblem: ProblemEntry;
    updateActiveProblem: (field: keyof ProblemEntry, val: any) => void;
    updateActiveStep2: (field: keyof Step2Data, val: number) => void;
    updateActiveStep6: (field: keyof Step6Data, val: string) => void;
    removeProblem: (id: string) => void;
    synthesizeStrategy: () => void;
    generateGTM: () => void;
    
    // Research props
    runResearch: (query: string, model: string) => Promise<void>;
    updateResearch: (id: string, text: string) => void;
    deleteResearch: (id: string) => void;

    isSynthesizing: boolean;
    isGeneratingGTM: boolean;
    isResearching: boolean;
}

export const ProblemView: React.FC<ProblemViewProps> = ({
    activeProblem,
    updateActiveProblem,
    updateActiveStep2,
    updateActiveStep6,
    removeProblem,
    synthesizeStrategy,
    generateGTM,
    runResearch,
    updateResearch,
    deleteResearch,
    isSynthesizing,
    isGeneratingGTM,
    isResearching
}) => {
    const activeScore = calculateProblemScore(activeProblem);
    const activeVerdict = getVerdict(activeScore);
    
    const [tab, setTab] = useState<'canvas' | 'gtm' | 'research'>('canvas');

    return (
        <div className="animate-fade-in">
            
        {/* Inner Tab Switcher */}
        <div className="flex flex-wrap gap-1 mb-6 bg-slate-200/50 p-1 rounded-xl w-fit">
            <button 
                onClick={() => setTab('canvas')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'canvas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <LayoutIcon /> Product Canvas
            </button>
            <button 
                onClick={() => setTab('research')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'research' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <BeakerIcon /> Исследования
            </button>
            <button 
                onClick={() => setTab('gtm')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'gtm' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <GlobeIcon /> GTM Strategy
            </button>
        </div>

        {tab === 'canvas' && (
            <div className="space-y-12 animate-fade-in">
            {/* Step 1 */}
            <section className="scroll-mt-24" id="step1">
            <SectionHeader step="Шаг 1" title="Определение" subtitle="Опишите текущую проблему детально." />
            
            <Card className="relative border-l-4 border-l-primary-500">
                <div className="mb-6">
                    <InputField 
                        label="Название гипотезы (для вкладок)"
                        value={activeProblem.title}
                        onChange={(v: string) => updateActiveProblem('title', v)}
                        placeholder="Например: Чат-бот поддержки"
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                <TextAreaField 
                    label="Какую проблему вы решаете?" 
                    value={activeProblem.userProblem} 
                    onChange={(v: string) => updateActiveProblem('userProblem', v)} 
                    placeholder="Опишите боль пользователя..."
                />
                <TextAreaField 
                    label="Текущие решения" 
                    value={activeProblem.currentSolution} 
                    onChange={(v: string) => updateActiveProblem('currentSolution', v)}
                    placeholder="Альтернативы..." 
                />
                <TextAreaField 
                    label="Недостатки решений" 
                    value={activeProblem.brokenAspects} 
                    onChange={(v: string) => updateActiveProblem('brokenAspects', v)} 
                    placeholder="Что не так?"
                />
                <TextAreaField 
                    label="Критерии успеха" 
                    value={activeProblem.successDefinition} 
                    onChange={(v: string) => updateActiveProblem('successDefinition', v)} 
                    placeholder="KPI..."
                />
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                    onClick={() => removeProblem(activeProblem.id)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-600 transition-colors"
                    >
                    <TrashIcon /> Удалить эту гипотезу
                    </button>
                </div>
            </Card>

            {/* Strategy Synthesis */}
            <div className="mt-8 bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <SparklesIcon />
                        Стратегический Фокус
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Сформулируйте суть решения для этой конкретной проблемы.
                    </p>
                </div>
                <button 
                    onClick={synthesizeStrategy}
                    disabled={isSynthesizing || !activeProblem.userProblem}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-all shadow-lg text-sm disabled:opacity-50"
                >
                    {isSynthesizing ? 'Думаю...' : <><RobotIcon /> Сформулировать с ИИ</>}
                </button>
                </div>
                
                <textarea
                value={activeProblem.strategicFocus}
                onChange={(e) => updateActiveProblem('strategicFocus', e.target.value)}
                placeholder="Здесь будет ваша стратегия..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all h-24"
                />
            </div>
            </section>

            {/* Step 2 */}
            <section className="scroll-mt-24" id="step2">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <SectionHeader step="Шаг 2" title="Оценка применимости" subtitle={`Оцените потенциал ИИ для "${activeProblem.title}".`} />
                </div>
                
                {/* Sticky Score Widget */}
                <div className={`
                    fixed bottom-6 left-4 right-4 z-30 md:static md:w-auto md:mb-8
                    bg-white p-4 rounded-2xl shadow-xl border border-slate-200
                    flex items-center justify-between gap-6 transform transition-all
                `}>
                <div className="hidden md:block">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Score</div>
                    <div className="text-3xl font-black text-slate-800">{activeScore}<span className="text-lg text-slate-300 font-medium">/40</span></div>
                </div>
                
                <div className="flex items-center gap-4 flex-1 md:flex-initial">
                    <div className="md:hidden">
                        <span className="text-2xl font-black text-slate-800">{activeScore}</span>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out ${activeScore >= 30 ? 'bg-emerald-500' : activeScore >= 20 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${(activeScore / 40) * 100}%` }}
                        ></div>
                    </div>
                    <div className={`text-sm font-bold mt-1 ${activeVerdict.color}`}>
                        {activeVerdict.text}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            
            <Card className="mb-8 border-purple-200 bg-purple-50/30">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">💰 Влияние на бизнес (Business Impact)</h3>
                    <p className="text-sm text-slate-600">Насколько решение этой проблемы важно для денег или роста компании?</p>
                </div>
                <div className="flex-1 w-full max-w-sm">
                    <div className="flex justify-between mb-2 font-bold text-purple-700">
                        <span>Низкое (1)</span>
                        <span>{activeProblem.businessImpact || 5}</span>
                        <span>Критическое (10)</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={activeProblem.businessImpact || 5}
                        onChange={(e) => updateActiveProblem('businessImpact', parseInt(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FactorCard label="Паттерны" description="Сложные закономерности в данных?" value={activeProblem.step2.patternRecognition} onChange={(v: number) => updateActiveStep2('patternRecognition', v)} />
                <FactorCard label="Рутина" description="Высокая повторяемость задач?" value={activeProblem.step2.repetitiveTasks} onChange={(v: number) => updateActiveStep2('repetitiveTasks', v)} />
                <FactorCard label="Масштаб" description="Нужно масштабирование x100?" value={activeProblem.step2.scalability} onChange={(v: number) => updateActiveStep2('scalability', v)} />
                <FactorCard label="Данные" description="Наличие качественных данных?" value={activeProblem.step2.dataAvailability} onChange={(v: number) => updateActiveStep2('dataAvailability', v)} />
                <FactorCard label="Прогнозы" description="Ценность точных предсказаний?" value={activeProblem.step2.predictionValue} onChange={(v: number) => updateActiveStep2('predictionValue', v)} />
                <FactorCard label="Персонализация" description="Индивидуальный опыт для каждого?" value={activeProblem.step2.personalization} onChange={(v: number) => updateActiveStep2('personalization', v)} />
                <FactorCard label="Генерация" description="Создание нового контента?" value={activeProblem.step2.contentGeneration} onChange={(v: number) => updateActiveStep2('contentGeneration', v)} />
                <FactorCard label="Сложность" description="За пределами if-then правил?" value={activeProblem.step2.decisionComplexity} onChange={(v: number) => updateActiveStep2('decisionComplexity', v)} />
            </div>
            </section>

            {/* Step 3 */}
            <section className="scroll-mt-24" id="step3">
            <SectionHeader step="Шаг 3 & 5" title="Выбор подхода" subtitle="Выберите технологию для этой гипотезы." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {AI_APPROACHES.map((approach) => (
                <div 
                    key={approach.id}
                    onClick={() => updateActiveProblem('selectedApproach', approach.id)}
                    className={`
                    cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
                    ${activeProblem.selectedApproach === approach.id 
                        ? 'border-primary-600 bg-primary-50 shadow-md ring-2 ring-primary-200 ring-offset-2' 
                        : 'border-white bg-white hover:border-primary-200 hover:shadow-lg shadow-sm'
                    }
                    `}
                >
                    <div className="text-3xl mb-3">{approach.icon}</div>
                    <h3 className={`font-bold leading-tight ${activeProblem.selectedApproach === approach.id ? 'text-primary-900' : 'text-slate-700'}`}>{approach.title}</h3>
                    {activeProblem.selectedApproach === approach.id && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                    )}
                </div>
                ))}
            </div>

            {activeProblem.selectedApproach && (
                <div className="animate-fade-in">
                {(() => {
                    const selected = AI_APPROACHES.find(a => a.id === activeProblem.selectedApproach);
                    if (!selected) return null;
                    return (
                    <Card className="border-primary-100 bg-gradient-to-r from-white to-primary-50/30">
                        <div className="flex flex-col lg:flex-row gap-10">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center space-x-2 mb-4">
                            <span className="text-2xl">{selected.icon}</span>
                            <h3 className="text-2xl font-bold text-slate-900">{selected.title}</h3>
                            </div>
                            <div className="space-y-6">
                            <div className="p-3 bg-white rounded-lg border border-primary-100 text-slate-700 text-sm font-medium">
                                {selected.tech}
                            </div>
                            <p className="text-slate-600 leading-relaxed">{selected.examples}</p>
                            </div>
                        </div>
                        <div className="lg:w-1/2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4">Ключевые Метрики</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Технические</span>
                                <ul className="space-y-1">
                                {(Array.isArray(selected.metrics.tech) ? selected.metrics.tech : [selected.metrics.tech]).map((m, i) => (
                                    <li key={i} className="flex items-start text-xs text-slate-700">
                                    <span className="text-primary-400 mr-2">•</span>{m}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Бизнес</span>
                                <ul className="space-y-1">
                                {(Array.isArray(selected.metrics.biz) ? selected.metrics.biz : [selected.metrics.biz]).map((m, i) => (
                                    <li key={i} className="flex items-start text-xs text-slate-700">
                                    <span className="text-emerald-400 mr-2">•</span>{m}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            </div>
                        </div>
                        </div>
                    </Card>
                    );
                })()}
                </div>
            )}
            </section>

            {/* Step 6 */}
            <section className="scroll-mt-24" id="step6">
            <SectionHeader step="Шаг 6" title="Этика" subtitle="Риски для этой гипотезы." />
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-slate-100">
                <div className="grid md:grid-cols-2 gap-6">
                {[
                    { id: 'fairness', label: 'Справедливость', ph: 'Смещение в данных?' },
                    { id: 'transparency', label: 'Прозрачность', ph: 'Понятно ли решение?' },
                    { id: 'privacy', label: 'Приватность', ph: 'Защита данных?' },
                    { id: 'safety', label: 'Безопасность', ph: 'Защита от атак?' },
                    { id: 'humanOversight', label: 'Контроль', ph: 'Человек в цикле?' },
                ].map((field) => (
                    <div key={field.id} className={field.id === 'humanOversight' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-bold text-primary-300 mb-2">{field.label}</label>
                        <textarea
                        value={(activeProblem.step6 as any)[field.id]}
                        onChange={(e) => updateActiveStep6(field.id as keyof Step6Data, e.target.value)}
                        placeholder={field.ph}
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>
                ))}
                </div>
            </div>
            </section>
            </div>
        )}

        {/* RESEARCH TAB */}
        {tab === 'research' && (
            <div className="animate-fade-in">
                 <SectionHeader 
                    step="Шаг ?" 
                    title="Deep Research" 
                    subtitle="Исследования рынка, конкурентов и технологий с помощью мощных моделей." 
                 />
                 <ResearchModule 
                    researchItems={activeProblem.research || []}
                    onResearch={runResearch}
                    onUpdateResult={updateResearch}
                    onDelete={deleteResearch}
                    isResearching={isResearching}
                 />
            </div>
        )}

        {/* GTM TAB */}
        {tab === 'gtm' && (
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
                         <button 
                            onClick={generateGTM}
                            disabled={isGeneratingGTM}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 whitespace-nowrap"
                         >
                             {isGeneratingGTM ? 'Генерирую...' : <><GlobeIcon /> Создать GTM План</>}
                         </button>
                     </div>

                     <textarea
                        value={activeProblem.gtmPlan}
                        onChange={(e) => updateActiveProblem('gtmPlan', e.target.value)}
                        placeholder="Здесь будет ваш GTM план (Target Audience, Channels, Value Prop)..."
                        className="w-full h-[500px] p-6 border border-emerald-100 bg-emerald-50/20 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-y text-slate-800 leading-relaxed font-medium"
                    />
                 </div>
             </div>
        )}
        </div>
    );
}
