
import React from 'react';
import { GithubIcon, CopyIcon } from '@shared/ui/icons';

export const OpenSource = () => {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
             <div className="inline-block px-3 py-1 rounded-full bg-primary-900/50 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-6">
                100% Free & Open Source
             </div>
             <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                Построено сообществом. <br/>
                <span className="text-primary-400">Принадлежит вам.</span>
             </h2>
             <div className="space-y-6 text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
                <p>
                   Никаких скрытых платежей или подписок. Этот инструмент полностью бесплатен.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>
                           <strong className="text-white">BYO Keys:</strong> Вы используете свой ключ OpenRouter. Вы платите только провайдеру за токены (копейки).
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>
                           <strong className="text-white">Локальное хранение:</strong> Все данные о ваших гипотезах хранятся в `localStorage` вашего браузера. Мы не видим ваши идеи.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>
                           <strong className="text-white">Open Source:</strong> Вы можете проверить код, форкнуть репозиторий или развернуть его в своем корпоративном контуре.
                        </span>
                    </li>
                </ul>
             </div>
             
             <div className="flex gap-4">
                <a 
                   href="https://github.com/esporykhin/ai-product-framework" 
                   target="_blank" 
                   rel="noreferrer"
                   className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                   <GithubIcon />
                   Смотреть код на GitHub
                </a>
             </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg hidden md:block space-y-4">
             {/* Fake Code Block: .env */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-slate-700/50">
                    <span className="text-xs font-mono text-slate-400">.env.example</span>
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                    </div>
                </div>
                <div className="p-4 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto">
                    <p><span className="text-purple-400"># AI Provider Configuration</span></p>
                    <p className="mt-2"><span className="text-blue-400">OPENROUTER_API_KEY</span>=<span className="text-green-400">sk-or-v1-xxxxxxxx...</span></p>
                    <p className="text-slate-500 mt-2"># Optional: Self-hosted setup</p>
                    <p><span className="text-blue-400">VITE_DEFAULT_MODEL</span>=<span className="text-green-400">"openai/gpt-4o"</span></p>
                </div>
             </div>

             {/* Fake Code Block: React */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl font-mono text-xs md:text-sm text-slate-300 overflow-hidden relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="p-6">
                    <div className="space-y-2 opacity-80">
                    <p><span className="text-purple-400">const</span> [data, setData] = <span className="text-blue-400">useLocalStorage</span>(<span className="text-green-400">'ai_framework'</span>);</p>
                    <p>&nbsp;</p>
                    <p><span className="text-slate-500">// Your data stays local</span></p>
                    <p><span className="text-purple-400">return</span> (</p>
                    <p className="pl-4">&lt;<span className="text-yellow-400">StrategyModule</span> data={'{data}'} /&gt;</p>
                    <p className="pl-4">&lt;<span className="text-yellow-400">ResearchAgent</span> provider={'{openRouter}'} /&gt;</p>
                    <p>);</p>
                    </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};
