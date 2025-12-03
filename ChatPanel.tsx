
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, PlusIcon, ListIcon, CloseIcon, ChatIcon, TrashIcon, SendIcon } from './icons';
import { FormattedText } from './components';
import { ChatMessage, ChatSession, FrameworkState, ProblemEntry } from './types';

interface ChatPanelProps {
  data: FrameworkState;
  activeProblem: ProblemEntry;
  activeChat: ChatSession;
  makeAICall: (system: string, user: any) => Promise<string>;
  onCreateChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onUpdateMessages: (id: string, msgs: ChatMessage[], title?: string) => void;
  onCloseMobile: () => void;
}

export const AIChatContent: React.FC<ChatPanelProps> = ({ 
  data, 
  activeProblem, 
  activeChat,
  makeAICall,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
  onUpdateMessages,
  onCloseMobile
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isHistoryView) scrollToBottom();
  }, [activeChat.messages, loading, isHistoryView]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    
    // Optimistic Update
    const newMessages = [...activeChat.messages, { role: 'user', text: userMsg, timestamp: Date.now() }];
    
    // Update Chat Title if it's the first real user message
    let newTitle = activeChat.title;
    if (activeChat.messages.length <= 1) {
       newTitle = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg;
    }
    
    // TypeScript fix: role must be 'user' | 'model'
    const updatedMessages = newMessages.map(m => ({...m, role: m.role as 'user' | 'model'}));

    onUpdateMessages(activeChat.id, updatedMessages, newTitle);
    setLoading(true);

    try {
      const context = `
        STATE: ${data.activeView === 'strategy' ? 'Viewing Strategy Dashboard' : 'Editing a specific problem'}
        USER PROVIDED GLOBAL CONTEXT: ${data.projectContext || 'None'}
        ALL PROBLEMS JSON:
        ${JSON.stringify(data.problems, null, 2)}
        ACTIVE PROBLEM (If editing):
        ${JSON.stringify(activeProblem, null, 2)}
      `;

      const systemInstruction = `You are an expert AI Product Manager.
      Role: Strategic Advisor.
      Language: Russian.
      Task: Provide insights. If the user is on the Strategy Dashboard, compare their hypotheses. If editing a problem, help with that specific one.
      Always consider the User Provided Global Context if it exists.
      `;
      
      const history = updatedMessages.map((m: any) => ({ role: m.role, text: m.text }));
      history.push({ role: 'user', text: `Context: ${context}\n\nUser Question: ${userMsg}` });

      const text = await makeAICall(systemInstruction, history);

      const responseMessage: ChatMessage = { role: 'model', text: text || '...', timestamp: Date.now() };
      onUpdateMessages(activeChat.id, [...updatedMessages, responseMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = { role: 'model', text: `Ошибка: ${error.message}`, timestamp: Date.now() };
      onUpdateMessages(activeChat.id, [...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
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
                {data.aiSettings.provider === 'google' ? 'GEMINI' : 'OPENROUTER'}
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
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChat.messages.map((msg: ChatMessage, idx: number) => (
              <div 
                key={idx} 
                className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-primary-100 text-primary-600'}`}>
                    {msg.role === 'user' ? 'You' : 'AI'}
                 </div>
                 <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-slate-800 border border-slate-100' : 'bg-gradient-to-br from-primary-600 to-indigo-700 text-white'}`}>
                    <FormattedText text={msg.text} />
                 </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">AI</div>
                 <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex gap-1 items-center">
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
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={loading ? "Подождите..." : "Спросите что-нибудь..."}
                disabled={loading}
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all shadow-md"
              >
                <SendIcon />
              </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">
                    ИИ имеет доступ к вашим гипотезам и контексту проекта.
                </p>
            </div>
          </div>
      )}
    </>
  );
};
