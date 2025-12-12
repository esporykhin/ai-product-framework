
import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { OpenSource } from './components/OpenSource';
import { Footer } from './components/Footer';
import { SparklesIcon } from '@shared/ui/icons';

export const LandingPage = ({ onNavigateToApp }: { onNavigateToApp: () => void }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
       <nav className="absolute top-0 w-full z-50 px-6 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                <div className="bg-slate-900 text-white p-1.5 rounded-lg"><SparklesIcon /></div>
                AI Product Framework
             </div>
             <button 
                onClick={onNavigateToApp}
                className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors bg-slate-50 hover:bg-white px-4 py-2 rounded-lg border border-transparent hover:border-slate-200"
             >
                Войти в Приложение
             </button>
          </div>
       </nav>
       
       <Hero onStart={onNavigateToApp} />
       <Features />
       <OpenSource />
       <Footer />
    </div>
  );
};
