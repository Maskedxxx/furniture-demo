#!/bin/bash
# Запуск демо: бэкенд (FastAPI) + фронтенд (Vite)
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Furniture Demo ==="
echo ""

# 1. Создание/активация venv + установка зависимостей бэкенда
if [ ! -d "$DIR/.venv" ]; then
  echo "📦 Создаю виртуальное окружение..."
  python3 -m venv "$DIR/.venv"
fi
source "$DIR/.venv/bin/activate"
echo "📦 Устанавливаю зависимости бэкенда..."
pip install -q -r "$DIR/backend/requirements.txt"

# 2. Установка зависимостей фронтенда
echo "📦 Устанавливаю зависимости фронтенда..."
cd "$DIR/frontend"
npm install --silent 2>/dev/null

# 3. Запуск бэкенда в фоне
echo "🚀 Запускаю бэкенд (порт 8000)..."
cd "$DIR/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 4. Запуск фронтенда
echo "🚀 Запускаю фронтенд (порт 5173)..."
cd "$DIR/frontend"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "✅ Демо запущено:"
echo "   Фронтенд: http://localhost:5173"
echo "   Бэкенд:   http://localhost:8000"
echo "   API docs:  http://localhost:8000/docs"
echo ""
echo "   Нажмите Ctrl+C для остановки"
echo ""

# Останавливаем оба процесса при Ctrl+C
trap "echo ''; echo 'Останавливаю...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
