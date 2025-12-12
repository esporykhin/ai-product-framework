
import React, { useState, useEffect } from 'react';

import { 
  FrameworkState, 
  ProblemEntry, 
  ChatMessage, 
  AISettings,
  Step2Data,
  Step6Data,
  ValidationItem,
  ContextSnippet
} from '@shared/types';

import { 
  STORAGE_KEY, 
  INITIAL_STATE, 
  INITIAL_AI_SETTINGS 
} from '@shared/config/constants';

import { 
  createNewProblem, 
  createNewChat, 
  calculateProblemScore,
  generateMarkdownExport,
  generateCSVExport,
  parseMarkdownImport,
  generateId
} from '@shared/lib/utils';

import { PROMPTS } from '@shared/lib/prompts';
import { makeAICall, makeResearchCall } from '@shared/api/openrouter';

// UI Imports
import { 
  BookIcon, 
  SettingsIcon, 
  RefreshIcon, 
  PlusIcon, 
  FlagIcon,
  SparklesIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  ArrowRightIcon
} from '@shared/ui/icons';

import { ContextModal, SettingsModal, ImportModal, AlertModal } from './components/modals';
import { StrategyView } from './views/StrategyView';
import { ProblemView } from './views/ProblemView';
import { AIChatContent } from './views/ChatPanel';

export const FrameworkApp = () => {
  const [data, setData] = useState<FrameworkState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
         const parsed = JSON.parse(saved);
         // Migrations
         parsed.problems = parsed.problems.map((p: any) => ({
             ...p,
             businessImpact: p.businessImpact ?? 5,
             gtmPlan: p.gtmPlan || '',
             research: p.research || [] // Ensure research array exists
         }));
         parsed.projectContext = parsed.projectContext || '';
         
         // Migration for Validation Questions (string[] -> ValidationItem[])
         if (parsed.validationQuestions && parsed.validationQuestions.length > 0) {
             if (typeof parsed.validationQuestions[0] === 'string') {
                 parsed.validationQuestions = parsed.validationQuestions.map((q: string) => ({
                     id: generateId(),
                     question: q,
                     answer: ''
                 }));
             }
         } else {
             parsed.validationQuestions = [];
         }
         
         // Ensure AI Settings has defaults if missing
         parsed.aiSettings = { ...INITIAL_AI_SETTINGS, ...parsed.aiSettings };

         // CRITICAL FIX: Force provider to OpenRouter to prevent Google SDK "API Key missing" error
         // if the user has legacy data in localStorage with provider='google'.
         parsed.aiSettings.provider = 'openrouter';
         
         if (!parsed.chats || parsed.chats.length === 0) {
            const chat = createNewChat();
            parsed.chats = [chat];
            parsed.activeChatId = chat.id;
         }

         // Migration for Context (null -> [])
         if (!Array.isArray(parsed.selectedContext)) {
             parsed.selectedContext = parsed.selectedContext ? [parsed.selectedContext] : [];
         }

         return parsed;
      }
    } catch (e) {
      console.error("Failed to load from storage", e);
    }
    return INITIAL_STATE;
  });
  
  const [chatOpen, setChatOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  // Custom Alert/Confirm State
  const [alertState, setAlertState] = useState<{ 
      isOpen: boolean, 
      title: string, 
      message: string, 
      isConfirm?: boolean, 
      onConfirm?: () => void 
  }>({ isOpen: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
      setAlertState({ 
          isOpen: true, 
          title, 
          message, 
          isConfirm: false, 
          onConfirm: undefined 
      });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
      setAlertState({ 
          isOpen: true, 
          title, 
          message, 
          isConfirm: true, 
          onConfirm: () => {
             onConfirm();
             // Modal closes inside component
          }
      });
  };
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingGTM, setIsGeneratingGTM] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const resetData = () => {
    showConfirm(
        'Сброс данных',
        'Вы уверены, что хотите удалить все гипотезы и чаты? Это действие нельзя отменить.',
        () => {
            setData(INITIAL_STATE);
            localStorage.removeItem(STORAGE_KEY);
            showAlert('Готово', 'Все данные были успешно сброшены.');
        }
    );
  };

  // Active Problem Helpers
  const activeProblem = data.problems.find(p => p.id === data.activeProblemId) || data.problems[0];
  const activeChat = data.chats.find(c => c.id === data.activeChatId) || data.chats[0];

  // --- Actions ---
  
  const addProblem = () => {
    const newP = createNewProblem(data.problems.length);
    setData(prev => ({
      ...prev,
      problems: [...prev.problems, newP],
      activeProblemId: newP.id,
      activeView: 'problem'
    }));
  };

  const removeProblem = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const problemIndex = data.problems.findIndex(p => p.id === id);
    if (problemIndex === -1) return;

    if (data.problems.length === 1) {
        showConfirm(
            'Очистить гипотезу?',
            'Это последняя гипотеза. Данные будут очищены, но сама вкладка останется.',
            () => {
                const fresh = createNewProblem(0);
                setData(prev => ({ ...prev, problems: [fresh], activeProblemId: fresh.id }));
            }
        );
        return;
    }
    
    showConfirm(
        'Удалить гипотезу?',
        'Вы уверены, что хотите удалить эту гипотезу безвозвратно?',
        () => {
            const newProblems = data.problems.filter(p => p.id !== id);
            // If we deleted the active one, switch to the one before it, or the first one
            const newActiveId = id === data.activeProblemId 
                ? (newProblems[problemIndex - 1] || newProblems[0]).id 
                : data.activeProblemId;

            setData(prev => ({
              ...prev,
              problems: newProblems,
              activeProblemId: newActiveId
            }));
        }
    );
  };

  const updateActiveProblem = (field: keyof ProblemEntry, val: any) => {
    setData(prev => ({
      ...prev,
      problems: prev.problems.map(p => p.id === prev.activeProblemId ? { ...p, [field]: val } : p)
    }));
  };
  
  const updateActiveStep2 = (field: keyof Step2Data, val: number) => {
    setData(prev => ({
      ...prev,
      problems: prev.problems.map(p => 
        p.id === prev.activeProblemId 
          ? { ...p, step2: { ...p.step2, [field]: val } } 
          : p
      )
    }));
  };

  const updateActiveStep6 = (field: keyof Step6Data, val: string) => {
    setData(prev => ({
      ...prev,
      problems: prev.problems.map(p => 
        p.id === prev.activeProblemId 
          ? { ...p, step6: { ...p.step6, [field]: val } } 
          : p
      )
    }));
  };

  const updateResearch = (id: string, newResult: string) => {
     setData(prev => ({
         ...prev,
         problems: prev.problems.map(p => {
             if (p.id !== prev.activeProblemId) return p;
             return {
                 ...p,
                 research: (p.research || []).map(r => r.id === id ? { ...r, result: newResult } : r)
             };
         })
     }));
  };

  const deleteResearch = (id: string) => {
      showConfirm("Удалить?", "Удалить результат этого исследования?", () => {
        setData(prev => ({
            ...prev,
            problems: prev.problems.map(p => {
                if (p.id !== prev.activeProblemId) return p;
                return {
                    ...p,
                    research: (p.research || []).filter(r => r.id !== id)
                };
            })
        }));
      });
  };

  const updateProjectContext = (ctx: string) => {
    setData(prev => ({ ...prev, projectContext: ctx }));
  };
  
  const updateAISettings = (s: AISettings) => {
    setData(prev => ({ ...prev, aiSettings: s }));
  };
  
  const updateFinalStrategyText = (text: string) => {
      setData(prev => ({ ...prev, finalStrategyText: text }));
  };
  
  const addSelectedContext = (ctx: ContextSnippet) => {
      setData(prev => ({ ...prev, selectedContext: [...(prev.selectedContext || []), ctx] }));
      setChatOpen(true);
  };

  const removeSelectedContext = (id: string) => {
      setData(prev => ({ ...prev, selectedContext: prev.selectedContext.filter(c => c.id !== id) }));
  };

  const clearSelectedContext = () => {
      setData(prev => ({ ...prev, selectedContext: [] }));
  };

  // Export Actions
  const handleExportMarkdown = () => {
      const md = generateMarkdownExport(data);
      navigator.clipboard.writeText(md).then(() => {
          showAlert("Успех", "Данные скопированы в буфер обмена (Markdown). Вы можете вставить их в ChatGPT/Claude.");
      }).catch(err => {
          console.error(err);
          showAlert("Ошибка", "Не удалось скопировать данные.");
      });
  };

  const handleExportCSV = () => {
      const csv = generateCSVExport(data.problems);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai_framework_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  // Import Action
  const handleImportMarkdown = (text: string) => {
      try {
          const parsed = parseMarkdownImport(text);
          if (parsed.problems && parsed.problems.length > 0) {
              setData(prev => {
                  // If current state has only one empty problem (default state), replace it entirely
                  const isDefaultState = prev.problems.length === 1 && !prev.problems[0].userProblem && prev.problems[0].title === 'Гипотеза 1';
                  
                  let mergedProblems = [...prev.problems];
                  if (isDefaultState) {
                      mergedProblems = parsed.problems!;
                  } else {
                      mergedProblems = [...prev.problems, ...parsed.problems!];
                  }

                  return {
                      ...prev,
                      projectContext: parsed.projectContext || prev.projectContext,
                      finalStrategyText: parsed.finalStrategyText || prev.finalStrategyText,
                      validationQuestions: parsed.validationQuestions || prev.validationQuestions,
                      problems: mergedProblems,
                      activeProblemId: parsed.problems![0].id, // Switch to first imported
                      activeView: 'problem'
                  };
              });
              showAlert("Импорт завершен", `Успешно добавлено ${parsed.problems.length} гипотез.`);
          } else {
              showAlert("Ошибка импорта", "Не удалось найти гипотезы в тексте. Убедитесь, что формат соответствует экспорту.");
          }
      } catch (e) {
          console.error(e);
          showAlert("Ошибка", "Произошла ошибка при разборе текста.");
      }
  };

  // Chat Actions
  const handleCreateChat = () => {
    const newChat = createNewChat();
    setData(prev => ({
        ...prev,
        chats: [newChat, ...prev.chats],
        activeChatId: newChat.id
    }));
  };
  
  const handleDeleteChat = (id: string) => {
      if (data.chats.length <= 1) return; // Prevent deleting last chat
      const remaining = data.chats.filter(c => c.id !== id);
      setData(prev => ({
          ...prev,
          chats: remaining,
          activeChatId: id === prev.activeChatId ? remaining[0].id : prev.activeChatId
      }));
  };
  
  const handleSelectChat = (id: string) => {
      setData(prev => ({ ...prev, activeChatId: id }));
  };
  
  const handleUpdateMessages = (chatId: string, messages: ChatMessage[], newTitle?: string) => {
      setData(prev => ({
          ...prev,
          chats: prev.chats.map(c => 
              c.id === chatId 
                ? { ...c, messages: messages, title: newTitle || c.title, updatedAt: Date.now() } 
                : c
          )
      }));
  };

  // AI Orchestration
  const callAI = async (sys: string, user: any, specificModel?: string) => {
      // Overwrite model in settings temporarily for this call if specificModel is provided
      const settingsToUse = specificModel 
        ? { ...data.aiSettings, openRouterModel: specificModel }
        : data.aiSettings;
        
      return await makeAICall(settingsToUse, sys, user);
  }

  const synthesizeStrategy = async () => {
    if (!activeProblem.userProblem) return;

    setIsSynthesizing(true);
    try {
      const prompt = PROMPTS.STRATEGIC_FOCUS(
          activeProblem.userProblem,
          activeProblem.currentSolution,
          activeProblem.brokenAspects,
          data.projectContext
      );
      
      const text = await callAI("", prompt);
      if (text) {
        updateActiveProblem('strategicFocus', text);
      }
    } catch (e: any) {
      console.error(e);
      showAlert("Ошибка AI", e.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const generateGTM = async () => {
      if (!activeProblem.userProblem) return;
      setIsGeneratingGTM(true);
      try {
        const prompt = PROMPTS.GTM_PLAN(
            activeProblem.title,
            activeProblem.userProblem,
            activeProblem.selectedApproach || "Не выбран",
            data.projectContext
        );

        const text = await callAI("", prompt);
        if (text) {
            updateActiveProblem('gtmPlan', text);
        }
      } catch (e: any) {
          showAlert("Ошибка AI", `Не удалось сгенерировать GTM: ${e.message}`);
      } finally {
          setIsGeneratingGTM(false);
      }
  };

  const runDeepResearch = async (query: string, model: string) => {
      setIsResearching(true);
      try {
          const prompt = PROMPTS.RESEARCH_AGENT(query, data.projectContext);
          
          // Use Specialized Research Call that handles tools/sources
          const settingsToUse = { ...data.aiSettings, openRouterModel: model };
          const result = await makeResearchCall(settingsToUse, query, model, prompt);
          
          if (result) {
              const newResearchItem = {
                  id: generateId(),
                  query: query,
                  result: result.text,
                  sources: result.sources || [],
                  model: model,
                  timestamp: Date.now()
              };
              
              setData(prev => ({
                  ...prev,
                  problems: prev.problems.map(p => {
                      if (p.id !== prev.activeProblemId) return p;
                      return {
                          ...p,
                          research: [newResearchItem, ...(p.research || [])]
                      };
                  })
              }));
          }

      } catch (e: any) {
          showAlert("Ошибка Research Agent", e.message);
      } finally {
          setIsResearching(false);
      }
  };

  const generateGlobalStrategy = async () => {
    setIsGeneratingStrategy(true);
    try {
      const hypothesesContext = JSON.stringify(
          data.problems.map(p => ({
              title: p.title,
              score: calculateProblemScore(p),
              impact: p.businessImpact,
              gtm: p.gtmPlan ? "Есть план" : "Нет",
              focus: p.strategicFocus
          })), 
          null, 2
      );
      
      const validationContext = data.validationQuestions.map(v => 
          `Q: ${v.question}\nA: ${v.answer || 'Ответа нет'}`
      ).join('\n---\n');

      const prompt = PROMPTS.GLOBAL_STRATEGY(hypothesesContext, data.projectContext, validationContext);
      const text = await callAI("", prompt);

      if (text) {
        setData(prev => ({ ...prev, finalStrategyText: text }));
      }
    } catch (e: any) {
      showAlert("Ошибка AI", e.message);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const generateValidationQuestions = async () => {
    setIsValidating(true);
    try {
      const hypothesesSummary = JSON.stringify(data.problems.map(p => ({ title: p.title, problem: p.userProblem, focus: p.strategicFocus })), null, 2);
      const prompt = PROMPTS.VALIDATION_QUESTIONS(data.finalStrategyText, hypothesesSummary, data.projectContext);

      const text = await callAI("", prompt);

      if (text) {
        const questionsRaw = text.split('\n').filter(q => q.trim().length > 5);
        const questions: ValidationItem[] = questionsRaw.map(q => ({
            id: generateId(),
            question: q.replace(/^[-\d.]+\s*/, ''),
            answer: ''
        }));
        setData(prev => ({ ...prev, validationQuestions: questions }));
      }
    } catch (e: any) {
      showAlert("Ошибка AI", e.message);
    } finally {
      setIsValidating(false);
    }
  };
  
  const updateValidationAnswer = (id: string, answer: string) => {
      setData(prev => ({
          ...prev,
          validationQuestions: prev.validationQuestions.map(q => 
              q.id === id ? { ...q, answer } : q
          )
      }));
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      <ContextModal 
        isOpen={contextOpen} 
        onClose={() => setContextOpen(false)} 
        context={data.projectContext}
        onSave={updateProjectContext}
      />

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={data.aiSettings}
        onSave={updateAISettings}
      />

      <ImportModal 
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImportMarkdown}
      />

      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        isConfirm={alertState.isConfirm}
        onConfirm={alertState.onConfirm}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-hidden">
        
        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-8 pb-32 xl:pb-12">
        
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:px-8 shadow-sm">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                           <a href="#" className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600" title="Back to Home" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                           </a>
                           <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Product Framework</h1>
                                <p className="text-sm text-slate-500">Система принятия продуктовых решений</p>
                           </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => setContextOpen(true)}
                          className={`
                             flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-bold transition-colors uppercase tracking-wider px-4 py-2 rounded-lg border
                             ${data.projectContext ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}
                          `}
                        >
                          <BookIcon /> {data.projectContext ? 'Контекст (Активен)' : 'Контекст'}
                        </button>
                        
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setImportOpen(true)}
                                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-200"
                                title="Импорт из Markdown"
                            >
                                <UploadIcon />
                            </button>
                            <button 
                                onClick={handleExportMarkdown}
                                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-200"
                                title="Скопировать всё как Markdown для ChatGPT"
                            >
                                <CopyIcon />
                            </button>
                            <button 
                                onClick={handleExportCSV}
                                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-blue-50 px-3 py-2 rounded-lg border border-slate-200"
                                title="Скачать Excel/CSV"
                            >
                                <DownloadIcon />
                            </button>
                        </div>

                        <div className="w-px h-8 bg-slate-200 mx-1"></div>

                        <button 
                           onClick={() => setSettingsOpen(true)}
                           className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-primary-50 px-3 py-2 rounded-lg border border-slate-200"
                           title="Настройки Модели"
                        >
                           <SettingsIcon />
                        </button>
                        <button 
                          onClick={resetData}
                          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-lg"
                        >
                          <RefreshIcon />
                        </button>
                    </div>
                 </div>
                 
                 {/* Problem Tabs */}
                 <div className="flex overflow-x-auto gap-2 pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                   {data.problems.map((p) => {
                     const pScore = calculateProblemScore(p);
                     const isActive = p.id === data.activeProblemId && data.activeView === 'problem';

                     return (
                       <div 
                         key={p.id}
                         onClick={() => setData(prev => ({ ...prev, activeProblemId: p.id, activeView: 'problem' }))}
                         className={`
                           flex-shrink-0 group relative flex items-center gap-3 px-5 py-3 rounded-lg border cursor-pointer transition-all select-none min-w-[160px]
                           ${isActive 
                             ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                             : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                           }
                         `}
                       >
                         <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center w-full">
                                <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                  {p.title}
                                </span>
                                {data.problems.length > 1 && (
                                   <button 
                                     onClick={(e) => removeProblem(p.id, e)}
                                     className={`p-1 rounded-full hover:bg-white/20 transition-all ml-2 ${isActive ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-red-500'}`}
                                     title="Удалить"
                                   >
                                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                   </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                               <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>Score: {pScore}</span>
                               <div className={`w-2 h-2 rounded-full ${isActive ? (pScore >= 20 ? 'bg-emerald-400' : 'bg-orange-400') : (pScore >= 20 ? 'bg-emerald-500' : 'bg-slate-300')}`}></div>
                            </div>
                         </div>
                       </div>
                     )
                   })}
                   <button 
                     onClick={addProblem}
                     className="flex-shrink-0 flex items-center justify-center w-12 rounded-lg border border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
                     title="Добавить гипотезу"
                   >
                     <PlusIcon />
                   </button>
                   
                   {/* Divider */}
                   <div className="w-px bg-slate-300 mx-2 h-12 flex-shrink-0"></div>

                   {/* Strategy Tab */}
                   <div 
                      onClick={() => setData(prev => ({ ...prev, activeView: 'strategy' }))}
                      className={`
                           flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-lg border cursor-pointer transition-all select-none
                           ${data.activeView === 'strategy'
                             ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-md' 
                             : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50'
                           }
                         `}
                   >
                     <FlagIcon />
                     <span className="font-bold text-sm">Итоговая Стратегия</span>
                   </div>

                 </div>
            </div>

            {/* --- CONTENT SWITCHER --- */}

            {data.activeView === 'strategy' ? (
              <StrategyView 
                problems={data.problems}
                validationQuestions={data.validationQuestions}
                finalStrategyText={data.finalStrategyText}
                generateValidationQuestions={generateValidationQuestions}
                updateValidationAnswer={updateValidationAnswer}
                generateGlobalStrategy={generateGlobalStrategy}
                updateFinalStrategyText={updateFinalStrategyText}
                onAddContext={addSelectedContext}
                isValidating={isValidating}
                isGeneratingStrategy={isGeneratingStrategy}
              />
            ) : (
              <ProblemView 
                activeProblem={activeProblem}
                updateActiveProblem={updateActiveProblem}
                updateActiveStep2={updateActiveStep2}
                updateActiveStep6={updateActiveStep6}
                removeProblem={removeProblem}
                synthesizeStrategy={synthesizeStrategy}
                generateGTM={generateGTM}
                runResearch={runDeepResearch}
                updateResearch={updateResearch}
                deleteResearch={deleteResearch}
                isSynthesizing={isSynthesizing}
                isGeneratingGTM={isGeneratingGTM}
                isResearching={isResearching}
              />
            )}

          </div>
        </div>
      </main>

      {/* AI Chat Panel */}
      <>
        {chatOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setChatOpen(false)}
          ></div>
        )}

        <aside className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-2xl xl:shadow-none
          transform transition-transform duration-300 ease-in-out
          xl:transform-none xl:static xl:w-[400px] xl:h-screen xl:sticky xl:top-0 xl:flex xl:flex-col
          ${chatOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        `}>
          <AIChatContent 
            data={data} 
            activeProblem={activeProblem} 
            activeChat={activeChat}
            selectedContexts={data.selectedContext || []}
            onRemoveContext={removeSelectedContext}
            onClearContext={clearSelectedContext}
            makeAICall={callAI} 
            onCreateChat={handleCreateChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            onUpdateMessages={handleUpdateMessages}
            onCloseMobile={() => setChatOpen(false)}
          />
        </aside>

        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-50 xl:hidden w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl shadow-primary-600/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
          >
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
             <SparklesIcon />
          </button>
        )}
      </>
    </div>
  );
};
