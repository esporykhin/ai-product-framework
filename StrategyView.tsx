
import React from 'react';
import { ProblemEntry } from './types';
import { LayoutIcon, ShieldAlertIcon, RobotIcon, SparklesIcon, RefreshIcon, PrintIcon } from './icons';
import { SectionHeader, Card, FormattedText } from './components';
import { calculateProblemScore } from './utils';
import { AI_APPROACHES } from './constants';

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
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-slate-800 text-white text-xs p-2 rounded hidden group-hover:block z-20 pointer-events-none">
                   <div className="font-bold mb-1">{p.title}</div>
                   <div>AI Score: {aiScore}</div>
                   <div>Impact: {impact}</div>
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
    validationQuestions: string[];
    finalStrategyText: string;
    generateValidationQuestions: () => void;
    generateGlobalStrategy: () => void;
    isValidating: boolean;
    isGeneratingStrategy: boolean;
}

export const StrategyView: React.FC<StrategyViewProps> = ({
    problems,
    validationQuestions,
    finalStrategyText,
    generateValidationQuestions,
    generateGlobalStrategy,
    isValidating,
    isGeneratingStrategy
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
        <SectionHeader title="Финальная Стратегия" subtitle="Синтез всех гипотез и приоритизация." />
        
        <div className="grid lg:grid-cols-2 gap-8">
           {/* Left: Matrix */}
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <LayoutIcon /> Матрица Приоритетов
             </h3>
             <p className="text-sm text-slate-500 mb-4">
               Ось X: Техническая применимость (AI Score). Ось Y: Ценность для бизнеса.
             </p>
             <PrioritizationMatrix problems={problems} />
             
             {/* Business Validation Block */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                   <ShieldAlertIcon /> 👮‍♂️ Business Challenge
                 </h3>
                 <p className="text-sm text-slate-500 mb-4">
                   Генерация неудобных вопросов от стейкхолдеров для проверки вашей стратегии на прочность.
                 </p>
                 
                 {validationQuestions.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                       <button 
                         onClick={generateValidationQuestions}
                         disabled={isValidating}
                         className="px-5 py-2.5 bg-white border border-slate-300 hover:border-primary-400 hover:text-primary-600 text-slate-600 font-bold rounded-lg shadow-sm transition-all"
                       >
                         {isValidating ? 'Генерирую вопросы...' : 'Сгенерировать вопросы от Бизнеса'}
                       </button>
                    </div>
                 ) : (
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-6">
                       <ul className="space-y-4">
                          {validationQuestions.map((q, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 font-bold rounded-full flex items-center justify-center text-xs mt-0.5">{i+1}</span>
                              <span className="text-slate-800 font-medium">{q}</span>
                            </li>
                          ))}
                       </ul>
                       <button 
                         onClick={generateValidationQuestions}
                         className="mt-6 text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                       >
                         <RefreshIcon /> Обновить список вопросов
                       </button>
                    </div>
                 )}
              </div>
           </div>

           {/* Right: Synthesis */}
           <div className="space-y-4 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <RobotIcon /> Executive Summary
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 shadow-sm relative min-h-[400px]">
                 {!finalStrategyText ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                         <SparklesIcon />
                       </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">Стратегия еще не сформирована</h4>
                      <p className="text-slate-500 mb-6 max-w-sm">ИИ проанализирует все ваши гипотезы, их оценки и бизнес-импакт, чтобы написать единый план.</p>
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
                           <RefreshIcon /> Пересоздать
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
