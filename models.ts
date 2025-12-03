
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
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        description: 'Универсальная, быстрая и умная модель.',
        contextWindow: 128000,
        recommendedFor: 'chat',
        category: 'chat'
    },
    {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Лучшая для написания текстов и кодинга.',
        contextWindow: 200000,
        recommendedFor: 'chat',
        category: 'chat'
    },
    {
        id: 'google/gemini-2.0-flash-001',
        name: 'Gemini 2.0 Flash',
        description: 'Очень быстрая и дешевая.',
        contextWindow: 1000000,
        recommendedFor: 'chat',
        category: 'chat'
    },
];

export const DEFAULT_CHAT_MODEL = 'openai/gpt-4o';
export const DEFAULT_RESEARCH_MODEL = 'perplexity/sonar-reasoning';
