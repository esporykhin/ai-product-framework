# Contributing Guide

Спасибо за интерес к проекту! Мы рады любому вкладу — от исправления опечаток до новых фич.

## 🚀 Быстрый старт

### 1. Форк и клонирование

```bash
# Форкните репозиторий через GitHub UI
# Затем клонируйте ваш форк
git clone https://github.com/YOUR_USERNAME/ai-product-framework.git
cd ai-product-framework

# Добавьте upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/ai-product-framework.git
```

### 2. Установка

```bash
npm install
cp .env.example .env
# Добавьте ваш OpenRouter API ключ в .env
```

### 3. Запуск

```bash
npm run dev
```

Откроется `http://localhost:5173`

## 📝 Процесс разработки

### Создание feature branch

```bash
git checkout -b feature/my-awesome-feature
# или
git checkout -b fix/bug-description
```

### Naming conventions

**Branches:**
- `feature/` — новая функциональность
- `fix/` — исправление бага
- `docs/` — документация
- `refactor/` — рефакторинг без изменения функциональности
- `test/` — добавление тестов

**Commits:**

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: добавить экспорт в PDF
fix: исправить баг с сохранением чатов
docs: обновить README
refactor: переписать API клиент
style: форматирование кода
test: добавить тесты для utils
chore: обновить зависимости
```

## 🏗 Архитектура

### Структура проекта

```
src/
├── app/                    # Корневой компонент
├── features/              # Бизнес-фичи (изолированные модули)
│   ├── framework/         # Основное приложение
│   └── landing/           # Лендинг
├── shared/                # Переиспользуемый код
│   ├── api/              # API клиенты
│   ├── config/           # Конфигурация
│   ├── lib/              # Утилиты
│   ├── types/            # TypeScript типы
│   └── ui/               # UI компоненты
└── styles/               # Глобальные стили
```

### Правила

1. **Features не зависят друг от друга**
   - ❌ `features/framework` импортирует из `features/landing`
   - ✅ Оба импортируют из `shared/`

2. **Shared не зависит от features**
   - ❌ `shared/ui` импортирует из `features/framework`
   - ✅ `shared/` — только переиспользуемый код

3. **Используйте path aliases**
   ```typescript
   // ❌ Плохо
   import { ProblemEntry } from '../../../shared/types';
   
   // ✅ Хорошо
   import { ProblemEntry } from '@shared/types';
   ```

## 💻 Code Style

### TypeScript

```typescript
// ✅ Используйте строгую типизацию
interface Props {
  title: string;
  count: number;
}

// ❌ Избегайте any
const data: any = {};

// ✅ Экспортируйте типы из shared/types
export type { ProblemEntry } from '@shared/types';
```

### React

```typescript
// ✅ Функциональные компоненты
export const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

// ✅ Hooks для state
const [count, setCount] = useState(0);

// ✅ Props деструктуризация
const MyComponent = ({ title, subtitle }: Props) => { ... };
```

### Naming

- **Components:** `PascalCase` (MyComponent.tsx)
- **Functions:** `camelCase` (calculateScore)
- **Constants:** `UPPER_SNAKE_CASE` (API_KEY)
- **Files:** `kebab-case.ts` или `PascalCase.tsx` для компонентов

### Imports

Порядок импортов:

```typescript
// 1. React
import React, { useState } from 'react';

// 2. External libraries
import { someLib } from 'some-lib';

// 3. Internal - absolute paths
import { MyComponent } from '@shared/ui/components';
import { myUtil } from '@shared/lib/utils';

// 4. Relative imports (только внутри фичи)
import { LocalComponent } from './LocalComponent';

// 5. Styles
import './styles.css';
```

## 🧪 Тестирование

(В разработке)

```bash
npm run test
```

## 📦 Добавление новой фичи

### Пример: Добавить экспорт в PDF

1. **Создайте утилиту**

```typescript
// src/shared/lib/pdf-export.ts
export const generatePDF = (data: FrameworkState): Blob => {
  // Ваша логика
};
```

2. **Добавьте UI**

```typescript
// src/features/framework/components/ExportButton.tsx
import { generatePDF } from '@shared/lib/pdf-export';

export const ExportButton = ({ data }: Props) => {
  const handleExport = () => {
    const pdf = generatePDF(data);
    // Скачать файл
  };
  
  return <button onClick={handleExport}>Export PDF</button>;
};
```

3. **Интегрируйте**

```typescript
// src/features/framework/FrameworkApp.tsx
import { ExportButton } from './components/ExportButton';

// В JSX
<ExportButton data={data} />
```

## 🐛 Исправление бага

1. **Создайте Issue** (если еще нет)
2. **Воспроизведите баг** локально
3. **Исправьте** и проверьте
4. **Commit** с описанием
5. **Push** и создайте PR

## 📤 Pull Request

### Чеклист перед PR

- [ ] Код собирается без ошибок (`npm run build`)
- [ ] Нет TypeScript ошибок (`npm run type-check`)
- [ ] Код отформатирован
- [ ] Добавлено описание изменений
- [ ] Связан с Issue (если есть)

### Шаблон PR

```markdown
## Описание
Краткое описание изменений

## Тип изменений
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Как тестировать?
1. Шаг 1
2. Шаг 2

## Скриншоты (если применимо)

## Связанные Issues
Closes #123
```

## 🎯 Приоритетные задачи

### High Priority
- [ ] Добавить тесты (Vitest)
- [ ] Настроить CI/CD (GitHub Actions)
- [ ] Оптимизация bundle size

### Features
- [ ] Экспорт в PDF
- [ ] Темная тема
- [ ] Collaborative editing (WebSocket)
- [ ] Интеграция с Notion/Confluence
- [ ] Мобильная версия

### UX
- [ ] Drag & drop для приоритизации
- [ ] Keyboard shortcuts
- [ ] Undo/Redo
- [ ] Автосохранение с индикатором

## 💬 Вопросы?

- **GitHub Issues:** [Создать Issue](https://github.com/yourusername/ai-product-framework/issues)
- **Discussions:** [Обсуждения](https://github.com/yourusername/ai-product-framework/discussions)

## 📜 Code of Conduct

Будьте уважительны и конструктивны. Мы создаем инструмент для сообщества.

---

**Спасибо за вклад в проект! 🙏**
