
import React, { useState } from 'react';
import { AISettings } from './types';
import { InputField } from './components';
import { CloseIcon } from './icons';

export const ContextModal = ({ isOpen, onClose, context, onSave }: any) => {
  if (!isOpen) return null;
  const [localContext, setLocalContext] = useState(context);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h3 className="text-xl font-bold text-slate-900">📚 Контекст Проекта</h3>
                <p className="text-sm text-slate-500">Добавьте данные, CSV, заметки или мысли, которые ИИ должен учитывать.</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><CloseIcon /></button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
             <textarea 
               value={localContext}
               onChange={(e) => setLocalContext(e.target.value)}
               placeholder="Вставьте сюда любой текст: выгрузки из CRM, описание ЦА, заметки с встреч, CSV данные..."
               className="w-full h-80 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono leading-relaxed resize-none"
             />
          </div>
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
             <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors">Отмена</button>
             <button 
               onClick={() => { onSave(localContext); onClose(); }}
               className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all"
             >
               Сохранить Контекст
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
             <h3 className="text-xl font-bold text-slate-900">⚙️ Настройки AI Модели</h3>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><CloseIcon /></button>
          </div>
          <div className="p-6 space-y-6">
             {/* Provider Selection */}
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Провайдер</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                   <button 
                     onClick={() => setLocalSettings(s => ({ ...s, provider: 'google' }))}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${localSettings.provider === 'google' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Google Gemini
                   </button>
                   <button 
                     onClick={() => setLocalSettings(s => ({ ...s, provider: 'openrouter' }))}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${localSettings.provider === 'openrouter' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     OpenRouter
                   </button>
                </div>
             </div>

             {localSettings.provider === 'google' ? (
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Модель Gemini</label>
                   <select 
                     value={localSettings.googleModel}
                     onChange={(e) => setLocalSettings(s => ({ ...s, googleModel: e.target.value }))}
                     className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500"
                   >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Быстрая, по умолчанию)</option>
                      <option value="gemini-3-pro-preview">Gemini 3.0 Pro Preview (Умная, для сложных задач)</option>
                   </select>
                   <p className="text-xs text-slate-500 mt-2">Используется системный API Key, предоставленный платформой.</p>
                </div>
             ) : (
                <div className="space-y-4">
                    <InputField 
                      label="OpenRouter API Key"
                      type="password"
                      value={localSettings.openRouterKey}
                      onChange={(v: string) => setLocalSettings(s => ({ ...s, openRouterKey: v }))}
                      placeholder="sk-or-..."
                    />
                    <InputField 
                      label="Model ID"
                      value={localSettings.openRouterModel}
                      onChange={(v: string) => setLocalSettings(s => ({ ...s, openRouterModel: v }))}
                      placeholder="openai/gpt-4o, anthropic/claude-3.5-sonnet"
                    />
                    <p className="text-xs text-slate-500">Ключ сохраняется только в браузере (localStorage).</p>
                </div>
             )}
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
