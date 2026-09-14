import { useState, useRef, useEffect } from "react";

/* ===== ОБЩИЕ СТИЛИ И КОНСТАНТЫ ===== */

const VALID_USERS = {
  "demo@furniture.ai": "demo2026",
  "admin@furniture.ai": "admin2026",
};

const KITCHEN_STYLES = ["Современный", "Классика", "Лофт", "Минимализм", "Скандинавский"];
const FACADES = ["Белый", "Дуб светлый", "Графит", "Бежевый песок", "Олива", "Антрацит"];
const COUNTERTOPS_A = ["Мрамор белый", "Дуб натуральный", "Камень серый", "Бетон", "Гранит чёрный"];
const MATERIALS = ["ЛДСП", "МДФ", "Массив", "Пластик HPL"];

const COUNTERTOPS_B = [
  { id: "marble_white", name: "Мрамор белый", pattern: "linear-gradient(135deg, #e8e2da 0%, #f5f0eb 30%, #d9d0c5 60%, #efe9e2 100%)" },
  { id: "oak_light", name: "Дуб светлый", pattern: "linear-gradient(135deg, #c4a67a 0%, #d4b88e 25%, #b89566 50%, #cba87c 75%, #c4a67a 100%)" },
  { id: "granite_black", name: "Гранит чёрный", pattern: "linear-gradient(135deg, #2a2a2a 0%, #3d3d3d 30%, #1f1f1f 60%, #383838 100%)" },
  { id: "stone_grey", name: "Камень серый", pattern: "linear-gradient(135deg, #8a8680 0%, #9e9a94 30%, #7a7670 60%, #908c86 100%)" },
  { id: "concrete", name: "Бетон лофт", pattern: "linear-gradient(135deg, #a09e98 0%, #b0aea8 30%, #908e88 55%, #a8a6a0 100%)" },
  { id: "walnut", name: "Орех тёмный", pattern: "linear-gradient(135deg, #5c3d2e 0%, #6e4a38 25%, #4d3224 50%, #654434 75%, #5c3d2e 100%)" },
  { id: "marble_nero", name: "Мрамор Неро", pattern: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 20%, #1a1a1a 40%, #c8a876 41%, #1a1a1a 42%, #252525 70%, #1a1a1a 100%)" },
  { id: "quartz_beige", name: "Кварц бежевый", pattern: "linear-gradient(135deg, #d4c4aa 0%, #e0d2ba 30%, #c8b89e 60%, #dcceb6 100%)" },
];

/* SVG-заглушки для результата */
const PLACEHOLDER_BEFORE = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect fill="#e8e2da" width="800" height="500"/><rect fill="#d4ccc2" x="80" y="120" width="640" height="260" rx="8"/><rect fill="#c8bfb4" x="100" y="140" width="140" height="220" rx="4"/><rect fill="#c8bfb4" x="260" y="140" width="140" height="220" rx="4"/><rect fill="#c8bfb4" x="420" y="140" width="140" height="220" rx="4"/><rect fill="#c8bfb4" x="580" y="140" width="120" height="220" rx="4"/><rect fill="#b8aea2" x="80" y="100" width="640" height="24" rx="4"/><text x="400" y="440" text-anchor="middle" fill="#9a8e84" font-family="sans-serif" font-size="16">Исходное фото / схема</text></svg>`)}`;
const PLACEHOLDER_AFTER = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0ebe4"/><stop offset="100%" stop-color="#e4ddd4"/></linearGradient></defs><rect fill="url(#g)" width="800" height="500"/><rect fill="#c8bfb4" x="80" y="120" width="640" height="260" rx="8" opacity="0.6"/><rect fill="#b8956a" x="100" y="140" width="140" height="220" rx="4" opacity="0.7"/><rect fill="#b8956a" x="260" y="140" width="140" height="220" rx="4" opacity="0.65"/><rect fill="#b8956a" x="420" y="140" width="140" height="220" rx="4" opacity="0.7"/><rect fill="#b8956a" x="580" y="140" width="120" height="220" rx="4" opacity="0.65"/><rect fill="#9a7b50" x="80" y="100" width="640" height="24" rx="4" opacity="0.8"/><text x="400" y="440" text-anchor="middle" fill="#9a7b50" font-family="sans-serif" font-size="16">Сгенерированный результат</text></svg>`)}`;

/* Общие компоненты */
const BgPattern = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: `
      radial-gradient(circle at 30% 70%, rgba(180,140,100,0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(200,160,120,0.06) 0%, transparent 40%)
    `,
  }} />
);

const Header = ({ onBack, onLogout, showBack = true }) => (
  <header style={s.header}>
    <div style={s.headerLeft}>
      <span style={s.headerLogo}>◈</span>
      <span style={s.headerTitle}>Мебель AI</span>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      {showBack && <button style={s.headerBtn} onClick={onBack}>← Назад</button>}
      <button style={s.headerBtn} onClick={onLogout}>Выйти</button>
    </div>
  </header>
);

const Spinner = ({ text, sub }) => (
  <div style={{ textAlign: "center", paddingTop: 80 }}>
    <div style={s.spinner} />
    <h2 style={{ fontSize: 20, fontWeight: 400, color: "#2a2420", margin: "24px 0 8px" }}>{text}</h2>
    <p style={{ color: "#7a6e64", fontSize: 14 }}>{sub}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ===== СТРАНИЦА 1: ЛОГИН ===== */

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Заполните все поля"); return; }
    setLoading(true);
    setTimeout(() => {
      if (VALID_USERS[email] === password) { onLogin(email); }
      else { setError("Неверный email или пароль"); }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f1ec", position: "relative", overflow: "hidden" }}>
      <BgPattern />

      {/* Брендинг */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 50px", zIndex: 1 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 36, color: "#9a7b50", marginBottom: 20 }}>◈</div>
          <h1 style={{ fontSize: 38, fontWeight: 300, color: "#2a2420", letterSpacing: "0.04em", margin: 0 }}>Мебель AI</h1>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, #b8956a, transparent)", margin: "20px 0" }} />
          <p style={{ fontSize: 16, color: "#7a6e64", lineHeight: 1.6, fontWeight: 300 }}>Визуализация кухонь<br />на базе ИИ</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {["01 — Схема → фотореалистичный рендер", "02 — Замена столешницы на фото", "03 — Результат за 30 секунд"].map((t) => (
            <div key={t} style={{ fontSize: 14, color: "#6a6058", fontWeight: 300 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9a7b50", marginRight: 14 }}>{t.slice(0, 2)}</span>
              {t.slice(5)}
            </div>
          ))}
        </div>
      </div>

      {/* Форма */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, zIndex: 1 }}>
        <div style={s.card}>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: "#2a2420", margin: 0 }}>Вход</h2>
          <p style={{ fontSize: 13, color: "#8a7e74", marginTop: 6, fontWeight: 300, marginBottom: 32 }}>Демо-доступ для партнёров</p>

          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@furniture.ai"
              style={s.input} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Пароль</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" style={s.input} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <div style={{ background: "rgba(200,50,50,0.07)", border: "1px solid rgba(200,50,50,0.2)", color: "#a03030", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, whiteSpace: "pre-line" }}>{error}</div>}

          <button style={{ ...s.btnPrimary, width: "100%", opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Проверка..." : "Войти →"}
          </button>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#9a8e84", fontWeight: 300 }}>Доступ предоставляется менеджером</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== СТРАНИЦА 2: ВЫБОР СЦЕНАРИЯ ===== */

function ScenarioPage({ onSelect, onLogout }) {
  const [hovered, setHovered] = useState(null);

  const cards = [
    { key: "A", icon: "📐", title: "Схема → Рендер", desc: "Загрузите чертёж кухни с размерами, выберите стиль, цвет фасада и материал столешницы — ИИ сгенерирует фотореалистичный рендер.", steps: ["Загрузка чертежа", "Выбор параметров", "Генерация рендера"] },
    { key: "B", icon: "📸", title: "Замена столешницы", desc: "Загрузите реальное фото кухни, выберите новый цвет и материал столешницы из каталога — ИИ заменит её на фото.", steps: ["Загрузка фото", "Выбор столешницы", "Генерация замены"] },
  ];

  return (
    <div style={s.page}>
      <BgPattern />
      <Header showBack={false} onLogout={onLogout} />
      <main style={{ ...s.main, maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 300, color: "#2a2420", margin: 0 }}>Выберите сценарий</h1>
          <p style={{ fontSize: 15, color: "#7a6e64", marginTop: 8, fontWeight: 300 }}>Что вы хотите визуализировать?</p>
        </div>
        <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
          {cards.map((c) => (
            <div key={c.key}
              style={{
                ...s.card, flex: 1, maxWidth: 380, cursor: "pointer", transition: "all 0.25s",
                borderColor: hovered === c.key ? "rgba(154,123,80,0.4)" : "rgba(180,150,106,0.18)",
                transform: hovered === c.key ? "translateY(-4px)" : "none",
                boxShadow: hovered === c.key ? "0 12px 40px rgba(120,100,70,0.12)" : "0 4px 24px rgba(120,100,70,0.06)",
              }}
              onMouseEnter={() => setHovered(c.key)} onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(c.key)}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
              <div style={s.tag}>Сценарий {c.key}</div>
              <h2 style={{ fontSize: 22, fontWeight: 500, color: "#2a2420", margin: "0 0 0 0", lineHeight: 1.3 }}>{c.title}</h2>
              <div style={s.divider} />
              <p style={{ fontSize: 14, color: "#6a6058", lineHeight: 1.6, margin: "0 0 20px 0" }}>{c.desc}</p>
              {c.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7a6e64", marginBottom: 10 }}>
                  <span style={s.stepNum}>{i + 1}</span><span>{step}</span>
                </div>
              ))}
              <div style={{ fontSize: 14, fontWeight: 500, color: "#9a7b50", marginTop: 14 }}>Выбрать →</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ===== СТРАНИЦА 3A: СЦЕНАРИЙ A ===== */

function ScenarioAPage({ onResult, onBack, onLogout }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [style, setStyle] = useState("");
  const [facade, setFacade] = useState("");
  const [countertop, setCountertop] = useState("");
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const canGenerate = file && style && facade && countertop;

  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setElapsed(0);
    const timer = setInterval(() => setElapsed((t) => t + 1), 1000);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("style", style);
      formData.append("facade", facade);
      formData.append("countertop", countertop);
      formData.append("material", material);
      formData.append("notes", notes);
      const resp = await fetch("/api/generate-render", { method: "POST", body: formData });
      const data = await resp.json();
      clearInterval(timer);
      if (resp.ok && data.success) {
        onResult({ scenario: "A", params: [style, facade, countertop, material].filter(Boolean), beforeImage: preview, afterImage: data.image });
      } else {
        setError(data.message || data.detail || "Ошибка генерации");
        setGenerating(false);
      }
    } catch (e) {
      clearInterval(timer);
      setError("Сервер недоступен: " + e.message);
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div style={s.page}><BgPattern /><Header showBack={false} onLogout={onLogout} />
        <main style={{ ...s.main, maxWidth: 500 }}>
          <Spinner text="ИИ генерирует рендер..." sub={`Обычно 20–60 секунд... (${elapsed} сек)`} />
        </main>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <BgPattern />
      <Header onBack={onBack} onLogout={onLogout} />
      <main style={{ ...s.main, maxWidth: 960, paddingBottom: 120 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={s.tag}>Сценарий A</div>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: "#2a2420", margin: 0 }}>Схема → Рендер</h1>
          <p style={{ fontSize: 14, color: "#7a6e64", marginTop: 6, fontWeight: 300 }}>Загрузите чертёж кухни и настройте параметры визуализации</p>
        </div>

        <div style={{ display: "flex", gap: 36 }}>
          {/* Загрузка */}
          <div style={{ width: 340, flexShrink: 0 }}>
            <label style={s.sectionLabel}>1. Загрузите чертёж</label>
            <div
              style={{ ...s.dropZone, borderColor: dragOver ? "#9a7b50" : preview ? "rgba(154,123,80,0.3)" : "rgba(180,150,106,0.22)", background: dragOver ? "rgba(180,150,106,0.06)" : "rgba(255,255,255,0.4)" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
              {preview ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <img src={preview} alt="Чертёж" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
                  <div style={{ fontSize: 13, color: "#5a5048", marginTop: 10, fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "#b0a89e", marginTop: 4 }}>Нажмите чтобы заменить</div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📎</div>
                  <div style={{ fontSize: 15, color: "#4a4038" }}>Перетащите файл сюда</div>
                  <div style={{ fontSize: 13, color: "#9a8e84" }}>или нажмите для выбора</div>
                  <div style={{ fontSize: 11, color: "#b0a89e", marginTop: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>JPG, PNG, PDF</div>
                </div>
              )}
            </div>
          </div>

          {/* Параметры */}
          <div style={{ flex: 1 }}>
            <label style={s.sectionLabel}>2. Параметры</label>
            {[
              { label: "Стиль кухни", items: KITCHEN_STYLES, value: style, set: setStyle },
              { label: "Цвет фасада", items: FACADES, value: facade, set: setFacade },
              { label: "Столешница", items: COUNTERTOPS_A, value: countertop, set: setCountertop },
              { label: "Материал корпуса (опц.)", items: MATERIALS, value: material, set: (v) => setMaterial(material === v ? "" : v) },
            ].map((group) => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#4a4038", marginBottom: 8 }}>{group.label}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {group.items.map((item) => (
                    <button key={item} onClick={() => group.set(item)}
                      style={{ ...s.chip, background: group.value === item ? "#9a7b50" : "rgba(255,255,255,0.5)", color: group.value === item ? "#fff" : "#5a5048", borderColor: group.value === item ? "#9a7b50" : "rgba(180,150,106,0.2)" }}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#4a4038", marginBottom: 8 }}>Пожелания (опц.)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Светлая кухня, остров, подсветка..." style={s.textarea} />
            </div>
          </div>
        </div>

        {error && <div style={{ background: "rgba(200,50,50,0.07)", border: "1px solid rgba(200,50,50,0.2)", color: "#a03030", fontSize: 13, padding: "12px 16px", borderRadius: 10, marginTop: 16, whiteSpace: "pre-line" }}>{error}</div>}

        {/* Нижняя панель */}
        <div style={s.bottomBar}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {file && <span style={s.summaryTag}>📎 {file.name}</span>}
            {[style, facade, countertop, material].filter(Boolean).map((t) => <span key={t} style={s.summaryTag}>{t}</span>)}
          </div>
          <button style={{ ...s.btnPrimary, opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? "pointer" : "not-allowed" }}
            onClick={canGenerate ? handleGenerate : undefined}>
            🎨 Сгенерировать рендер
          </button>
        </div>
      </main>
    </div>
  );
}

/* ===== СТРАНИЦА 3Б: СЦЕНАРИЙ Б ===== */

function ScenarioBPage({ onResult, onBack, onLogout }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const canGenerate = file && selected;

  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setElapsed(0);
    const ct = COUNTERTOPS_B.find((c) => c.id === selected);
    const timer = setInterval(() => setElapsed((t) => t + 1), 1000);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("countertop_name", ct?.name || "");
      const resp = await fetch("/api/replace-countertop", { method: "POST", body: formData });
      const data = await resp.json();
      clearInterval(timer);
      if (resp.ok && data.success) {
        onResult({ scenario: "B", params: [ct?.name].filter(Boolean), beforeImage: preview, afterImage: data.image });
      } else {
        setError(data.message || data.detail || "Ошибка генерации");
        setGenerating(false);
      }
    } catch (e) {
      clearInterval(timer);
      setError("Сервер недоступен: " + e.message);
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div style={s.page}><BgPattern /><Header showBack={false} onLogout={onLogout} />
        <main style={{ ...s.main, maxWidth: 500 }}>
          <Spinner text="ИИ заменяет столешницу..." sub={`Обычно 15–40 секунд... (${elapsed} сек)`} />
        </main>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <BgPattern />
      <Header onBack={onBack} onLogout={onLogout} />
      <main style={{ ...s.main, maxWidth: 760, paddingBottom: 120 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={s.tag}>Сценарий Б</div>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: "#2a2420", margin: 0 }}>Замена столешницы</h1>
          <p style={{ fontSize: 14, color: "#7a6e64", marginTop: 6, fontWeight: 300 }}>Загрузите фото кухни и выберите новую столешницу из каталога</p>
        </div>

        <label style={s.sectionLabel}>1. Загрузите фото кухни</label>
        <div
          style={{ ...s.dropZone, minHeight: 180, borderColor: dragOver ? "#9a7b50" : "rgba(180,150,106,0.22)", background: dragOver ? "rgba(180,150,106,0.06)" : "rgba(255,255,255,0.4)" }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          {preview ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <img src={preview} alt="Фото" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
              <div style={{ fontSize: 13, color: "#5a5048", marginTop: 10, fontWeight: 500 }}>{file.name}</div>
              <div style={{ fontSize: 11, color: "#b0a89e", marginTop: 4 }}>Нажмите чтобы заменить</div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
              <div style={{ fontSize: 15, color: "#4a4038" }}>Перетащите фото кухни сюда</div>
              <div style={{ fontSize: 13, color: "#9a8e84" }}>или нажмите для выбора</div>
              <div style={{ fontSize: 11, color: "#b0a89e", marginTop: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>JPG, PNG, WEBP</div>
            </div>
          )}
        </div>

        <label style={{ ...s.sectionLabel, marginTop: 36 }}>2. Выберите столешницу</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {COUNTERTOPS_B.map((item) => {
            const active = selected === item.id;
            return (
              <div key={item.id} onClick={() => setSelected(item.id)}
                style={{
                  background: "rgba(255,255,255,0.6)", border: `2px solid ${active ? "#9a7b50" : "rgba(180,150,106,0.15)"}`,
                  borderRadius: 12, padding: 10, cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                  transform: active ? "translateY(-2px)" : "none", boxShadow: active ? "0 4px 20px rgba(120,100,70,0.15)" : "none",
                }}>
                <div style={{ width: "100%", height: 72, borderRadius: 8, background: item.pattern, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.9)", color: "#9a7b50", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>✓</div>}
                </div>
                <div style={{ fontSize: 12, color: "#4a4038", marginTop: 8, fontWeight: 500 }}>{item.name}</div>
              </div>
            );
          })}
        </div>

        {error && <div style={{ background: "rgba(200,50,50,0.07)", border: "1px solid rgba(200,50,50,0.2)", color: "#a03030", fontSize: 13, padding: "12px 16px", borderRadius: 10, marginTop: 16, whiteSpace: "pre-line" }}>{error}</div>}

        <div style={s.bottomBar}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {file && <span style={s.summaryTag}>📸 {file.name}</span>}
            {selected && <span style={s.summaryTag}>{COUNTERTOPS_B.find((c) => c.id === selected)?.name}</span>}
          </div>
          <button style={{ ...s.btnPrimary, opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? "pointer" : "not-allowed" }}
            onClick={canGenerate ? handleGenerate : undefined}>
            🔄 Заменить столешницу
          </button>
        </div>
      </main>
    </div>
  );
}

/* ===== СТРАНИЦА 4: РЕЗУЛЬТАТ ===== */

function ResultPage({ data, onBack, onLogout }) {
  const [viewMode, setViewMode] = useState("slider");
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => { e.preventDefault(); handleMove(e.touches ? e.touches[0].clientX : e.clientX); };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, [dragging]);

  const beforeImg = data?.beforeImage || PLACEHOLDER_BEFORE;
  const afterImg = data?.afterImage || PLACEHOLDER_AFTER;

  const handleDownload = () => {
    if (!afterImg || afterImg === PLACEHOLDER_AFTER) return;
    const link = document.createElement("a");
    link.href = afterImg;
    link.download = `furniture_ai_${data?.scenario || "result"}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={s.page}>
      <BgPattern />
      <Header onBack={onBack} onLogout={onLogout} />
      <main style={{ ...s.main, maxWidth: 820 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={s.tag}>Результат</div>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: "#2a2420", margin: 0 }}>Визуализация готова</h1>
        </div>

        {/* Переключатель */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "slider", label: "Слайдер" }, { key: "side", label: "Бок о бок" }, { key: "after", label: "Только результат" }].map((v) => (
            <button key={v.key} onClick={() => setViewMode(v.key)}
              style={{ ...s.chip, background: viewMode === v.key ? "#9a7b50" : "rgba(255,255,255,0.5)", color: viewMode === v.key ? "#fff" : "#5a5048", borderColor: viewMode === v.key ? "#9a7b50" : "rgba(180,150,106,0.2)" }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Слайдер */}
        {viewMode === "slider" && (
          <div ref={containerRef} style={{ position: "relative", width: "100%", borderRadius: 14, overflow: "hidden", cursor: "ew-resize", userSelect: "none", background: "#e0d8ce", aspectRatio: "8 / 5", border: "1px solid rgba(180,150,106,0.15)" }}
            onMouseDown={(e) => { setDragging(true); handleMove(e.clientX); }}
            onTouchStart={(e) => { setDragging(true); handleMove(e.touches[0].clientX); }}>
            <img src={afterImg} alt="После" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }} draggable={false} />
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${sliderPos}%`, overflow: "hidden", zIndex: 2 }}>
              <img src={beforeImg} alt="До" style={{ display: "block", width: containerRef.current?.offsetWidth || "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }} draggable={false} />
            </div>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sliderPos}%`, width: 3, background: "rgba(255,255,255,0.9)", transform: "translateX(-50%)", zIndex: 3, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#5a5048", fontWeight: 600, letterSpacing: 4 }}>⟨ ⟩</div>
            </div>
            <div style={{ position: "absolute", top: 12, left: 14, fontSize: 12, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,0.45)", padding: "3px 10px", borderRadius: 6, zIndex: 4, pointerEvents: "none" }}>До</div>
            <div style={{ position: "absolute", top: 12, right: 14, fontSize: 12, fontWeight: 600, color: "#fff", background: "rgba(154,123,80,0.7)", padding: "3px 10px", borderRadius: 6, zIndex: 4, pointerEvents: "none" }}>После</div>
          </div>
        )}

        {/* Бок о бок */}
        {viewMode === "side" && (
          <div style={{ display: "flex", gap: 16 }}>
            {[{ img: beforeImg, label: "Исходное" }, { img: afterImg, label: "Результат" }].map((s2) => (
              <div key={s2.label} style={{ flex: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(180,150,106,0.15)", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: 14, fontSize: 12, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,0.4)", padding: "3px 10px", borderRadius: 6, zIndex: 2 }}>{s2.label}</div>
                <img src={s2.img} alt={s2.label} style={{ width: "100%", display: "block", aspectRatio: "8 / 5", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* Только результат */}
        {viewMode === "after" && (
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(180,150,106,0.15)" }}>
            <img src={afterImg} alt="Результат" style={{ width: "100%", display: "block", aspectRatio: "8 / 5", objectFit: "cover" }} />
          </div>
        )}

        {/* Параметры */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, marginBottom: 24 }}>
          {(data?.params || []).map((t) => <span key={t} style={s.summaryTag}>{t}</span>)}
        </div>

        {/* Действия */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={s.btnPrimary} onClick={handleDownload}>📥 Скачать результат</button>
          <button style={s.btnSecondary} onClick={onBack}>🔄 Новая генерация</button>
        </div>
      </main>
    </div>
  );
}

/* ===== РОУТЕР ===== */

export default function App() {
  const [page, setPage] = useState("login"); // login | scenarios | scenarioA | scenarioB | result
  const [resultData, setResultData] = useState(null);

  const logout = () => { setPage("login"); setResultData(null); };

  switch (page) {
    case "login":
      return <LoginPage onLogin={() => setPage("scenarios")} />;
    case "scenarios":
      return <ScenarioPage onSelect={(key) => setPage(key === "A" ? "scenarioA" : "scenarioB")} onLogout={logout} />;
    case "scenarioA":
      return <ScenarioAPage onResult={(d) => { setResultData(d); setPage("result"); }} onBack={() => setPage("scenarios")} onLogout={logout} />;
    case "scenarioB":
      return <ScenarioBPage onResult={(d) => { setResultData(d); setPage("result"); }} onBack={() => setPage("scenarios")} onLogout={logout} />;
    case "result":
      return <ResultPage data={resultData} onBack={() => setPage("scenarios")} onLogout={logout} />;
    default:
      return <LoginPage onLogin={() => setPage("scenarios")} />;
  }
}

/* ===== ОБЩИЕ СТИЛИ ===== */

const s = {
  page: { minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", position: "relative", background: "#f5f1ec" },
  main: { margin: "0 auto", padding: "40px 40px 60px", position: "relative", zIndex: 1 },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", position: "relative", zIndex: 1, borderBottom: "1px solid rgba(180,150,106,0.12)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerLogo: { fontSize: 22, color: "#9a7b50" },
  headerTitle: { fontSize: 18, fontWeight: 400, color: "#2a2420", letterSpacing: "0.03em" },
  headerBtn: { padding: "8px 20px", fontSize: 13, color: "#7a6e64", background: "transparent", border: "1px solid rgba(180,150,106,0.2)", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" },

  card: { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(180,150,106,0.18)", borderRadius: 16, padding: "40px 36px", boxShadow: "0 4px 24px rgba(120,100,70,0.06)" },

  tag: { fontSize: 11, fontWeight: 600, color: "#9a7b50", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  divider: { width: 40, height: 1, background: "linear-gradient(90deg, #b8956a, transparent)", margin: "16px 0" },
  stepNum: { width: 22, height: 22, borderRadius: "50%", background: "rgba(180,150,106,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#9a7b50", flexShrink: 0 },

  label: { display: "block", fontSize: 12, fontWeight: 500, color: "#7a6e64", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" },
  sectionLabel: { display: "block", fontSize: 12, fontWeight: 500, color: "#7a6e64", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" },
  input: { width: "100%", padding: "12px 16px", fontSize: 15, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,150,106,0.22)", borderRadius: 10, color: "#2a2420", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", padding: "10px 14px", fontSize: 14, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(180,150,106,0.2)", borderRadius: 10, color: "#2a2420", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },

  chip: { padding: "7px 14px", fontSize: 13, border: "1px solid rgba(180,150,106,0.2)", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },

  code: { fontSize: 12, color: "#6a5e54", background: "rgba(180,150,106,0.1)", padding: "4px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" },

  dropZone: { border: "2px dashed rgba(180,150,106,0.22)", borderRadius: 14, padding: 24, cursor: "pointer", transition: "all 0.2s", minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" },

  bottomBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(245,241,236,0.95)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(180,150,106,0.15)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 },
  summaryTag: { fontSize: 12, color: "#6a5e54", background: "rgba(180,150,106,0.1)", padding: "5px 12px", borderRadius: 6 },

  btnPrimary: { padding: "14px 32px", fontSize: 15, fontWeight: 500, color: "#fff", background: "linear-gradient(135deg, #b8956a, #8a6840)", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" },
  btnSecondary: { padding: "13px 28px", fontSize: 14, fontWeight: 500, color: "#7a6e64", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,150,106,0.2)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" },

  spinner: { width: 40, height: 40, border: "3px solid rgba(180,150,106,0.2)", borderTop: "3px solid #9a7b50", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" },
};
