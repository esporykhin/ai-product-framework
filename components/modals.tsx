
import React, { useState } from 'react';
import { AISettings } from '../types';
import { InputField } from './ui';
import { CloseIcon, UploadIcon } from './icons';
import { AVAILABLE_MODELS } from '../models';

export const AlertModal = ({ isOpen, onClose, title, message, isConfirm, onConfirm }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="p-6 text-center">
             <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
             <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-center">
             {isConfirm && (
                 <button 
                   onClick={onClose} 
                   className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                 >
                   Отмена
                 </button>
             )}
             <button 
               onClick={() => { if(onConfirm) onConfirm(); onClose(); }}
               className={`flex-1 px-4 py-2.5 text-white font-bold rounded-lg shadow-lg transition-all ${isConfirm ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30'}`}
             >
               {isConfirm ? 'Подтвердить' : 'OK'}
             </button>
          </div>
       </div>
    </div>
  )
}

export const ContextModal = ({ isOpen, onClose, context, onSave }: any) => {
  if (!isOpen) return null;
  const [localContext, setLocalContext] = useState(context);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h3 className="text-xl font-bold text-slate-900">📚 Контекст Проекта</h3>
                <p className="text-sm text-slate-500">Глобальные знания, которые ИИ применит ко всем гипотезам.</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><CloseIcon /></button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
             <textarea 
               value={localContext}
               onChange={(e) => setLocalContext(e.target.value)}
               placeholder="Опишите продукт, целевую аудиторию, ограничения..."
               className="w-full h-80 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono leading-relaxed resize-none"
             />
          </div>
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
             <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors">Отмена</button>
             <button 
               onClick={() => { onSave(localContext); onClose(); }}
               className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all"
             >
               Сохранить
             </button>
          </div>
       </div>
    </div>
  )
}

export const ImportModal = ({ isOpen, onClose, onImport }: any) => {
    if (!isOpen) return null;
    const [text, setText] = useState('');
  
    const handleImport = () => {
        if (!text.trim()) return;
        onImport(text);
        setText('');
        onClose();
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
         <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">📥 Импорт Markdown</h3>
                  <p className="text-sm text-slate-500">Вставьте текст экспорта. Система восстановит гипотезы, оценки и стратегию.</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><CloseIcon /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
               <textarea 
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder="# AI Product Framework Export..."
                 className="w-full h-80 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-mono leading-relaxed resize-none bg-slate-50"
               />
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
               <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors">Отмена</button>
               <button 
                 onClick={handleImport}
                 disabled={!text.trim()}
                 className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
               >
                 <UploadIcon /> Распарсить и Добавить
               </button>
            </div>
         </div>
      </div>
    )
  }

export const SettingsModal = ({ isOpen, onClose, settings, onSave }: { isOpen: boolean, onClose: () => void, settings: AISettings, onSave: (s: AISettings) => void }) => {
  if (!isOpen) return null;
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-xl font-bold text-slate-900">⚙️ Настройки AI</h3>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><CloseIcon /></button>
          </div>
          <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-700">Мы используем OpenRouter для доступа к моделям (GPT-4o, Claude 3.5, Perplexity и др).</p>
                    <InputField 
                      label="OpenRouter API Key"
                      type="password"
                      value={localSettings.openRouterKey}
                      onChange={(v: string) => setLocalSettings(s => ({ ...s, openRouterKey: v }))}
                      placeholder="sk-or-..."
                    />
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Основная Chat Модель</label>
                        <select
                            value={localSettings.openRouterModel}
                            onChange={(e) => setLocalSettings(s => ({ ...s, openRouterModel: e.target.value }))}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer text-sm"
                        >
                            <optgroup label="Fast Chat">
                                {AVAILABLE_MODELS.filter(m => m.category === 'chat').map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Reasoning (Slower)">
                                {AVAILABLE_MODELS.filter(m => m.category === 'reasoning').map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </optgroup>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Используется для чат-бота, генерации стратегии и GTM.</p>
                    </div>

                    <p className="text-xs text-slate-500">Ключ сохраняется локально в браузере.</p>
                </div>
          </div>
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
             <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors">Отмена</button>
             <button 
               onClick={() => { onSave(localSettings); onClose(); }}
               className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all"
             >
               Сохранить
             </button>
          </div>
       </div>
    </div>
  )
}
