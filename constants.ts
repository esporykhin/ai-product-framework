
import { Step2Data, Step6Data, AISettings, FrameworkState } from './types';

export const STORAGE_KEY = 'ai_framework_data_v7_clean';

export const INITIAL_STEP2: Step2Data = {
  patternRecognition: 1, repetitiveTasks: 1, scalability: 1, dataAvailability: 1,
  predictionValue: 1, personalization: 1, contentGeneration: 1, decisionComplexity: 1
};

export const INITIAL_STEP6: Step6Data = { 
  fairness: '', transparency: '', privacy: '', safety: '', humanOversight: '' 
};

export const INITIAL_AI_SETTINGS: AISettings = {
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: 'openai/gpt-4o',
  provider: 'openrouter',
  googleModel: 'gemini-2.5-flash',
};

export const INITIAL_STATE: FrameworkState = {
  activeView: 'problem',
  activeProblemId: 'default-problem',
  problems: [
    {
      id: 'default-problem',
      title: 'Гипотеза 1',
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
    }
  ],
  finalStrategyText: '',
  projectContext: '',
  validationQuestions: [],
  aiSettings: INITIAL_AI_SETTINGS,
  chats: [
    {
      id: 'default-chat',
      title: 'Новый чат',
      messages: [{ 
        role: 'model', 
        text: 'Привет! Я анализирую ваши гипотезы. Могу помочь с оценкой, GTM стратегией или рисками.', 
        timestamp: Date.now() 
      }],
      updatedAt: Date.now()
    }
  ],
  activeChatId: 'default-chat',
  selectedContext: []
};

export const AI_APPROACHES = [
  {
    id: 'classification',
    title: 'Классификация',
    icon: '🔍',
    tech: 'Classification models',
    examples: 'Спам-фильтры, анализ тональности',
    metrics: { tech: ['Accuracy', 'F1 Score'], biz: ['Снижение ошибок', 'Экономия затрат'] }
  },
  {
    id: 'forecasting',
    title: 'Прогнозирование',
    icon: '📈',
    tech: 'Regression, Time series',
    examples: 'Прогноз продаж, LTV',
    metrics: { tech: ['RMSE', 'MAE'], biz: ['Выручка', 'Оптимизация стока'] }
  },
  {
    id: 'personalization',
    title: 'Персонализация',
    icon: '🎯',
    tech: 'RecSys, Collab filtering',
    examples: 'Рекомендации товаров',
    metrics: { tech: ['Relevance'], biz: ['Конверсия', 'Средний чек'] }
  },
  {
    id: 'content_gen',
    title: 'Генерация (GenAI)',
    icon: '✨',
    tech: 'LLMs, Diffusion',
    examples: 'Тексты, картинки, код',
    metrics: { tech: ['Human eval'], biz: ['Time-to-market', 'UGC'] }
  },
  {
    id: 'nlu',
    title: 'Чат-боты / NLU',
    icon: '💬',
    tech: 'LLMs, NLP',
    examples: 'Поддержка, ассистенты',
    metrics: { tech: ['Intent recognition'], biz: ['Self-service rate'] }
  },
  {
    id: 'automation',
    title: 'Агенты',
    icon: '🤖',
    tech: 'Autonomous Agents',
    examples: 'Авто-закупки, планирование',
    metrics: { tech: ['Success rate'], biz: ['FTE saved'] }
  },
];
