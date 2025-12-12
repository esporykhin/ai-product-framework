
import React, { useState, useRef, useEffect } from 'react';
import { ProblemEntry, ValidationItem, ContextSnippet } from '@shared/types';
import { LayoutIcon, RobotIcon, SparklesIcon, RefreshIcon, PrintIcon, BookIcon, ChatIcon } from '@shared/ui/icons';
import { SectionHeader, Card } from '@shared/ui/components';
import { FormattedText } from '@shared/ui/FormattedText';
import { calculateProblemScore, generateId } from '@shared/lib/utils';
import { AI_APPROACHES } from '@shared/config/constants';
import { ValidationModule } from './ValidationModule';

const PrioritizationMatrix = ({ problems }: { problems: ProblemEntry[] }) => {
  return (
    <div className="relative w-full h-[400px] border border-slate-200 bg-white rounded-xl shadow-inner p-8 overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-1/2 border-b border-dashed border-slate-300"></div>
        <div className="absolute top-0 bottom-0 left-1/2 border-r border-dashed border-slate-300"></div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-2 left-2 text-xs font-bold text-slate-400 bg-white px-1">НИЗКИЙ ИМПАКТ / СЛОЖНО</div>
      <div className="absolute top-2 right-2 text-xs font-bold text-emerald-600 bg-white px-1">СТРАТЕГИЧЕСКИЕ СТАВКИ</div>
      <div className="absolute bottom-2 left-2 text-xs font-bold text-slate-400 bg-white px-1">НЕ ДЕЛАТЬ</div>
      <div className="absolute bottom-2 right-2 text-xs font-bold text-primary-600 bg-white px-1">БЫСТРЫЕ ПОБЕДЫ</div>

      {/* Axis Labels */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 font-bold text-xs text-slate-500">
        ← AI Suitability Score (Легкость/Пригодность) →
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 ml-2 font-bold text-xs text-slate-500 whitespace-nowrap origin-left">
        ← Business Impact (Ценность) →
      </div>

      {/* Bubbles */}
      <div className="relative w-full h-full p-6">
        {problems.map(p => {
           const aiScore = calculateProblemScore(p); // 0-40
           const impact = p.businessImpact || 5; // 1-10

           // Normalize to %
           const x = (aiScore / 40) * 100;
           const y = (impact / 10) * 100;
           
           return (
             <div 
               key={p.id}
               className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-primary-500/80 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold cursor-pointer hover:scale-125 transition-transform z-10 group"
               style={{ left: `${x}%`, bottom: `${y}%` }}
               title={`${p.title} (AI: ${aiScore}, Biz: ${impact})`}
             >
                {p.title.split(' ').pop()}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded hidden group-hover:block z-20 pointer-events-none text-center">
                   <div className="font-bold mb-1">{p.title}</div>
                   <div>AI: {aiScore} | Impact: {impact}</div>
                </div>
             </div>
           )
        })}
      </div>
    </div>
  )
}

interface StrategyViewProps {
    problems: ProblemEntry[];
    validationQuestions: ValidationItem[];
    finalStrategyText: string;
    generateValidationQuestions: () => void;
    updateValidationAnswer: (id: string, answer: string) => void;
    generateGlobalStrategy: () => void;
    updateFinalStrategyText: (text: string) => void;
    onAddContext: (context: ContextSnippet) => void;
    isValidating: boolean;
    isGeneratingStrategy: boolean;
}

export const StrategyView: React.FC<StrategyViewProps> = ({
    problems,
    validationQuestions,
    finalStrategyText,
    generateValidationQuestions,
    updateValidationAnswer,
    generateGlobalStrategy,
    updateFinalStrategyText,
    onAddContext,
    isValidating,
    isGeneratingStrategy
}) => {
    const [tab, setTab] = useState<'dashboard' | 'document'>('dashboard');
    const [isEditing, setIsEditing] = useState(false);
    
    // Selection Popover State
    const [selection, setSelection] = useState<{ x: number, y: number, text: string } | null>(null);
    const docRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                setSelection(null);
                return;
            }

            const text = sel.toString().trim();
            if (!text || !docRef.current?.contains(sel.anchorNode)) {
                setSelection(null);
                return;
            }

            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Adjust coordinates relative to the viewport
            setSelection({
                x: rect.left + rect.width / 2,
                y: rect.top - 10, // Position slightly above
                text: text
            });
        };

        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
    }, []);

    const handleAddToContext = () => {
        if (selection) {
            onAddContext({
                id: generateId(),
                text: selection.text,
                source: 'Strategy Document'
            });
            setSelection(null);
            // Clear browser selection
            window.getSelection()?.removeAllRanges();
        }
    };

    return (
        <div className="animate-fade-in relative">
        
        {/* Floating Context Button */}
        {selection && tab === 'document' && !isEditing && (
             <div 
                className="fixed z-50 transform -translate-x-1/2 -translate-y-full px-2"
                style={{ left: selection.x, top: selection.y }}
             >
                 <button 
                   onClick={handleAddToContext}
                   className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl hover:scale-105 transition-all font-bold text-xs animate-bounce-in"
                 >
                    <ChatIcon /> Обсудить с AI
                 </button>
                 <div className="w-3 h-3 bg-slate-900 transform rotate-45 mx-auto -mt-1.5"></div>
             </div>
        )}

        <div className="flex justify-between items-center mb-6">
            <SectionHeader title="Финальная Стратегия" subtitle="Синтез всех гипотез и приоритизация." />
            
            {/* View Switcher */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
                 <button 
                   onClick={() => setTab('dashboard')}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <LayoutIcon /> Дашборд
                 </button>
                 <button 
                   onClick={() => setTab('document')}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'document' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <BookIcon /> Документ
                 </button>
            </div>
        </div>
        
        {/* TAB: DASHBOARD */}
        {tab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Column */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <LayoutIcon /> Матрица Приоритетов
                        </h3>
                        <PrioritizationMatrix problems={problems} />
                    </div>

                    {/* Validation Module */}
                    <div className="h-[500px]">
                        <ValidationModule 
                            questions={validationQuestions}
                            onGenerate={generateValidationQuestions}
                            onUpdateAnswer={updateValidationAnswer}
                            isLoading={isValidating}
                        />
                    </div>
                </div>

                {/* Right Column: Preview of Strategy */}
                <div className="space-y-4 flex flex-col h-full min-h-[600px]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <RobotIcon /> Executive Summary (Preview)
                        </h3>
                        <button 
                            onClick={() => setTab('document')}
                            className="text-sm font-bold text-purple-600 hover:underline"
                        >
                            Редактировать →
                        </button>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 shadow-sm relative flex flex-col">
                        {!finalStrategyText ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                <SparklesIcon />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Стратегия еще не сформирована</h4>
                            <p className="text-slate-500 mb-6 max-w-sm">ИИ проанализирует гипотезы, оценки и ответы на валидацию.</p>
                            <button 
                                onClick={generateGlobalStrategy}
                                disabled={isGeneratingStrategy}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                            >
                                {isGeneratingStrategy ? 'Анализирую данные...' : 'Сгенерировать Стратегию'}
                            </button>
                        </div>
                        ) : (
                        <div className="h-full flex flex-col">
                            <div className="prose prose-sm prose-slate max-w-none flex-1 overflow-y-auto pr-2">
                                <FormattedText text={finalStrategyText} />
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Table Summary */}
                <Card>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Сводная таблица</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                    <tr>
                        <th className="px-4 py-3 font-medium">Гипотеза</th>
                        <th className="px-4 py-3 font-medium">AI Score</th>
                        <th className="px-4 py-3 font-medium">Biz Impact</th>
                        <th className="px-4 py-3 font-medium">Подход</th>
                        <th className="px-4 py-3 font-medium">GTM</th>
                        <th className="px-4 py-3 font-medium">Фокус</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {problems.map(p => {
                        const sc = calculateProblemScore(p);
                        return (
                        <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-slate-900">{p.title}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{sc}/40</td>
                            <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full" style={{ width: `${(p.businessImpact || 0) * 10}%` }}></div>
                                </div>
                                <span className="font-mono text-xs text-slate-500">{p.businessImpact}</span>
                            </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{AI_APPROACHES.find(a => a.id === p.selectedApproach)?.title || '—'}</td>
                            <td className="px-4 py-3">
                                {p.gtmPlan ? <span className="text-emerald-600 font-bold text-xs">Готово</span> : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{p.strategicFocus || '—'}</td>
                        </tr>
                        )
                    })}
                    </tbody>
                </table>
                </div>
                </Card>
            </div>
        )}

        {/* TAB: DOCUMENT (Focused Editor) */}
        {tab === 'document' && (
            <div className="animate-fade-in flex flex-col h-[calc(100vh-200px)] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                 {/* Toolbar */}
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <div className="flex items-center gap-4">
                         <h3 className="font-bold text-slate-800">Единая Стратегия (Executive Summary)</h3>
                         <div className="h-4 w-px bg-slate-300"></div>
                         <div className="text-xs text-slate-500 flex items-center gap-2">
                            {isEditing ? <span className="text-amber-600 font-bold">● Режим редактирования</span> : <span className="text-emerald-600 font-bold">● Режим чтения</span>}
                         </div>
                     </div>
                     <div className="flex items-center gap-2">
                         <button 
                           onClick={() => setIsEditing(!isEditing)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isEditing ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                         >
                           {isEditing ? 'Готово' : 'Редактировать'}
                         </button>
                         <div className="w-px h-6 bg-slate-200 mx-2"></div>
                         
                         <button 
                           onClick={generateGlobalStrategy}
                           disabled={isGeneratingStrategy}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                         >
                           <RefreshIcon /> {isGeneratingStrategy ? 'Генерирую...' : 'Пересоздать'}
                         </button>
                         
                         <button 
                            onClick={() => window.print()}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                         >
                             <PrintIcon />
                         </button>
                     </div>
                 </div>

                 {/* Editor/Preview Area */}
                 <div className="flex-1 overflow-y-auto bg-white">
                     {isEditing ? (
                         <textarea 
                           value={finalStrategyText}
                           onChange={(e) => updateFinalStrategyText(e.target.value)}
                           className="w-full h-full p-8 outline-none text-slate-800 font-mono text-sm leading-relaxed resize-none"
                           placeholder="Начните писать или сгенерируйте стратегию..."
                         />
                     ) : (
                         <div className="max-w-4xl mx-auto p-8 lg:p-12 min-h-full" ref={docRef}>
                             {finalStrategyText ? (
                                <div className="prose prose-lg prose-slate max-w-none">
                                    <FormattedText text={finalStrategyText} />
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <p className="text-slate-400 mb-4">Документ пуст.</p>
                                    <button 
                                        onClick={generateGlobalStrategy}
                                        className="text-purple-600 font-bold hover:underline"
                                    >
                                        Сгенерировать черновик с AI
                                    </button>
                                </div>
                             )}
                         </div>
                     )}
                 </div>
            </div>
        )}
     </div>
    );
};
