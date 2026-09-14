"""
Тест читаемых ошибок клиента OpenRouter: ответ провайдера подменяется транспортом httpx,
сеть не используется. Запуск из backend/: pip install -r requirements-dev.txt && pytest -q
"""
import asyncio
import json

import httpx

from services import gemini


def fake_client(status: int, body: dict | str):
    """AsyncClient с транспортом, который на любой запрос отвечает заданным кодом и телом."""
    text = json.dumps(body) if isinstance(body, dict) else body

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status, text=text, request=request)

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


def run(status, body, monkeypatch):
    monkeypatch.setattr(gemini, "API_KEY", "sk-or-v1-testkey12345")
    monkeypatch.setattr(gemini, "MODEL", "google/gemini-3.1-flash-image-preview")
    monkeypatch.setattr(gemini, "_client", lambda: fake_client(status, body))
    return asyncio.run(gemini.generate_image("prompt", "aGVsbG8=", "image/jpeg"))


def test_402_no_credits_is_readable(monkeypatch):
    body = {"error": {"message": "This request requires more credits, or fewer max_tokens.", "code": 402}}
    err = run(402, body, monkeypatch)["error"]
    lines = err.split("\n")
    assert lines[0] == "Генерация не выполнена: на балансе OpenRouter нет средств (HTTP 402)."
    assert lines[1] == "Модель: google/gemini-3.1-flash-image-preview · ключ …12345 · аккаунт OpenRouter"
    assert lines[2] == "Проверить баланс и ключ: https://openrouter.ai/settings/credits"
    assert lines[3].startswith("Ответ провайдера: This request requires more credits")
    assert "sk-or-v1-testkey" not in err        # полный ключ на экран не попадает


def test_401_bad_key(monkeypatch):
    err = run(401, {"error": {"message": "No auth credentials found", "code": 401}}, monkeypatch)["error"]
    assert err.startswith("Генерация не выполнена: ключ OpenRouter недействителен или отозван (HTTP 401).")


def test_unknown_status_and_non_json_body(monkeypatch):
    err = run(503, "<html>Service Unavailable</html>", monkeypatch)["error"]
    assert err.startswith("Генерация не выполнена: провайдер ответил ошибкой HTTP 503 (HTTP 503).")
    assert "Ответ провайдера: <html>Service Unavailable</html>" in err


def test_success_still_returns_image(monkeypatch):
    body = {"choices": [{"message": {"content": None, "images": [{"image_url": {"url": "data:image/png;base64,QUJD"}}]}}]}
    res = run(200, body, monkeypatch)
    assert res == {"image_base64": "QUJD", "mime_type": "image/png"}
