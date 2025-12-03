
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-slate-900 font-bold text-lg">AI Product Framework</div>
            <p className="text-xs text-slate-400 mt-1">Inspired by OpenAI & Shopify Product Leaders</p>
          </div>
          
          <div className="text-slate-500 text-sm">
             © {new Date().getFullYear()} Open Source Project. Distributed under MIT License.
          </div>
          <div className="flex gap-6">
             <a href="#" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Documentation</a>
             <a href="https://github.com/esporykhin/ai-product-framework" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">GitHub</a>
             <a href="#" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Issues</a>
          </div>
       </div>
    </footer>
  );
};
