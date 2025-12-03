
import React from 'react';

// --- Shared UI Components ---

export const StepBadge = ({ step }: { step: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
    {step}
  </span>
);

export const SectionHeader = ({ step, title, subtitle }: { step?: string, title: string, subtitle?: string }) => (
  <div className="mb-8">
    {step && <StepBadge step={step} />}
    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>}
  </div>
);

export const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

export const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }: any) => (
  <div className="mb-6 group last:mb-0">
    <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-primary-600 transition-colors">
      {label}
    </label>
    <textarea
      className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder-slate-400"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div className="mb-6 group last:mb-0">
      <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-primary-600 transition-colors">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder-slate-400 font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
);

export const ScoreSelector = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  return (
    <div className="flex gap-2 mt-3">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`
            flex-1 h-10 rounded-lg font-bold text-sm transition-all duration-200
            ${value === num 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export const FactorCard = ({ label, description, value, onChange }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <label className="text-sm font-bold text-slate-800 leading-tight">{label}</label>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${value >= 4 ? 'bg-green-100 text-green-700' : value <= 2 ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-700'}`}>
        {value}
      </div>
    </div>
    <p className="text-xs text-slate-500 h-8 line-clamp-2">{description}</p>
    <ScoreSelector value={value} onChange={onChange} />
  </div>
);

// --- Markdown Formatter ---
export const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
               <span className="text-primary-500 mt-1.5">•</span>
               <div className="flex-1">{parseInline(line.replace(/^[-*]\s+/, ''))}</div>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
           return (
            <div key={i} className="flex gap-2 ml-2">
               <span className="font-bold text-primary-500 mt-0">{line.match(/^\d+\./)?.[0]}</span>
               <div className="flex-1">{parseInline(line.replace(/^\d+\.\s+/, ''))}</div>
            </div>
           )
        }
        if (line.trim().startsWith('#')) {
             const level = line.match(/^#+/)?.[0].length || 1;
             const content = line.replace(/^#+\s*/, '');
             const size = level === 1 ? 'text-lg' : 'text-base';
             return <div key={i} className={`font-bold text-slate-900 mt-2 ${size}`}>{content}</div>
        }
        if (line.trim() === '') return <div key={i} className="h-2"></div>;
        return <div key={i}>{parseInline(line)}</div>;
      })}
    </div>
  );
};

const parseInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};
