# Образ демо furniture-demo: один контейнер — собранный фронт (Vite) + FastAPI,
# который отдаёт и API (/api/*), и статику фронта (/). Контекст сборки — корень репозитория.

# --- Стадия 1: сборка фронта ---
FROM node:20-alpine AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# результат сборки — в /build/dist
RUN npm run build

# --- Стадия 2: рантайм ---
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
# main.py монтирует ./static на /
COPY --from=frontend /build/dist ./static
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
