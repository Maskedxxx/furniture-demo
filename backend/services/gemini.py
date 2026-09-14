# Клиент для генерации изображений через OpenRouter (Gemini)

import base64
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "google/gemini-3.1-flash-image-preview")
CREDITS_URL = "https://openrouter.ai/settings/credits"

# Таймаут 120 сек — генерация изображений может быть долгой
CLIENT_TIMEOUT = httpx.Timeout(120.0, connect=15.0)

# Что означает код ответа OpenRouter — первая строка сообщения об ошибке на экране
REASONS = {
    401: "ключ OpenRouter недействителен или отозван",
    402: "на балансе OpenRouter нет средств",
    403: "доступ к модели запрещён для этого ключа",
    404: "модель не найдена на OpenRouter",
    429: "превышен лимит запросов OpenRouter",
}


def _client() -> httpx.AsyncClient:
    # Отдельная функция, чтобы в тестах подменить транспорт и не ходить в сеть
    return httpx.AsyncClient(timeout=CLIENT_TIMEOUT)


def describe_error(status: int, body: str) -> str:
    """Читаемое сообщение об ошибке провайдера: причина, модель, хвост ключа, где проверить.

    Полный ключ на экран не попадает — только последние 5 символов, чтобы понять, какой именно.
    """
    reason = REASONS.get(status, f"провайдер ответил ошибкой HTTP {status}")
    detail = ""
    try:
        import json
        err = json.loads(body).get("error", {})
        detail = err.get("message", "") if isinstance(err, dict) else str(err)
    except (ValueError, AttributeError):
        detail = body.strip()
    detail = detail[:200]
    key_tail = API_KEY[-5:] if API_KEY else "не задан"
    lines = [
        f"Генерация не выполнена: {reason} (HTTP {status}).",
        f"Модель: {MODEL} · ключ …{key_tail} · аккаунт OpenRouter",
        f"Проверить баланс и ключ: {CREDITS_URL}",
    ]
    if detail:
        lines.append(f"Ответ провайдера: {detail}")
    return "\n".join(lines)


async def generate_image(prompt: str, image_base64: str, mime_type: str = "image/jpeg") -> dict:
    """
    Отправляет промпт + изображение в Gemini, возвращает результат.

    Returns:
        {"image_base64": str, "mime_type": str} — если Gemini вернул изображение
        {"text": str} — если Gemini вернул только текст
        {"error": str} — если произошла ошибка
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{image_base64}"
                        },
                    },
                ],
            }
        ],
    }

    async with _client() as client:
        try:
            resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            return {"error": describe_error(e.response.status_code, e.response.text)}
        except httpx.RequestError as e:
            return {"error": f"Генерация не выполнена: OpenRouter недоступен по сети ({type(e).__name__}).\n"
                             f"Модель: {MODEL} · ключ …{API_KEY[-5:] if API_KEY else 'не задан'}\n"
                             f"Проверить: {CREDITS_URL}"}

    data = resp.json()

    # Логируем полный ответ для отладки
    import logging
    log = logging.getLogger("gemini")
    try:
        msg_keys = list(data.get("choices", [{}])[0].get("message", {}).keys())
        msg = data["choices"][0]["message"]
        log.info(f"Ответ OpenRouter: keys={msg_keys}, content_type={type(msg.get('content')).__name__}, "
                 f"images_count={len(msg.get('images', []))}, "
                 f"content_preview={str(msg.get('content', ''))[:200]}")
    except Exception:
        log.info(f"Ответ OpenRouter (raw): {str(data)[:500]}")

    # Проверяем наличие ошибки в ответе
    if "error" in data:
        return {"error": f"OpenRouter: {data['error']}"}

    # Извлекаем сообщение
    try:
        message = data["choices"][0]["message"]
    except (KeyError, IndexError):
        return {"error": f"Неожиданный формат ответа: {str(data)[:500]}"}

    # Проверяем наличие сгенерированного изображения
    images = message.get("images", [])
    if images:
        img_url = images[0]["image_url"]["url"]
        # Формат: "data:image/png;base64,<data>"
        if "," in img_url:
            header_part, b64_data = img_url.split(",", 1)
            # Определяем mime_type из header
            result_mime = "image/png"
            if "image/jpeg" in header_part:
                result_mime = "image/jpeg"
            elif "image/webp" in header_part:
                result_mime = "image/webp"
            return {"image_base64": b64_data, "mime_type": result_mime}
        else:
            return {"image_base64": img_url, "mime_type": "image/png"}

    # Если изображения нет — возвращаем текст
    text = message.get("content", "")
    if text:
        return {"text": text}

    return {"error": "Gemini не вернул ни изображение, ни текст"}
