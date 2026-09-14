# Мебель AI — furniture-demo

Демо генерации изображений кухонь: чертёж → фотореалистичный рендер (сценарий A) и фото кухни →
замена столешницы (сценарий Б). Модель — Gemini через OpenRouter.

## Состав

| Где | Что |
|---|---|
| `frontend/src/App.jsx` | весь интерфейс: вход, выбор сценария, формы A и Б, результат. React + Vite, стили инлайном |
| `backend/main.py` | FastAPI: `/api/health`, `POST /api/generate-render` (A), `POST /api/replace-countertop` (Б); отдаёт собранный фронт из `static/` |
| `backend/services/gemini.py` | клиент OpenRouter; читаемые ошибки провайдера (`describe_error`) |
| `backend/services/prompts.py` | промпты сценариев A и Б |
| `backend/tests/` | тесты без сети (`pip install -r backend/requirements-dev.txt && pytest -q` из `backend/`) |
| `deploy/` | Docker Compose по стандарту spark-deploy: один образ (фронт собирается внутри), туннель tuna под профилем `public` |
| `legacy/` | старые запуски и черновики, не используется |

## Запуск

- **На Spark через платформу «демо всех проектов»** — кнопкой «Запустить» в лаунчере
  (`http://100.105.25.23:8090`, проект `furniture-demo`). Ссылка гостя: `https://furniture-demo.ru.tuna.am`.
- **Вручную на Spark:** `cd deploy && docker compose --profile public up -d --build`.
  Секреты — `deploy/.env` (см. `deploy/env.example`): `OPENROUTER_API_KEY`, `GEMINI_MODEL`, `TUNA_TOKEN`.
- **Разработка локально:** `cd backend && uvicorn main:app --reload` и `cd frontend && npm run dev`
  (Vite проксирует `/api` на `localhost:8000`).

## Заметка владельца

Фронт хороший, стиль нравится — при доработках сохранять его: тёплая палитра (`#f5f1ec` фон,
`#2a2420` текст, акцент `#9a7b50`), шрифт DM Sans с лёгкими заголовками (weight 300), карточки
с мягкими радиусами, никаких UI-библиотек. Подробнее — в скиле проекта.
