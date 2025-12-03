
import { GoogleGenAI } from "@google/genai";
import { AISettings, Source } from "./types";

export const makeAICall = async (
    settings: AISettings,
    systemPrompt: string, 
    userPrompt: string | { role: 'user' | 'model', text: string }[]
  ): Promise<string> => {
    
    // Google Gemini Provider
    if (settings.provider === 'google') {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.warn("API_KEY not found in environment for Google GenAI.");
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey || '' });
        
        let contents = [];
        if (Array.isArray(userPrompt)) {
            contents = userPrompt.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));
        } else {
            contents = [{ role: 'user', parts: [{ text: userPrompt }] }];
        }

        try {
            const response = await ai.models.generateContent({
                model: settings.googleModel || 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction: systemPrompt
                }
            });
            return response.text || "";
        } catch (e: any) {
            console.error("Gemini Call Failed", e);
            throw new Error(e.message || "Не удалось получить ответ от Gemini");
        }
    }

    // OpenRouter Provider (Fallback)
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
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const json = await response.json();
        return json.choices?.[0]?.message?.content || "";
    } catch (e: any) {
        console.error("AI Call Failed", e);
        throw new Error(e.message || "Не удалось связаться с AI сервисом");
    }
};

export const makeResearchCall = async (
    settings: AISettings,
    query: string,
    model: string,
    systemPrompt: string
): Promise<{ text: string, sources: Source[] }> => {
    
    // Google Provider with Search Grounding
    if (settings.provider === 'google' || model.includes('gemini')) {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKey || '' });

        try {
            // Force use of a model that supports tools if possible, or use the user selected one
            // We enable googleSearch tool
            const response = await ai.models.generateContent({
                model: settings.googleModel || 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: query }] }],
                config: {
                    systemInstruction: systemPrompt,
                    tools: [{ googleSearch: {} }] 
                }
            });

            // Extract Sources from Grounding Metadata
            const sources: Source[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    sources.push({
                        title: chunk.web.title,
                        url: chunk.web.uri
                    });
                }
            });

            // Deduplicate sources
            const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());

            return {
                text: response.text || "",
                sources: uniqueSources
            };

        } catch (e: any) {
            console.error("Gemini Research Failed", e);
            throw new Error(e.message || "Ошибка при поиске через Gemini");
        }
    }

    // OpenRouter (Perplexity/Other)
    // We treat this as a standard call but try to extract sources if they are provided in text as markdown
    const text = await makeAICall({ ...settings, openRouterModel: model }, systemPrompt, query);
    
    const sources: Source[] = [];
    
    // Basic Markdown Link Extraction [Title](URL)
    // This is a simple heuristic since OpenRouter standard API doesn't always return structured citations
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
