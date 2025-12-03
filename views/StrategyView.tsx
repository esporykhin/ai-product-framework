
import React from 'react';
import { ProblemEntry, ValidationItem } from '../types';
import { LayoutIcon, RobotIcon, SparklesIcon, RefreshIcon, PrintIcon } from '../components/icons';
import { SectionHeader, Card, FormattedText } from '../components/ui';
import { calculateProblemScore } from '../utils';
import { AI_APPROACHES } from '../constants';
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
    isValidating,
    isGeneratingStrategy
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
        <SectionHeader title="Финальная Стратегия" subtitle="Синтез всех гипотез и приоритизация." />
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
           {/* Left Column */}
           <div className="space-y-8">
             <div className="space-y-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <LayoutIcon /> Матрица Приоритетов
                 </h3>
                 <p className="text-sm text-slate-500 mb-4">
                 Ось X: Техническая применимость (AI Score). Ось Y: Ценность для бизнеса.
                 </p>
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

           {/* Right Column: Synthesis */}
           <div className="space-y-4 flex flex-col h-full min-h-[800px]">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <RobotIcon /> Executive Summary
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 shadow-sm relative flex flex-col">
                 {!finalStrategyText ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                         <SparklesIcon />
                       </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">Стратегия еще не сформирована</h4>
                      <p className="text-slate-500 mb-6 max-w-sm">ИИ проанализирует гипотезы, оценки, ваши ответы на вопросы валидации и сформирует план.</p>
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
                      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                         <button 
                           onClick={generateGlobalStrategy}
                           className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                         >
                           <RefreshIcon /> Пересоздать (с учетом новых ответов)
                         </button>
                         <div className="flex-1"></div>
                         <button 
                           onClick={() => window.print()}
                           className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                         >
                           <PrintIcon /> Печать / PDF
                         </button>
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
                <th className="px-4 py-3 font-medium">GTM Готовность</th>
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
    );
};
