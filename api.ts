
import { AISettings, Source } from "./types";

export const makeAICall = async (
    settings: AISettings,
    systemPrompt: string, 
    userPrompt: string | { role: 'user' | 'model', text: string }[]
  ): Promise<string> => {
    
    // ONLY OPENROUTER LOGIC
    const { openRouterKey, openRouterModel } = settings;

    if (!openRouterKey) {
        throw new Error("API Key не установлен. Нажмите на иконку настроек (шестеренка) и введите ключ OpenRouter.");
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(userPrompt) 
        ? userPrompt.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }))
        : [{ role: 'user', content: userPrompt }])
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.href,
            "X-Title": "AI Product Framework"
            },
            body: JSON.stringify({
            model: openRouterModel || 'openai/gpt-4o',
            messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const json = await response.json();
        return json.choices?.[0]?.message?.content || "";
    } catch (e: any) {
        console.error("AI Call Failed", e);
        throw new Error(e.message || "Не удалось связаться с AI сервисом (OpenRouter). Проверьте ключ.");
    }
};

export const makeResearchCall = async (
    settings: AISettings,
    query: string,
    model: string,
    systemPrompt: string
): Promise<{ text: string, sources: Source[] }> => {
    
    // Treated as a standard call to OpenRouter (which supports Perplexity/Gemini via API)
    // We try to extract sources if they are provided in text as markdown
    const text = await makeAICall({ ...settings, openRouterModel: model }, systemPrompt, query);
    
    const sources: Source[] = [];
    
    // Basic Markdown Link Extraction [Title](URL)
    // Works well for Perplexity/Sonar models via OpenRouter as they often cite in Markdown
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
        sources.push({
            title: match[1],
            url: match[2]
        });
    }

    // Limit to reasonable amount and deduplicate
    const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values()).slice(0, 10);

    return {
        text,
        sources: uniqueSources
    };
};
