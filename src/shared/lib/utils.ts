import { ProblemEntry, Step2Data, Step6Data, ChatSession, FrameworkState } from '../types';
import { INITIAL_STEP2, INITIAL_STEP6, AI_APPROACHES } from '../config/constants';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createNewProblem = (index: number): ProblemEntry => ({
  id: generateId(),
  title: `Гипотеза ${index + 1}`,
  userProblem: '',
  currentSolution: '',
  brokenAspects: '',
  successDefinition: '',
  strategicFocus: '',
  step2: { ...INITIAL_STEP2 },
  businessImpact: 5,
  selectedApproach: null,
  gtmPlan: '',
  research: [],
  step6: { ...INITIAL_STEP6 }
});

export const createNewChat = (): ChatSession => ({
  id: generateId(),
  title: 'Новый чат',
  messages: [{ 
    role: 'model', 
    text: 'Привет! Я анализирую ваши гипотезы. Могу помочь с оценкой, идеями или общей стратегией.', 
    timestamp: Date.now() 
  }],
  updatedAt: Date.now()
});

export const calculateProblemScore = (problem: ProblemEntry) => {
  return (Object.values(problem.step2) as number[]).reduce((a, b) => a + b, 0);
};

export const getVerdict = (score: number) => {
  if (score >= 30) return { text: 'Отличный кейс', color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' };
  if (score >= 20) return { text: 'Потенциал есть', color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' };
  if (score >= 10) return { text: 'Слабый кейс', color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' };
  return { text: 'Не подходит', color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800' };
};

const STEP2_LABELS: Record<keyof Step2Data, string> = {
  patternRecognition: 'Pattern Recognition',
  repetitiveTasks: 'Repetitive Tasks',
  scalability: 'Scalability',
  dataAvailability: 'Data Availability',
  predictionValue: 'Prediction Value',
  personalization: 'Personalization',
  contentGeneration: 'Content Generation',
  decisionComplexity: 'Decision Complexity'
};

export const generateMarkdownExport = (state: FrameworkState): string => {
  let md = `# AI Product Framework Export\n\n`;
  
  if (state.projectContext) {
    md += `## 🌍 Project Context\n${state.projectContext.trim()}\n\n---\n\n`;
  }

  if (state.finalStrategyText) {
     md += `## 🏆 Global Strategy\n${state.finalStrategyText.trim()}\n\n---\n\n`;
  }
  
  if (state.validationQuestions && state.validationQuestions.length > 0) {
      md += `## 👮‍♂️ Business Validation Q&A\n`;
      state.validationQuestions.forEach((q, i) => {
          md += `**Q${i+1}: ${q.question}**\nAnswer: ${q.answer || '(No answer)'}\n\n`;
      });
      md += `---\n\n`;
  }

  state.problems.forEach((p) => {
    const score = calculateProblemScore(p);
    md += `## 💡 Hypothesis: ${p.title}\n`;
    
    md += `### 1. Definition\n`;
    md += `- **Problem:** ${p.userProblem || 'N/A'}\n`;
    md += `- **Current Solution:** ${p.currentSolution || 'N/A'}\n`;
    md += `- **Broken Aspects:** ${p.brokenAspects || 'N/A'}\n`;
    md += `- **Success Criteria:** ${p.successDefinition || 'N/A'}\n`;
    md += `- **Strategic Focus:** ${p.strategicFocus || 'N/A'}\n\n`;

    md += `### 2. Assessment & Score\n`;
    md += `**Total Score:** ${score}/40\n`;
    md += `**Business Impact:** ${p.businessImpact || 5}\n\n`;
    md += `**Detailed Factors:**\n`;
    (Object.entries(p.step2) as [keyof Step2Data, number][]).forEach(([key, val]) => {
        md += `- ${STEP2_LABELS[key]}: ${val}\n`;
    });
    md += `\n`;

    md += `### 3. Approach\n`;
    md += `- **Technology:** ${p.selectedApproach || 'Not selected'}\n\n`;

    md += `### 4. GTM Strategy\n`;
    md += `${p.gtmPlan || 'Not defined'}\n\n`;

    if (p.research && p.research.length > 0) {
        md += `### 🔬 Research\n`;
        p.research.forEach(r => {
            md += `#### Query: ${r.query}\n`;
            md += `> Model: ${r.model}\n`;
            if (r.sources && r.sources.length > 0) {
                md += `> Sources:\n`;
                r.sources.forEach(s => {
                    md += `> - [${s.title}](${s.url})\n`;
                });
            }
            md += `> Result:\n\n${r.result}\n\n`;
        });
    }

    md += `### 5. Risks (Ethics)\n`;
    md += `- Privacy: ${p.step6.privacy || '-'}\n`;
    md += `- Fairness: ${p.step6.fairness || '-'}\n`;
    md += `- Transparency: ${p.step6.transparency || '-'}\n`;
    md += `- Safety: ${p.step6.safety || '-'}\n`;
    md += `- Human Oversight: ${p.step6.humanOversight || '-'}\n`;
    md += `\n---\n\n`;
  });

  return md;
};

export const generateCSVExport = (problems: ProblemEntry[]): string => {
  let csv = '\uFEFF'; 
  
  const headers = [
    'Title', 
    'Problem', 
    'Current Solution', 
    'Strategic Focus', 
    'AI Score', 
    'Business Impact', 
    'Approach', 
    'GTM Plan',
    'Risks'
  ];
  
  csv += headers.join(';') + '\n';

  problems.forEach(p => {
    const row = [
      p.title,
      p.userProblem,
      p.currentSolution,
      p.strategicFocus,
      calculateProblemScore(p),
      p.businessImpact,
      p.selectedApproach || '',
      p.gtmPlan,
      `Privacy: ${p.step6.privacy} | Safety: ${p.step6.safety}`
    ].map(field => {
       const stringField = String(field || '').replace(/"/g, '""');
       return `"${stringField}"`;
    });

    csv += row.join(';') + '\n';
  });

  return csv;
};

export const parseMarkdownImport = (md: string): Partial<FrameworkState> => {
    const result: Partial<FrameworkState> = {
        problems: [],
        projectContext: '',
        finalStrategyText: '',
        validationQuestions: []
    };

    const contextMatch = md.match(/## .*Context[\s\S]*?\n([\s\S]*?)(?=\n--)/i);
    if (contextMatch) {
        result.projectContext = contextMatch[1].trim();
    }

    const strategyMatch = md.match(/## .*Strategy[\s\S]*?\n([\s\S]*?)(?=\n--)/i);
    if (strategyMatch) {
        result.finalStrategyText = strategyMatch[1].trim();
    }
    
    const validationMatch = md.match(/## .*Business Validation Q&A[\s\S]*?\n([\s\S]*?)(?=\n--)/i);
    if (validationMatch) {
        const valBlock = validationMatch[1];
        const valLines = valBlock.split('\n');
        let currentQ = '';
        valLines.forEach(line => {
             if (line.match(/^\*\*Q\d+:/)) {
                 currentQ = line.replace(/^\*\*Q\d+:\s*/, '').replace(/\*\*$/, '').trim();
             } else if (line.startsWith('Answer:') && currentQ) {
                 result.validationQuestions!.push({
                     id: generateId(),
                     question: currentQ,
                     answer: line.replace('Answer:', '').trim()
                 });
                 currentQ = '';
             }
        });
    }

    const lines = md.split('\n');
    let currentProblem: Partial<ProblemEntry> | null = null;
    
    type StringField = 'userProblem' | 'currentSolution' | 'brokenAspects' | 'successDefinition' | 'strategicFocus' | 'gtmPlan';
    let capturingField: StringField | null = null;
    let isCapturingResearch = false;
    let currentResearchItem: any = null;
    
    const commitProblem = () => {
        if (currentProblem) {
            if (!currentProblem.step2) currentProblem.step2 = { ...INITIAL_STEP2 };
            if (!currentProblem.step6) currentProblem.step6 = { ...INITIAL_STEP6 };
            if (!currentProblem.id) currentProblem.id = generateId();
            if (!currentProblem.title) currentProblem.title = 'Imported Hypothesis';
            if (!currentProblem.research) currentProblem.research = [];
            
            result.problems!.push(currentProblem as ProblemEntry);
            currentProblem = null;
            capturingField = null;
            isCapturingResearch = false;
            currentResearchItem = null;
        }
    };

    const TEXT_FIELDS: Record<string, StringField> = {
        'Problem': 'userProblem',
        'Current Solution': 'currentSolution',
        'Broken Aspects': 'brokenAspects',
        'Success Criteria': 'successDefinition',
        'Strategic Focus': 'strategicFocus'
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        const isHypothesisHeader = line.match(/^##\s+(?:💡\s*)?Hypothesis:?/i);
        
        if (isHypothesisHeader && !isCapturingResearch) {
            commitProblem();
            currentProblem = {
                title: line.replace(/^##\s+(?:💡\s*)?Hypothesis:?\s*/i, '').trim(),
                step2: { ...INITIAL_STEP2 },
                step6: { ...INITIAL_STEP6 },
                research: []
            };
            capturingField = null;
            continue;
        }

        if (!currentProblem) continue;

        if (!isCapturingResearch) {
            let foundNewField = false;
            for (const [key, prop] of Object.entries(TEXT_FIELDS)) {
                const regex = new RegExp(`^-\\s*\\*\\*${key}:\\*\\*`);
                if (regex.test(line)) {
                    const firstLine = line.split(`**${key}:**`)[1].trim();
                    currentProblem[prop] = firstLine;
                    capturingField = prop;
                    foundNewField = true;
                    break;
                }
            }
            if (foundNewField) continue;

            if (line.startsWith('### 4. GTM Strategy')) {
                capturingField = 'gtmPlan';
                continue;
            }
        }

        if (line.startsWith('### 🔬 Research')) {
            isCapturingResearch = true;
            capturingField = null;
            continue;
        }
        
        if (line.startsWith('### 5. Risks')) {
            isCapturingResearch = false;
            capturingField = null;
        }

        if (isCapturingResearch) {
            if (line.startsWith('#### Query:')) {
                currentResearchItem = {
                    id: generateId(),
                    query: line.replace('#### Query:', '').trim(),
                    result: '',
                    sources: [],
                    model: 'imported',
                    timestamp: Date.now()
                };
                if (!currentProblem.research) currentProblem.research = [];
                currentProblem.research.push(currentResearchItem);
                continue;
            }
            if (line.startsWith('> Model:') && currentResearchItem) {
                currentResearchItem.model = line.replace('> Model:', '').trim();
                continue;
            }
            if (line.startsWith('> Sources:') && currentResearchItem) {
                continue; 
            }
            if (line.trim().startsWith('> - [') && currentResearchItem) {
                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    if (!currentResearchItem.sources) currentResearchItem.sources = [];
                    currentResearchItem.sources.push({ title: match[1], url: match[2] });
                }
                continue;
            }
             if (line.startsWith('> Result:') && currentResearchItem) {
                continue; 
            }

            if (currentResearchItem) {
                 if (line.startsWith('### ') && !line.startsWith('#### ')) {
                 } else {
                     currentResearchItem.result += line + '\n';
                 }
                 continue;
            }
        }

        const isHeader = line.startsWith('###');
        const isImpact = line.match(/\*\*(?:Business )?Impact:\*\*/);
        const isTechnology = line.includes('**Technology:**');
        
        const isStep2 = Object.values(STEP2_LABELS).some(l => line.trim().startsWith(`- ${l}:`));
        const isStep6 = ['Privacy', 'Fairness', 'Transparency', 'Safety', 'Human Oversight'].some(l => line.trim().startsWith(`- ${l}:`));

        if (isHeader || isImpact || isTechnology || isStep2 || isStep6) {
            capturingField = null;
        }

        if (capturingField) {
            if (line.trim() !== '') {
                 const currentVal = (currentProblem[capturingField] as string) || '';
                 currentProblem[capturingField] = currentVal + (currentVal ? '\n' : '') + line.trim();
            }
            continue;
        }

        if (isImpact) {
             const impact = parseInt(line.match(/\d+/)?.[0] || '5');
             currentProblem.businessImpact = impact;
        }
        
        for (const [key, label] of Object.entries(STEP2_LABELS)) {
            if (line.includes(`- ${label}:`)) {
                const val = parseInt(line.split(':')[1]);
                if (!isNaN(val) && currentProblem.step2) {
                    (currentProblem.step2 as any)[key] = val;
                }
            }
        }

        if (line.includes('- Privacy:')) currentProblem.step6!.privacy = line.split(':')[1].trim();
        if (line.includes('- Fairness:')) currentProblem.step6!.fairness = line.split(':')[1].trim();
        if (line.includes('- Transparency:')) currentProblem.step6!.transparency = line.split(':')[1].trim();
        if (line.includes('- Safety:')) currentProblem.step6!.safety = line.split(':')[1].trim();
        if (line.includes('- Human Oversight:')) currentProblem.step6!.humanOversight = line.split(':')[1].trim();

        if (isTechnology) {
             const tech = line.split('**Technology:**')[1].trim();
             const found = AI_APPROACHES.find(a => tech.includes(a.id) || tech === a.id);
             currentProblem.selectedApproach = found ? found.id : tech;
        }
    }
    commitProblem();

    return result;
};
