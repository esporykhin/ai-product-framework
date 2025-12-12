
import React from 'react';
import { ArrowRightIcon, GithubIcon } from '@shared/ui/icons';

export const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-32">
       {/* Decor Elements */}
       <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                v1.0 Open Source Release
             </div>
             <p className="text-xs font-medium text-slate-500 max-w-lg">
                Основано на методологии <span className="text-slate-800 font-bold">Miqdad Jaffer</span> (Product Leader @ OpenAI, ex-Director of AI @ Shopify)
             </p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 animate-fade-in leading-tight">
             AI Фреймворк для <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Продакт Менеджеров</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed animate-fade-in animation-delay-100">
             Систематизируйте гипотезы, проводите глубокий рисерч рынка (Deep Research) и стройте стратегии с помощью AI агентов.
             <br/><span className="text-sm text-slate-400 mt-2 block">Работает через OpenRouter. Приватно и бесплатно.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-200">
             <button 
                onClick={onStart}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2 group"
             >
                Начать пользоваться
                <span className="group-hover:translate-x-1 transition-transform"><ArrowRightIcon /></span>
             </button>
             
             <a 
                href="https://github.com/esporykhin/ai-product-framework" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2"
             >
                <GithubIcon />
                GitHub Repo
             </a>
          </div>
       </div>
    </section>
  );
};
