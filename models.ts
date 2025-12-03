
export interface AIModel {
    id: string;
    name: string;
    description: string;
    contextWindow: number;
    recommendedFor: 'chat' | 'research' | 'coding';
    category: 'internet' | 'reasoning' | 'chat'; // New category field
}

export const AVAILABLE_MODELS: AIModel[] = [
    // 1. Internet Enabled (The "Deep Research" models)
    {
        id: 'perplexity/sonar-reasoning',
        name: 'Sonar Reasoning (Perplexity)',
        description: 'Поиск в интернете в реальном времени + рассуждения.',
        contextWindow: 128000,
        recommendedFor: 'research',
        category: 'internet'
    },
    {
        id: 'perplexity/sonar',
        name: 'Sonar (Perplexity)',
        description: 'Быстрый поиск в интернете.',
        contextWindow: 128000,
        recommendedFor: 'research',
        category: 'internet'
    },
    {
        id: 'openai/o4-mini-deep-research',
        name: 'o4 mini deep-research',
        description: 'Модель с рассуждениями (Experimental).',
        contextWindow: 200000,
        recommendedFor: 'research',
        category: 'internet'
    },

    // 2. Reasoning (Deep logic, no internet usually, but great for analysis)
    {
        id: 'openai/o3-mini-high',
        name: 'OpenAI o3-mini (High)',
        description: 'Мощные рассуждения, идеально для стратегии.',
        contextWindow: 128000,
        recommendedFor: 'research',
        category: 'reasoning'
    },
    {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        description: 'Топовая Open Source модель для логики.',
        contextWindow: 64000,
        recommendedFor: 'research',
        category: 'reasoning'
    },

    // 3. Chat / Fast (Standard LLMs)
    {
        id: 'openai/gpt-5.1',
        name: 'GPT-5.1',
        description: 'Универсальная, быстрая и умная модель.',
        contextWindow: 400000,
        recommendedFor: 'chat',
        category: 'chat'
    },    
    {
        id: 'google/gemini-3-pro-preview',
        name: 'Gemini 3 PRO',
        description: 'Лучшая для написания текстов и кодинга.',
        contextWindow: 1000000,
        recommendedFor: 'chat',
        category: 'chat'
    },    
    {
        id: 'deepseek/deepseek-v3.2',
        name: 'Deepseek v3.2',
        description: 'Лучшая для написания текстов и кодинга.',
        contextWindow: 1000000,
        recommendedFor: 'chat',
        category: 'chat'
    },
    {
        id: 'anthropic/claude-sonnet-4.5',
        name: 'Claude 4.5 Sonnet',
        description: 'Лучшая для написания текстов и кодинга.',
        contextWindow: 1000000,
        recommendedFor: 'chat',
        category: 'chat'
    },
    {
        id: 'openai/gpt-5-mini',
        name: 'GPT-5 mini',
        description: 'Очень быстрая и дешевая.',
        contextWindow: 400000,
        recommendedFor: 'chat',
        category: 'chat'
    },
];

export const DEFAULT_CHAT_MODEL = 'openai/gpt-5-mini';
export const DEFAULT_RESEARCH_MODEL = 'openai/o4-mini-deep-research';
