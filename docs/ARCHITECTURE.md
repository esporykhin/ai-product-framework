# Архитектура проекта

## Обзор

AI Product Framework построен на модульной архитектуре с четким разделением ответственности.

## Структура

```
src/
├── app/                    # Application layer
│   └── App.tsx            # Root component, routing
│
├── features/              # Feature modules (business logic)
│   ├── framework/         # Main framework feature
│   │   ├── FrameworkApp.tsx
│   │   ├── components/    # Feature-specific components
│   │   └── views/         # Page-level components
│   └── landing/           # Landing page feature
│
├── shared/                # Shared kernel
│   ├── api/              # API clients
│   │   └── openrouter.ts
│   ├── config/           # Configuration
│   │   ├── constants.ts
│   │   └── models.ts
│   ├── lib/              # Business logic utilities
│   │   ├── prompts.ts
│   │   └── utils.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   └── ui/               # Reusable UI components
│       ├── components.tsx
│       ├── FormattedText.tsx
│       └── icons.tsx
│
└── styles/               # Global styles
    └── index.css
```

## Принципы

### 1. Feature-Sliced Design
- Каждая фича — независимый модуль
- Фичи не зависят друг от друга
- Общий код в `shared/`

### 2. Separation of Concerns
- **UI** — только отображение
- **Logic** — в `lib/` и `api/`
- **State** — React hooks + localStorage
- **Types** — централизованно в `shared/types/`

### 3. Scalability
- Легко добавить новую фичу
- Легко заменить API (например, с OpenRouter на прямой вызов)
- Легко добавить новый UI компонент

## Data Flow

```
User Action
    ↓
Component (features/)
    ↓
Business Logic (shared/lib/)
    ↓
API Call (shared/api/)
    ↓
State Update (React useState)
    ↓
localStorage Persistence
    ↓
Re-render
```

## State Management

- **Local State:** React `useState` для UI
- **Global State:** `FrameworkState` в `FrameworkApp.tsx`
- **Persistence:** `localStorage` с автосохранением
- **Migrations:** В `FrameworkApp.tsx` при загрузке

## API Layer

### OpenRouter Client (`shared/api/openrouter.ts`)
- Единая точка для всех AI вызовов
- Обработка ошибок
- Поддержка chat history
- Извлечение источников из ответов

## UI Components

### Shared UI (`shared/ui/`)
- **components.tsx** — базовые элементы (Card, Input, Button)
- **FormattedText.tsx** — Markdown рендеринг
- **icons.tsx** — SVG иконки

### Feature UI (`features/framework/components/`)
- Модалки (Settings, Context, Import)
- Специфичные для фичи компоненты

## Типизация

Все типы в `shared/types/index.ts`:
- `FrameworkState` — главное состояние
- `ProblemEntry` — гипотеза
- `ChatSession` — чат
- `AISettings` — настройки AI

## Конфигурация

### Constants (`shared/config/constants.ts`)
- Начальное состояние
- AI подходы
- Storage key

### Models (`shared/config/models.ts`)
- Список доступных моделей
- Категории (chat, research, reasoning)

## Расширение

### Добавить новую фичу
1. Создать `src/features/my-feature/`
2. Добавить компоненты
3. Подключить в `App.tsx`

### Добавить новый AI провайдер
1. Создать `src/shared/api/my-provider.ts`
2. Реализовать интерфейс `makeAICall`
3. Добавить в настройки

### Добавить новый UI компонент
1. Если переиспользуемый → `shared/ui/`
2. Если специфичный → `features/[feature]/components/`
