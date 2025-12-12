export type Step2Data = {
  patternRecognition: number;
  repetitiveTasks: number;
  scalability: number;
  dataAvailability: number;
  predictionValue: number;
  personalization: number;
  contentGeneration: number;
  decisionComplexity: number;
};

export type Step6Data = {
  fairness: string;
  transparency: string;
  privacy: string;
  safety: string;
  humanOversight: string;
};

export type Source = {
    title: string;
    url: string;
};

export type ResearchItem = {
    id: string;
    query: string;
    result: string;
    sources: Source[];
    model: string;
    timestamp: number;
};

export type ProblemEntry = {
  id: string;
  title: string; 
  userProblem: string;
  currentSolution: string;
  brokenAspects: string;
  successDefinition: string;
  strategicFocus: string; 
  step2: Step2Data;
  businessImpact: number;
  selectedApproach: string | null;
  gtmPlan: string;
  research: ResearchItem[];
  step6: Step6Data;
};

export type ValidationItem = {
  id: string;
  question: string;
  answer: string;
};

export type AISettings = {
  openRouterKey: string;
  openRouterModel: string;
  provider: 'google' | 'openrouter';
  googleModel: string;
};

export type ContextSnippet = {
  id: string;
  text: string;
  source: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachedContexts?: ContextSnippet[];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export type FrameworkState = {
  activeView: 'problem' | 'strategy'; 
  activeProblemId: string;
  problems: ProblemEntry[];
  finalStrategyText: string;
  projectContext: string; 
  validationQuestions: ValidationItem[];
  aiSettings: AISettings;
  chats: ChatSession[];
  activeChatId: string;
  selectedContext: ContextSnippet[];
};
