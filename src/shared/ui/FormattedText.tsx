import React from 'react';

const parseInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const TableRenderer: React.FC<{ rows: string[] }> = ({ rows }) => {
    if (rows.length < 2) return null;
    
    const headerRow = rows[0].trim().replace(/^\||\|$/g, '').split('|');
    const bodyRows = rows.slice(2).map(r => r.trim().replace(/^\||\|$/g, '').split('|'));

    return (
        <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {headerRow.map((cell, i) => (
                            <th key={i} className="px-4 py-3 text-left font-bold text-slate-700 tracking-wider">
                                {parseInline(cell.trim())}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {bodyRows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-slate-700 whitespace-pre-wrap">
                                    {parseInline(cell.trim())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const tableRows: string[] = [];
          while (i < lines.length && lines[i].trim().startsWith('|')) {
              tableRows.push(lines[i]);
              i++;
          }
          elements.push(<TableRenderer key={`table-${i}`} rows={tableRows} />);
          continue;
      }

      if (trimmed.startsWith('#')) {
             const level = trimmed.match(/^#+/)?.[0].length || 1;
             const content = trimmed.replace(/^#+\s*/, '');
             const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base font-bold'];
             const sizeClass = sizes[level - 1] || 'text-base font-bold';
             
             elements.push(
                <div key={i} className={`font-bold mt-6 mb-3 ${sizeClass}`}>
                    {content}
                </div>
             );
             i++;
             continue;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          elements.push(
            <div key={i} className="flex gap-2 ml-2 mb-2">
               <span className="text-primary-500 mt-1.5 text-xs">•</span>
               <div className="flex-1 leading-relaxed">{parseInline(trimmed.replace(/^[-*]\s+/, ''))}</div>
            </div>
          );
          i++;
          continue;
      }

      if (/^\d+\.\s/.test(trimmed)) {
           elements.push(
            <div key={i} className="flex gap-2 ml-2 mb-2">
               <span className="font-bold text-primary-500 mt-0 text-sm min-w-[20px]">{trimmed.match(/^\d+\./)?.[0]}</span>
               <div className="flex-1 leading-relaxed">{parseInline(trimmed.replace(/^\d+\.\s+/, ''))}</div>
            </div>
           )
           i++;
           continue;
      }

      if (trimmed.startsWith('>')) {
          elements.push(
              <div key={i} className="border-l-4 border-indigo-200 pl-4 py-2 my-4 text-slate-500 italic bg-slate-50 rounded-r-lg">
                  {parseInline(trimmed.replace(/^>\s*/, ''))}
              </div>
          );
          i++;
          continue;
      }

      if (trimmed === '') {
          elements.push(<div key={i} className="h-4"></div>);
          i++;
          continue;
      }

      elements.push(<div key={i} className="leading-relaxed mb-2">{parseInline(line)}</div>);
      i++;
  }

  return <div className="space-y-1">{elements}</div>;
};
