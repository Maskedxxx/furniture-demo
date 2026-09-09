# FastAPI сервер для демо генерации кухонь
# Два эндпоинта: рендер из схемы (A) и замена столешницы (Б)

import base64
import logging
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.gemini import generate_image
from services.prompts import render_prompt, countertop_prompt

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("demo")

app = FastAPI(title="Furniture Demo API")

# CORS — разрешаем фронтенд на localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _detect_mime(filename: str) -> str:
    """Определяем MIME-тип по расширению файла."""
    name = filename.lower()
    if name.endswith(".png"):
        return "image/png"
    if name.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate-render")
async def generate_render(
    image: UploadFile = File(...),
    style: str = Form(...),
    facade: str = Form(...),
    countertop: str = Form(...),
    material: str = Form(""),
    notes: str = Form(""),
):
    """Сценарий A: схема/чертёж → фотореалистичный рендер кухни."""
    content = await image.read()
    log.info(f"[A] Получен файл: {image.filename} ({len(content)//1024} КБ), стиль={style}, фасад={facade}")
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(400, "Файл слишком большой (макс. 20 МБ)")

    img_b64 = base64.b64encode(content).decode("utf-8")
    mime = _detect_mime(image.filename or "photo.jpg")

    prompt = render_prompt(
        style=style, facade=facade, countertop=countertop,
        material=material or None, notes=notes or None,
    )

    log.info(f"[A] Отправляю в Gemini... (промпт {len(prompt)} символов)")
    t0 = time.time()
    result = await generate_image(prompt, img_b64, mime)
    elapsed = time.time() - t0
    log.info(f"[A] Gemini ответил за {elapsed:.1f} сек: {list(result.keys())}")

    if "error" in result:
        log.error(f"[A] Ошибка: {result['error'][:200]}")
        raise HTTPException(502, result["error"])

    if "image_base64" in result:
        log.info(f"[A] Успех! Изображение {len(result['image_base64'])//1024} КБ base64")
        return JSONResponse({
            "success": True,
            "image": f"data:{result['mime_type']};base64,{result['image_base64']}",
        })

    log.warning(f"[A] Gemini вернул текст: {result.get('text', '')[:100]}")
    return JSONResponse({
        "success": False,
        "message": result.get("text", "Не удалось сгенерировать изображение"),
    }, status_code=422)


@app.post("/api/replace-countertop")
async def replace_countertop(
    image: UploadFile = File(...),
    countertop_name: str = Form(...),
):
    """Сценарий Б: фото кухни → замена столешницы."""
    content = await image.read()
    log.info(f"[Б] Получен файл: {image.filename} ({len(content)//1024} КБ), столешница={countertop_name}")
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(400, "Файл слишком большой (макс. 20 МБ)")

    img_b64 = base64.b64encode(content).decode("utf-8")
    mime = _detect_mime(image.filename or "photo.jpg")

    prompt = countertop_prompt(countertop_name)

    log.info(f"[Б] Отправляю в Gemini...")
    t0 = time.time()
    result = await generate_image(prompt, img_b64, mime)
    elapsed = time.time() - t0
    log.info(f"[Б] Gemini ответил за {elapsed:.1f} сек: {list(result.keys())}")

    if "error" in result:
        log.error(f"[Б] Ошибка: {result['error'][:200]}")
        raise HTTPException(502, result["error"])

    if "image_base64" in result:
        log.info(f"[Б] Успех! Изображение {len(result['image_base64'])//1024} КБ base64")
        return JSONResponse({
            "success": True,
            "image": f"data:{result['mime_type']};base64,{result['image_base64']}",
        })

    log.warning(f"[Б] Gemini вернул текст: {result.get('text', '')[:100]}")
    return JSONResponse({
        "success": False,
        "message": result.get("text", "Не удалось сгенерировать изображение"),
    }, status_code=422)


# --- Отдача собранного фронта (в образе: frontend/dist → /app/static) ---
# Монтируется ПОСЛЕ API-роутов, иначе StaticFiles перехватит /api/*.
# html=True отдаёт index.html на корень. Без папки static (dev-режим с vite) блок не активен.
from pathlib import Path
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
