
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, PlusIcon, ListIcon, CloseIcon, ChatIcon, TrashIcon, SendIcon, ExpandIcon, ShrinkIcon, PaperclipIcon, ImageIcon } from '@shared/ui/icons';
import { FormattedText } from '@shared/ui/FormattedText';
import { ChatMessage, ChatSession, FrameworkState, ProblemEntry, ContextSnippet, AttachedFile } from '@shared/types';
import { PROMPTS } from '@shared/lib/prompts';

interface ChatPanelProps {
  data: FrameworkState;
  activeProblem: ProblemEntry;
  activeChat: ChatSession;
  selectedContexts: ContextSnippet[];
  onRemoveContext: (id: string) => void;
  onClearContext: () => void;
  makeAICall: (system: string, user: any) => Promise<string>;
  onCreateChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onUpdateMessages: (id: string, msgs: ChatMessage[], title?: string) => void;
  onCloseMobile: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  input?: string;
  onInputChange?: (value: string) => void;
  attachedFiles?: AttachedFile[];
  onAttachedFilesChange?: (files: AttachedFile[]) => void;
}

export const AIChatContent: React.FC<ChatPanelProps> = ({ 
  data, 
  activeProblem, 
  activeChat,
  selectedContexts,
  onRemoveContext,
  onClearContext,
  makeAICall,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
  onUpdateMessages,
  onCloseMobile,
  isExpanded = false,
  onToggleExpand,
  input: externalInput,
  onInputChange: externalOnInputChange,
  attachedFiles: externalAttachedFiles,
  onAttachedFilesChange: externalOnAttachedFilesChange
}) => {
  const [internalInput, setInternalInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [internalAttachedFiles, setInternalAttachedFiles] = useState<AttachedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external state if provided, otherwise use internal
  const input = externalInput !== undefined ? externalInput : internalInput;
  const setInput = externalOnInputChange || setInternalInput;
  const attachedFiles = externalAttachedFiles !== undefined ? externalAttachedFiles : internalAttachedFiles;
  const setAttachedFiles = externalOnAttachedFilesChange || setInternalAttachedFiles;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isHistoryView) scrollToBottom();
  }, [activeChat.messages, loading, isHistoryView]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only accept images
      if (!file.type.startsWith('image/')) {
        alert(`Файл ${file.name} не является изображением`);
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой (макс. 10MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          base64: base64,
          size: file.size
        });
      } catch (error) {
        console.error('Error reading file:', error);
        alert(`Ошибка чтения файла ${file.name}`);
      }
    }

    if (typeof setAttachedFiles === 'function') {
      const currentFiles = Array.isArray(attachedFiles) ? attachedFiles : [];
      setAttachedFiles([...currentFiles, ...newFiles]);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    if (typeof setAttachedFiles === 'function') {
      const currentFiles = Array.isArray(attachedFiles) ? attachedFiles : [];
      setAttachedFiles(currentFiles.filter((f: AttachedFile) => f.id !== id));
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    const userMsg = input;
    
    // Capture snapshot of contexts and files before clearing
    const currentContexts = [...selectedContexts];
    const currentFiles = [...attachedFiles];
    
    setInput('');
    setAttachedFiles([]);
    
    // Optimistic Update with Contexts and Files preserved in message
    const newMessage: ChatMessage = { 
        role: 'user', 
        text: userMsg, 
        timestamp: Date.now(),
        attachedContexts: currentContexts.length > 0 ? currentContexts : undefined,
        attachedFiles: currentFiles.length > 0 ? currentFiles : undefined
    };

    const newMessages = [...activeChat.messages, newMessage];
    
    // Update Chat Title if it's the first real user message
    let newTitle = activeChat.title;
    if (activeChat.messages.length <= 1) {
       newTitle = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg;
    }
    
    onUpdateMessages(activeChat.id, newMessages, newTitle);
    setLoading(true);

    // Clear UI selection immediately for better UX
    if (currentContexts.length > 0) onClearContext();

    try {
      // Build Prompt with Multiple Contexts
      let contextInjection = "";
      if (currentContexts.length > 0) {
          contextInjection += "\n\n=== USER ATTACHED CONTEXTS ===\n";
          currentContexts.forEach((ctx, index) => {
              contextInjection += `\n--- Context #${index + 1} from ${ctx.source} ---\n"${ctx.text}"\n`;
          });
          contextInjection += "\n(User wants to discuss these specific texts)\n==============================\n";
      }

      // Use centralized prompt
      const systemInstruction = PROMPTS.CHAT_SYSTEM(
         data.activeView === 'strategy' ? 'Strategy Dashboard' : 'Problem Editor',
         data.projectContext || 'None',
         JSON.stringify(data.problems, null, 2),
         JSON.stringify(activeProblem, null, 2)
      );
      
      const history = newMessages.map((m: any) => ({ 
        role: m.role, 
        text: m.text,
        files: m.attachedFiles 
      }));
      
      // Inject context into the last user message for the AI call only (hidden from UI text)
      if (contextInjection) {
          const lastMsg = history[history.length - 1];
          lastMsg.text += contextInjection;
      }
      
      const text = await makeAICall(systemInstruction, history);

      const responseMessage: ChatMessage = { role: 'model', text: text || '...', timestamp: Date.now() };
      onUpdateMessages(activeChat.id, [...newMessages, responseMessage]);

    } catch (error: any) {
      const errorMessage: ChatMessage = { role: 'model', text: `Ошибка: ${error.message}`, timestamp: Date.now() };
      onUpdateMessages(activeChat.id, [...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10 shrink-0 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 flex-shrink-0">
            <SparklesIcon />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm truncate">{isHistoryView ? 'История чатов' : activeChat.title}</h3>
            {!isHistoryView && (
              <p className="text-[10px] text-primary-600 font-bold flex items-center gap-1">
                 OPENROUTER
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           {isHistoryView ? (
             <button onClick={() => onCreateChat()} className="p-2 hover:bg-slate-100 text-primary-600 rounded-lg" title="Новый чат">
               <PlusIcon />
             </button>
           ) : (
             <>
                {onToggleExpand && (
                  <button 
                    onClick={onToggleExpand} 
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-lg transition-colors" 
                    title={isExpanded ? "Свернуть" : "Развернуть на весь экран"}
                  >
                    {isExpanded ? <ShrinkIcon /> : <ExpandIcon />}
                  </button>
                )}
                <button onClick={() => onCreateChat()} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-lg transition-colors" title="Новый чат">
                  <PlusIcon />
                </button>
                <button onClick={() => setIsHistoryView(true)} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-primary-600 rounded-lg transition-colors" title="История чатов">
                  <ListIcon />
                </button>
             </>
           )}
           <button 
              onClick={onCloseMobile} 
              className="xl:hidden p-2 hover:bg-slate-100 rounded-full text-slate-500 ml-1"
            >
              <CloseIcon />
            </button>
        </div>
      </div>

      {isHistoryView ? (
         <div className="flex-1 overflow-y-auto p-2 bg-slate-50 space-y-1">
            {data.chats.map((chat: ChatSession) => (
               <div 
                 key={chat.id}
                 onClick={() => { onSelectChat(chat.id); setIsHistoryView(false); }}
                 className={`
                    group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                    ${chat.id === activeChat.id ? 'bg-white border-primary-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:shadow-sm'}
                 `}
               >
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className={`p-2 rounded-lg ${chat.id === activeChat.id ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ChatIcon />
                     </div>
                     <div className="min-w-0">
                        <div className={`font-bold text-sm truncate ${chat.id === activeChat.id ? 'text-slate-900' : 'text-slate-600'}`}>{chat.title}</div>
                        <div className="text-xs text-slate-400">{new Date(chat.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                     </div>
                  </div>
                  {data.chats.length > 1 && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                       className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                       title="Удалить чат"
                     >
                       <TrashIcon />
                     </button>
                  )}
               </div>
            ))}
         </div>
      ) : (
         // Chat Messages
         <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeChat.messages.map((msg: ChatMessage, idx: number) => (
              <div 
                key={idx} 
                className={`flex gap-4 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${msg.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                    {msg.role === 'user' ? 'You' : 'AI'}
                 </div>
                 
                 {/* Updated Message Bubble Styles */}
                 <div className={`
                    max-w-[90%] rounded-2xl px-5 py-4 text-sm md:text-base leading-relaxed shadow-sm border
                    ${msg.role === 'user' 
                        ? 'bg-white text-slate-800 border-slate-200 rounded-tr-sm' 
                        : 'bg-indigo-50/80 text-slate-800 border-indigo-100 rounded-tl-sm'
                    }
                 `}>
                    {/* Render Attached Files in History */}
                    {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {msg.attachedFiles.map((file) => (
                                <div key={file.id} className="relative group">
                                    <img 
                                      src={file.base64} 
                                      alt={file.name} 
                                      className="max-w-full max-h-64 rounded-lg border border-slate-200"
                                    />
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                      <ImageIcon />
                                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                    </div>
                                </div>
                            ))}
                            <div className="h-px bg-slate-100 w-full my-2"></div>
                        </div>
                    )}
                    
                    {/* Render Attached Contexts in History */}
                    {msg.attachedContexts && msg.attachedContexts.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {msg.attachedContexts.map((ctx) => (
                                <div key={ctx.id} className="text-xs bg-purple-50/50 border-l-2 border-purple-400 p-2 rounded-r flex flex-col gap-1">
                                     <span className="font-bold text-[10px] text-purple-600 uppercase tracking-wide flex items-center gap-1">
                                        <ChatIcon /> {ctx.source}
                                     </span>
                                     <span className="text-slate-600 italic line-clamp-4">"{ctx.text}"</span>
                                </div>
                            ))}
                            <div className="h-px bg-slate-100 w-full my-2"></div>
                        </div>
                    )}
                    
                    <FormattedText text={msg.text} />
                 </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                 <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex gap-1 items-center shadow-sm">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>
      )}

      {/* Input Area */}
      {!isHistoryView && (
          <div className="p-4 bg-white border-t border-slate-200">
            {/* Visual Context Indicator */}
            {selectedContexts.length > 0 && (
                <div className="mb-3 flex flex-col gap-2 max-h-32 overflow-y-auto">
                    {selectedContexts.map((ctx) => (
                        <div key={ctx.id} className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start justify-between animate-fade-in shadow-sm">
                            <div className="flex items-start gap-2 overflow-hidden">
                                <div className="mt-1 text-purple-600"><ChatIcon /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Прикреплен контекст ({ctx.source})</p>
                                    <p className="text-xs text-slate-700 truncate italic">"{ctx.text.substring(0, 60)}..."</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemoveContext(ctx.id)} 
                                className="p-1 hover:bg-purple-100 rounded text-purple-400 hover:text-purple-700 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {attachedFiles.map((file) => (
                        <div key={file.id} className="relative group animate-fade-in">
                            <img 
                              src={file.base64} 
                              alt={file.name} 
                              className="h-24 w-24 object-cover rounded-lg border-2 border-slate-200"
                            />
                            <button 
                                onClick={() => removeFile(file.id)} 
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                                <CloseIcon />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded-b-lg truncate">
                                {file.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all"
                title="Прикрепить изображение"
              >
                <PaperclipIcon />
              </button>
              
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={loading ? "Подождите..." : attachedFiles.length > 0 ? "Опишите изображение или задайте вопрос..." : selectedContexts.length > 0 ? "Задайте вопрос по выделенному тексту..." : "Спросите что-нибудь... (Shift+Enter для переноса)"}
                  disabled={loading}
                  rows={1}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner text-sm md:text-base resize-none min-h-[48px] max-h-[150px]"
                  style={{ height: 'auto', minHeight: '48px' }}
                  onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || loading}
                  className="absolute right-2 bottom-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all shadow-md mb-1"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">
                    ИИ имеет доступ к вашим гипотезам и контексту проекта. Поддерживаются изображения до 10MB.
                </p>
                {attachedFiles.length > 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    ⚠️ Изображения не сохраняются между сессиями
                  </p>
                )}
            </div>
          </div>
      )}
    </>
  );
};