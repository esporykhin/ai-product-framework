
import React, { useState } from 'react';
import { ResearchItem } from '@shared/types';
import { SparklesIcon, TrashIcon, SendIcon, PlusIcon, ListIcon, BookIcon, GlobeIcon, RobotIcon } from '@shared/ui/icons';
import { AVAILABLE_MODELS, DEFAULT_RESEARCH_MODEL } from '@shared/config/models';
import { FormattedText } from '@shared/ui/FormattedText';

interface ResearchModuleProps {
    researchItems: ResearchItem[];
    onResearch: (query: string, model: string) => Promise<void>;
    onUpdateResult: (id: string, newResult: string) => void;
    onDelete: (id: string) => void;
    isResearching: boolean;
}

export const ResearchModule: React.FC<ResearchModuleProps> = ({ 
    researchItems, 
    onResearch, 
    onUpdateResult, 
    onDelete,
    isResearching 
}) => {
    const [query, setQuery] = useState('');
    const [selectedModel, setSelectedModel] = useState(DEFAULT_RESEARCH_MODEL);
    const [activeReportId, setActiveReportId] = useState<string | 'new'>('new');
    const [isEditing, setIsEditing] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        await onResearch(query, selectedModel);
        setQuery('');
        
        // Switch to the newest item (first in list as App.tsx prepends)
        if (researchItems.length >= 0) {
             setActiveReportId('new'); 
        }
    };

    // Derived state for the active view
    const activeReport = researchItems.find(r => r.id === activeReportId);

    return (
        <div className="flex flex-col lg:flex-row h-[700px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* SIDEBAR: Reports List */}
            <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 flex flex-col min-w-0">
                <div className="p-4 border-b border-slate-200 shrink-0">
                    <button 
                        onClick={() => setActiveReportId('new')}
                        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${activeReportId === 'new' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}
                    >
                        <PlusIcon /> Новое исследование
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-0">
                    {researchItems.length === 0 && (
                        <div className="text-center p-6 text-slate-400 text-sm">
                            Нет сохраненных отчетов.
                        </div>
                    )}
                    {researchItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => { setActiveReportId(item.id); setIsEditing(false); }}
                            className={`group p-3 rounded-lg cursor-pointer border transition-all relative ${activeReportId === item.id ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-200/50'}`}
                        >
                            <div className="pr-6 min-w-0">
                                {/* FIX: break-words to prevent long text overflow */}
                                <div className={`font-bold text-sm mb-1 break-words line-clamp-2 ${activeReportId === item.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {item.query}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                                        {AVAILABLE_MODELS.find(m => m.id === item.model)?.name || 'AI Model'}
                                    </span>
                                    <span>•</span>
                                    <span className="whitespace-nowrap">{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); if(activeReportId === item.id) setActiveReportId('new'); }}
                                className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Удалить отчет"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN AREA: Content */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {activeReportId === 'new' ? (
                    // NEW SEARCH VIEW
                    <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 animate-fade-in overflow-y-auto">
                        <div className="w-full max-w-2xl space-y-8">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <GlobeIcon />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Запустить Deep Research</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Используйте модели с доступом в интернет (Perplexity, Gemini) для анализа рынка, конкурентов и поиска фактов.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-lg shadow-indigo-500/10 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                <textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Например: Сравни цены конкурентов на рынке CRM для малого бизнеса в 2024 году..."
                                    className="w-full p-4 outline-none text-base text-slate-800 placeholder-slate-400 resize-none rounded-xl"
                                    rows={3}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between px-2 pb-2 mt-2">
                                     <div className="flex items-center">
                                        <select 
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="bg-slate-50 text-xs font-bold text-indigo-700 py-1.5 px-3 rounded-lg border border-slate-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                        >
                                            <optgroup label="🌐 Internet Enabled">
                                                {AVAILABLE_MODELS.filter(m => m.category === 'internet').map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="🧠 Deep Reasoning">
                                                {AVAILABLE_MODELS.filter(m => m.category === 'reasoning').map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="💬 Fast Chat">
                                                {AVAILABLE_MODELS.filter(m => m.category === 'chat').map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                     </div>
                                     <button 
                                        onClick={handleSearch}
                                        disabled={isResearching || !query.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2 font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                     >
                                        {isResearching ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Thinking...</>
                                        ) : (
                                            <><SparklesIcon /> Run Research</>
                                        )}
                                     </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 max-w-lg mx-auto">
                                <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Доступ к свежим данным</div>
                                <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Анализ конкурентов</div>
                                <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>Поиск научных статей</div>
                                <div className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>Технические бенчмарки</div>
                            </div>
                        </div>
                    </div>
                ) : activeReport ? (
                    // REPORT VIEW
                    <div className="flex flex-col h-full animate-fade-in min-w-0">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2 break-words">{activeReport.query}</h2>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded">
                                            <RobotIcon /> {AVAILABLE_MODELS.find(m => m.id === activeReport.model)?.name || activeReport.model}
                                        </span>
                                        <span>{new Date(activeReport.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isEditing ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {isEditing ? 'Просмотр' : 'Редактировать'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* SOURCES BLOCK (New) */}
                        {activeReport.sources && activeReport.sources.length > 0 && !isEditing && (
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sources</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                    {activeReport.sources.map((source, idx) => (
                                        <a 
                                            key={idx} 
                                            href={source.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 w-48 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
                                        >
                                            <div className="text-[10px] text-slate-400 mb-1 truncate">
                                                {new URL(source.url).hostname.replace('www.', '')}
                                            </div>
                                            <div className="text-xs font-medium text-slate-700 line-clamp-2 group-hover:text-indigo-600 leading-snug">
                                                {source.title}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                             {isEditing ? (
                                <textarea 
                                    value={activeReport.result}
                                    onChange={(e) => onUpdateResult(activeReport.id, e.target.value)}
                                    className="w-full h-full min-h-[500px] p-4 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed"
                                />
                             ) : (
                                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-indigo-600">
                                    <FormattedText text={activeReport.result} />
                                </div>
                             )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Отчет не найден.
                    </div>
                )}
            </div>
        </div>
    );
};
