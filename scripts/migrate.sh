#!/bin/bash

# Скрипт автоматической миграции на новую структуру
# Использование: bash scripts/migrate.sh

set -e

echo "🚀 Начинаем миграцию на новую структуру..."

# Создаем директории
echo "📁 Создаем директории..."
mkdir -p src/features/framework/views
mkdir -p src/features/framework/components/modals
mkdir -p src/features/landing/components

# Проверяем существование старых файлов
if [ ! -d "views" ]; then
    echo "⚠️  Директория views/ не найдена. Возможно, миграция уже выполнена."
    exit 0
fi

# Перемещаем views
echo "📦 Перемещаем views..."
[ -f "views/ChatPanel.tsx" ] && mv views/ChatPanel.tsx src/features/framework/views/
[ -f "views/ProblemView.tsx" ] && mv views/ProblemView.tsx src/features/framework/views/
[ -f "views/StrategyView.tsx" ] && mv views/StrategyView.tsx src/features/framework/views/
[ -f "views/ResearchModule.tsx" ] && mv views/ResearchModule.tsx src/features/framework/views/
[ -f "views/ValidationModule.tsx" ] && mv views/ValidationModule.tsx src/features/framework/views/
[ -f "views/LandingPage.tsx" ] && mv views/LandingPage.tsx src/features/landing/

# Перемещаем landing components
echo "📦 Перемещаем landing components..."
if [ -d "components/landing" ]; then
    mv components/landing/* src/features/landing/components/ 2>/dev/null || true
fi

# Перемещаем modals
echo "📦 Перемещаем modals..."
[ -f "components/modals.tsx" ] && mv components/modals.tsx src/features/framework/components/modals/index.tsx

# Перемещаем FrameworkApp
echo "📦 Перемещаем FrameworkApp..."
[ -f "FrameworkApp.tsx" ] && mv FrameworkApp.tsx src/features/framework/

# Удаляем пустые директории
echo "🧹 Удаляем пустые директории..."
[ -d "views" ] && rmdir views 2>/dev/null || true
[ -d "components/landing" ] && rmdir components/landing 2>/dev/null || true
[ -d "components" ] && rmdir components 2>/dev/null || true

# Удаляем старые файлы из корня (если они еще есть)
echo "🧹 Удаляем дубликаты из корня..."
rm -f ChatPanel.tsx ProblemView.tsx StrategyView.tsx Modals.tsx
rm -f components.tsx icons.tsx

echo ""
echo "✅ Миграция завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Обновите импорты в перемещенных файлах"
echo "2. Запустите: npm install"
echo "3. Запустите: npm run dev"
echo "4. Проверьте работоспособность"
echo ""
echo "📖 Подробности в REFACTORING_SUMMARY.md"
