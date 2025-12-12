---
inclusion: always
---
---
inclusion: always
---

# AI Integration Architecture

This document defines centralized patterns for AI integration in the AI Product Framework application.

## Core Principles

1. **Centralized API Layer**: All AI calls go through `@shared/api/openrouter.ts`
2. **Centralized Prompts**: All prompts stored in `@shared/lib/prompts.ts`
3. **Centralized Models**: Model configurations in `@shared/config/models.ts`
4. **No Direct API Calls**: Components never call AI APIs directly - always use shared functions

## API Layer (`@shared/api/openrouter.ts`)

### Available Functions

**`makeAICall(settings, systemPrompt, userPrompt)`**
- Standard chat completions
- Supports single message or conversation history
- Supports multimodal content (text + images)
- Returns plain text response
- Use for: Strategy generation, GTM plans, chat responses, image analysis
- Image format: Pass files array with base64 data URLs in message objects

**`makeResearchCall(settings, query, model, systemPrompt)`**
- Research with automatic source extraction
- Parses markdown links from response
- Returns: `{ text: string, sources: Source[] }`
- Use for: Market research, competitor analysis

### Error Handling Pattern

```typescript
try {
  const result = await makeAICall(settings, system, user);
  // Handle success
} catch (e: any) {
  showAlert("Error Title", e.message);
}
```

Always wrap AI calls in try-catch. Errors are user-friendly and localized.

## Prompt Management (`@shared/lib/prompts.ts`)

### Structure

All prompts exported from `PROMPTS` object:

```typescript
export const PROMPTS = {
  STRATEGIC_FOCUS: (problem, solution, broken, context) => `...`,
  GTM_PLAN: (title, problem, approach, context) => `...`,
  RESEARCH_AGENT: (query, context) => `...`,
  GLOBAL_STRATEGY: (hypotheses, project, validation) => `...`,
  VALIDATION_QUESTIONS: (strategy, hypotheses, context) => `...`,
  CHAT_SYSTEM: (view, context, allProblems, activeProblem) => `...`
};
```

### Prompt Design Rules

1. **Template Functions**: Prompts are functions that accept dynamic parameters
2. **Context Injection**: Always include `projectContext` parameter for user-provided context
3. **Role Definition**: Start with role instruction (e.g., "Действуй как CPO")
4. **Structured Output**: Specify exact format (Markdown, bullet points, sections)
5. **Language**: Primary language is Russian for UI-facing prompts
6. **Consistency**: Use similar structure across related prompts

### Adding New Prompts

1. Add to `PROMPTS` object in `prompts.ts`
2. Use template function pattern with typed parameters
3. Include context parameter: `(param1, param2, context) => ...`
4. Document expected output format in prompt text
5. Import and use: `import { PROMPTS } from '@shared/lib/prompts';`

## Model Configuration (`@shared/config/models.ts`)

### Model Registry

```typescript
interface AIModel {
  id: string;              // OpenRouter model ID
  name: string;            // Display name
  description: string;     // User-facing description
  contextWindow: number;   // Token limit
  recommendedFor: 'chat' | 'research' | 'coding';
  category: 'internet' | 'reasoning' | 'chat';
}
```

### Model Selection Strategy

- **Chat**: Fast, general-purpose models (GPT-5-mini, Claude)
- **Research**: Internet-enabled or reasoning models (Perplexity Sonar, o3-mini)
- **Strategy**: High-reasoning models (o3-mini-high, DeepSeek R1)

### Defaults

```typescript
export const DEFAULT_CHAT_MODEL = 'openai/gpt-5-mini';
export const DEFAULT_RESEARCH_MODEL = 'openai/o4-mini-deep-research';
```

## AI Settings Management

### Storage

Settings stored in `FrameworkState.aiSettings`:

```typescript
interface AISettings {
  openRouterKey: string;
  openRouterModel: string;
  provider: 'openrouter';
  googleModel?: string;
}
```

### Access Pattern

1. Settings passed from `FrameworkApp.tsx` down to components
2. Components receive `makeAICall` wrapper function, not raw settings
3. API key validation happens in `openrouter.ts`

## Component Integration Pattern

### DO: Use Wrapper Functions

```typescript
// In FrameworkApp.tsx
const makeAICall = async (system: string, user: any) => {
  return await makeAICallAPI(data.aiSettings, system, user);
};

// Pass to child
<ChatPanel makeAICall={makeAICall} />

// In child component
const response = await makeAICall(
  PROMPTS.CHAT_SYSTEM(view, context, problems, active),
  userMessage
);
```

### DON'T: Direct API Calls

```typescript
// ❌ Never do this in components
import { makeAICall } from '@shared/api/openrouter';
const response = await makeAICall(settings, system, user);
```

## Chat System Architecture

### Message Structure

```typescript
interface AttachedFile {
  id: string;
  name: string;
  type: string;
  base64: string;
  size: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachedContexts?: ContextSnippet[];
  attachedFiles?: AttachedFile[];
}
```

### Context Attachment

- Users can attach text snippets from UI to chat messages
- Contexts stored in message for history
- Injected into AI call but hidden from UI display
- Pattern: Append contexts to last user message before API call

### File Attachment (Images)

- Users can attach images (up to 10MB) to chat messages
- Images converted to base64 data URLs
- Supported formats: PNG, JPEG, WebP, GIF
- Files stored in message history for display
- Sent to OpenRouter API as multimodal content (image_url type)
- Pattern: Include files array in message object, API layer handles conversion

### Conversation History

- Full history passed to AI for context
- Format: `{ role: 'user' | 'model', text: string, files?: AttachedFile[] }[]`
- System prompt separate from history
- Files automatically converted to multimodal content format for API

## Loading States

### Standard Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAIAction = async () => {
  setIsLoading(true);
  try {
    const result = await makeAICall(...);
    // Update state
  } catch (e: any) {
    showAlert("Ошибка", e.message);
  } finally {
    setIsLoading(false);
  }
};
```

### UI Feedback

- Disable inputs during loading
- Show loading spinner or skeleton
- Optimistic updates for better UX (add user message immediately)

## Multi-Step AI Workflows

### Example: Strategy Generation

1. **Research Phase**: Use `makeResearchCall` with research model
2. **Strategy Phase**: Use `makeAICall` with reasoning model + research results
3. **Validation Phase**: Generate questions with `VALIDATION_QUESTIONS` prompt
4. **Final Strategy**: Synthesize with `GLOBAL_STRATEGY` prompt

### State Management

- Store intermediate results in `ProblemEntry` or `FrameworkState`
- Persist to localStorage automatically via `useEffect` in `FrameworkApp`
- Each step can be re-run independently

## Chat UI Features

### Expand Mode

- Chat can be expanded to full screen for better visibility
- Toggle button in chat header (ExpandIcon/ShrinkIcon)
- Expanded mode: Fixed overlay covering entire viewport
- Normal mode: Sidebar panel (400px width on desktop)
- State managed in FrameworkApp with `chatExpanded` boolean

### File Upload

- Paperclip button in chat input area
- Accepts images only (image/*)
- Max file size: 10MB
- Multiple files supported
- Preview thumbnails with remove buttons
- Files converted to base64 for storage and API transmission

## Adding New AI Features

### Checklist

1. **Define Prompt**: Add to `PROMPTS` in `prompts.ts`
2. **Choose Model**: Select appropriate model from `models.ts` or use default
3. **Create Wrapper**: In parent component, create wrapper function if needed
4. **Component Logic**: Use wrapper + prompt in component
5. **Error Handling**: Wrap in try-catch with user-friendly messages
6. **Loading State**: Add loading state and UI feedback
7. **Persistence**: Ensure results saved to state and localStorage

### Example: Adding New Analysis Type

```typescript
// 1. Add prompt
export const PROMPTS = {
  // ... existing
  COMPETITOR_ANALYSIS: (competitors, context) => `
    Analyze competitors: ${competitors}
    Context: ${context}
    ...
  `
};

// 2. In component
const analyzeCompetitors = async () => {
  setLoading(true);
  try {
    const result = await makeAICall(
      PROMPTS.COMPETITOR_ANALYSIS(competitorList, projectContext),
      "Provide detailed analysis"
    );
    setAnalysisResult(result);
  } catch (e: any) {
    showAlert("Ошибка анализа", e.message);
  } finally {
    setLoading(false);
  }
};
```

## Model Selection Guidelines

### When to Use Different Models

- **Quick Chat**: `gpt-5-mini` (fast, cheap)
- **Deep Analysis**: `o3-mini-high` (reasoning)
- **Internet Research**: `perplexity/sonar-reasoning` (real-time data)
- **Long Documents**: `gemini-3-pro-preview` (1M context)
- **Code Generation**: `claude-sonnet-4.5` or `deepseek-v3.2`

### Dynamic Model Selection

Allow users to override model in UI (AISettings modal), but provide smart defaults per use case.

## Security & API Keys

- API keys stored in localStorage (client-side only)
- Never commit keys to git
- Use `.env` for development defaults
- Validate key presence before API calls
- Clear error messages for missing/invalid keys

## Performance Optimization

- Use streaming for long responses (future enhancement)
- Cache research results when appropriate
- Debounce rapid AI calls
- Show progress indicators for multi-step workflows
- Lazy load chat history

## Testing AI Features

- Mock `makeAICall` in tests
- Test error handling paths
- Verify prompt construction with different inputs
- Test loading states and UI feedback
- Validate localStorage persistence 