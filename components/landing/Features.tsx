
import React from 'react';
import { LayoutIcon, RobotIcon, GlobeIcon, ShieldAlertIcon } from '../../icons';

const FeatureCard = ({ icon, title, desc, details }: any) => (
  <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:bg-white hover:shadow-xl hover:border-primary-100 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
     <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-700 mb-6 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-colors shadow-sm">
        {React.cloneElement(icon, { width: 28, height: 28 })}
     </div>
     <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
     <p className="text-slate-600 leading-relaxed mb-4 text-sm font-medium">{desc}</p>
     <div className="mt-auto pt-4 border-t border-slate-200/60">
        <ul className="space-y-2">
            {details.map((item: string, i: number) => (
                <li key={i} className="flex items-start text-xs text-slate-500">
                    <span className="text-primary-500 mr-2 mt-0.5">•</span>
                    {item}
                </li>
            ))}
        </ul>
     </div>
  </div>
);

export const Features = () => {
  return (
    <section className="py-24 bg-white">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Всё, что нужно для валидации идей
             </h2>
             <p className="text-lg text-slate-500 leading-relaxed">
               Хватит гадать. Используйте структурированный фреймворк, чтобы оценить потенциал AI-гипотез, риски и стратегию реализации до написания первой строчки кода.
             </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
             <FeatureCard 
               icon={<LayoutIcon />}
               title="Product Canvas"
               desc="Определите проблему, текущие решения и критерии успеха в структурированном формате, готовом для AI-анализа."
               details={[
                   "Четкая структура: Проблема -> Решение -> Успех",
                   "Автоматическая формулировка Strategic Focus",
                   "Хранение контекста всего проекта"
               ]}
             />
             <FeatureCard 
               icon={<GlobeIcon />}
               title="Deep Research"
               desc="Встроенные AI-агенты (через OpenRouter) проводят анализ рынка, конкурентов и технологий в реальном времени."
               details={[
                   "Доступ к Perplexity, Claude, DeepSeek",
                   "Сравнение цен и фичей конкурентов",
                   "Анализ научных статей и бенчмарков"
               ]}
             />
             <FeatureCard 
               icon={<RobotIcon />}
               title="Strategy Synthesis"
               desc="Автоматическая генерация Executive Summary и приоритизация бэклога на основе скоринга гипотез."
               details={[
                   "Матрица: AI Score vs Business Impact",
                   "Генерация единой продуктовой стратегии",
                   "Валидация через Devil's Advocate вопросы"
               ]}
             />
             <FeatureCard 
               icon={<ShieldAlertIcon />}
               title="Ethics & GTM"
               desc="Оценка этических рисков (Privacy, Fairness) и создание Go-to-Market планов под конкретный тех. стек."
               details={[
                   "Генерация GTM плана: ICP, Каналы, Value Prop",
                   "Чек-лист по AI этике и безопасности",
                   "Выбор правильной архитектуры (LLM vs ML)"
               ]}
             />
          </div>
       </div>
    </section>
  );
};
