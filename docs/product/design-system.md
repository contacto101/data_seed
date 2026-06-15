# Design System — DataSeed

> **MASTER.md** — Fuente de verdad para toda la identidad visual de DataSeed.
> Lee este archivo antes de crear o modificar cualquier interfaz.
> Si una página tiene `design-system/pages/<pagina>.md`, sus reglas sobreescriben este Master.

---

## 1. Identidad de Marca

### Concepto
DataSeed transforma datos dispersos en terreno fértil. Los datos son semillas: ordenados, cultivados y analizados, producen decisiones accionables.

### Posicionamiento
- **No es** una startup de IA genérica
- **No es** una consultora tradicional de datos
- **Es** una plataforma de data engineering + analytics que opera con precisión agrícola: siembra, cultiva, cosecha insights

### Tono visual
- Profesional pero no corporativo frío
- Preciso pero no intimidante
- Tecnológico pero con calidez orgánica
- Dark mode como primario, light mode como alternativo

---

## 2. Paleta de Colores

### Primarios (Dark Mode — default)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#050e06` | Fondo principal |
| `--bg2` | `#071209` | Fondo secundario (panels) |
| `--g` | `#00ff41` | Verde primario (acentos, CTAs, highlights) |
| `--g2` | `#00cc33` | Verde secundario (textos accent, tags) |
| `--gdim` | `rgba(0,255,65,0.08)` | Verde tenue (backgrounds sutiles) |
| `--text` | `#dff5e3` | Texto principal |
| `--sub` | `#7aaa84` | Texto secundario |
| `--muted` | `#3d6645` | Texto terciario / deshabilitado |

### Card / Surface (Dark Mode)

| Token | Hex | Uso |
|-------|-----|-----|
| `--card` | `rgba(0,255,65,0.035)` | Fondo de cards |
| `--card-b` | `rgba(0,255,65,0.12)` | Borde de cards |
| `--card-h` | `rgba(0,255,65,0.07)` | Hover de cards |

### Light Mode

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#f4fbf5` | Fondo principal |
| `--bg2` | `#eaf6ed` | Fondo secundario |
| `--g` | `#008f2c` | Verde primario CTAs |
| `--g2` | `#007a25` | Verde secundario |
| `--gdim` | `rgba(0,143,44,0.10)` | Verde tenue backgrounds |
| `--text` | `#08240d` | Texto principal |
| `--sub` | `#315c39` | Texto secundario |
| `--muted` | `#66856c` | Texto terciario |

### Semánticos (ambos modos)

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `--error` | `#ff6b6b` | `#dc2626` | Errores |
| `--warn` | `#e5a100` | `#d97706` | Advertencias |
| `--success` | `#00ff41` | `#008f2c` | Éxito |
| `--info` | `#3b82f6` | `#2563eb` | Información |

### Reglas de color
- **Nunca** usar gris neutro puro. Siempre tintar hacia verde o navy.
- Contrast ratio mínimo: **4.5:1** para body text, **3:1** para large text.
- Placeholder text debe tener contraste legible (no muted-gray por defecto).
- No gradientes decorativos como identidad. Solo sutiles en CTAs principales.
- Verde neon (`#00ff41`) solo en dark mode. En light mode usar `#008f2c`.

---

## 3. Tipografías

### Fuente principal: Syne
- **Uso**: h1, h2, h3, display headings, nombres de producto, elementos de marca
- **Weights**: 400 (regular), 600 (semibold), 700 (bold), 800 (extrabold)
- **Estilo**: Geométrica, Technical, Impactante
- **Letter-spacing**: `-0.01em` a `-0.045em` en headings

### Fuente secundaria: Inter
- **Uso**: body text, labels, botones, inputs, navegación, UI copy
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Estilo**: Humanista, Legible, Sans-serif

### Fuente terciaria (dashboards/mono): JetBrains Mono
- **Uso**: datos tabulares, código, métricas numéricas en dashboards
- **Weight**: 400, 700

### Google Fonts import (usar en todos los HTML)
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Escala tipográfica

| Elemento | Font | Size | Weight | Line-height |
|----------|------|------|--------|-------------|
| h1 hero | Syne | clamp(3.2rem, 6.5vw, 6rem) | 800 | 1.0 |
| h1 sección | Syne | clamp(2.4rem, 5vw, 4.5rem) | 800 | 1.02 |
| h2 | Syne | clamp(2rem, 3.5vw, 3rem) | 800 | 1.06 |
| h3 | Syne | 1.12-1.55rem | 700 | 1.1 |
| h4 | Syne | 1rem | 700 | 1.2 |
| Body | Inter | 1rem | 400 | 1.8 |
| Body small | Inter | 0.82rem | 400 | 1.68 |
| Caption | Inter | 0.62-0.72rem | 600-700 | 1.5 |
| Nav link | Inter | 0.84-0.85rem | 400-500 | 1.5 |
| Button | Inter/Syne | 0.78-0.88rem | 600-800 | 1.2 |
| KPI value | Syne | 2.2-2.6rem | 800 | 1.1 |
| KPI label | Inter | 0.56-0.62rem | 700 | 1.4 |

### Reglas de tipografía
- **Nunca** body text menor a 14px / 0.82rem.
- Line-length máximo: 65-75ch para body, 35-60ch en mobile.
- `text-wrap: balance` en h1-h3.
- No pairing con DM Sans ni otras fuentes fuera del sistema.

---

## 4. Espaciado y Grid

### Escala base (múltiplos de 8px / 0.5rem)

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-4` | 4px | gaps mínimos, padding iconos |
| `--space-8` | 8px | gaps entre elementos inline |
| `--space-12` | 12px | padding interno small |
| `--space-16` | 16px / 1rem | padding interno cards, gap grid |
| `--space-24` | 24px / 1.5rem | gap entre secciones de cards |
| `--space-32` | 32px / 2rem | padding sección, gap vertical |
| `--space-48` | 48px / 3rem | separación entre secciones |
| `--space-64` | 64px / 4rem | padding top/bottom secciones |
| `--space-96` | 96px / 6rem | gaps grandes verticales |

### Border-radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--r-sm` | 8px | inputs, tags, chips |
| `--r-md` | 12px | cards small, buttons |
| `--r-lg` | 16px | cards, modals |
| `--r-xl` | 20px | cards destacadas, containers |
| `--r-2xl` | 32px | hero containers, pricing |
| `--r-pill` | 999px | botones pill, badges |

### Sombras (sutiles, no neon)

Dark mode:
```css
--shadow-1: 0 1px 3px rgba(0,0,0,0.3);
--shadow-2: 0 4px 12px rgba(0,0,0,0.35);
--shadow-3: 0 16px 48px rgba(0,255,65,0.07);
--shadow-cta: 0 0 32px rgba(0,255,65,0.28);
```

Light mode:
```css
--shadow-1: 0 1px 3px rgba(8,36,13,0.08);
--shadow-2: 0 4px 12px rgba(8,36,13,0.1);
--shadow-3: 0 10px 25px rgba(8,36,13,0.12);
```

### Grid breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile | < 768px |
| Tablet | 768px — 1024px |
| Desktop | 1024px — 1440px |
| Wide | > 1440px |

- Max-width de contenido: **1160px**
- Grid de 2 columnas en desktop → 1 columna en mobile
- Grid de 3 columnas en desktop → 2 en tablet → 1 en mobile
- Grid de 4 columnas en desktop → 2 en tablet → 1 en mobile

---

## 5. Componentes

### Botones

**Primario (CTA):**
```css
.btn-primary {
  background: var(--g);
  color: #030a03;
  padding: 0.88rem 2rem;
  border-radius: 100px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
  box-shadow: var(--shadow-cta);
}
```

**Secundario (outline):**
```css
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.14);
  padding: 0.88rem 2rem;
  border-radius: 100px;
  font-weight: 500;
}
```

**Ghost:**
```css
.btn-ghost {
  color: var(--muted);
  border: 1px solid rgba(0,255,65,0.1);
  padding: 0.6rem 1.4rem;
  border-radius: 100px;
}
```

### Cards
- Fondo: `var(--card)`, borde: `var(--card-b)`, radius: `var(--r-lg)`
- Hover: `var(--card-h)` + translateY(-3px) + sombox verde sutil
- Sin cards anidadas. Sin cards con solo icon + heading + paragraph repetitivos.
- Padding interno: 1.5rem — 2.4rem según jerarquía

### Tags / Badges
```css
.tag {
  display: inline-block;
  background: rgba(0,255,65,0.06);
  border: 1px solid rgba(0,255,65,0.14);
  border-radius: 100px;
  padding: 0.22rem 0.8rem;
  font-size: 0.64rem;
  color: var(--g2);
  font-weight: 500;
}
```

### Formularios
- Labels siempre visibles (no placeholder-only)
- Border: `rgba(255,255,255,0.08)` → focus: `rgba(0,255,65,0.28)`
- Focus ring: `box-shadow: 0 0 0 3px rgba(0,255,65,0.07)`
- Error: borde rojo + mensaje debajo del field
- Input padding: 1rem

### Navegación
- Fondo: `rgba(5,14,6,0.85)` + backdrop-blur(24px)
- Links: `var(--sub)` → hover: `var(--g)`
- CTA nav: botón verde pill
- Logo: Syne extrabold, 1.15rem

---

## 6. Iconografía

**Regla: NO usar emojis como iconos estructurales.**

Usar:
- SVG inline para iconos de navegación y UI
- Lucide / Heroicons / react-native-vector-icons para apps
- Chips con iconos tipográficos (■ ◆ ● ▲) solo en dashboards

Iconos en feature cards: usar caracteres geométricos minimalistas o SVG.

---

## 7. Motion y Animación

| Propiedad | Regla |
|-----------|-------|
| Duración micro | 150-300ms |
| Duración medio | 300-400ms |
| Entrada | ease-out-quart |
| Salida | ease-in-quart |
| Hover cards | translateY(-3px) + shadow sutil, 300ms |
| Stagger list items | 50ms entre cada entrada |
| Page load | Fade up secuencial, delay 0.1s-0.7s |

```css
@media (prefers-reduce-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Dashboard / Console (aplica a dashboard.html, console)

### Layout
- Sidebar: 280px (desktop), colapsable
- Header: 68px
- Content: fluid con max-width

### Métricas (KPIs)
- Valor: Syne 800, size 2.2-2.6rem, color `--g`
- Label: Inter 700, size 0.56-0.62rem, uppercase, letter-spacing 0.1em, color `--muted`
- Trend: verde para arriba, rojo para abajo, size 0.65rem

### Charts
- Líneas: verde primario (`--g`), Fill: `rgba(0,255,65,0.06)`
- Grid lines: `rgba(0,255,65,0.06)`
- Tooltip: `--bg2` background, `--text` color

### Tablas mini
- Header: uppercase, letter-spacing 0.1em, size 0.6rem
- Rows: border-bottom `rgba(0,255,65,0.06)`
- Values: Syne 700, verde

---

## 9. Productos

### Formato de card de producto
1. Badge (LIVE / SOON)
2. Product name (Syne 800, 1.55rem)
3. Tagline (verde, 0.82rem)
4. Descripción (0.82rem, --sub)
5. Features (bullet verde, lista vertical)
6. Stack tags (chips sutiles)
7. CTA

---

## 10. Anti-Patterns (prohibido)

| Patrón | Por qué evitarlo |
|--------|-----------------|
| Emojis como iconos estructurales | No escalan, no son accesibles, no son on-brand |
| Gradient text | Decorativo, no accesible |
| Glassmorphism decorativo | Distrae, no aporta jerarquía |
| Card grids idénticas infinitas | AI slop, no comunica valor |
| Cards anidadas | Rompe jerarquía visual |
| Hero metrics template (big number + small label + gradient) | SaaS cliché |
| Eyebrow uppercase tracked en cada sección | Reflexo de IA |
| Numeración 01/02/03 en cada sección | No es secuencia real |
| Texto overflowing containers | Falta de testing responsive |
| Color gris neutro sin tintar | No es on-brand |
| Mezclar Syne + Inter + DM Sans | Sistema de tres fuentes rompe consistencia |
| Sombras neon excesivas | Se ve barato, no profesional |
| Animaciones que bloquean contenido | Accesibilidad |

---

## 11. Checklist pre-entrega

- [ ] Contraste ≥ 4.5:1 en body text
- [ ] Contraste ≥ 3:1 en large text
- [ ] Sin emojis como iconos
- [ ] Tipografías solo Syne + Inter (+ JetBrains Mono en dashboards)
- [ ] Colores solo del sistema (no hex sueltos)
- [ ] Responsive testeado en 375px, 768px, 1024px, 1440px
- [ ] Focus states visibles
- [ ] prefers-reduced-motion respetado
- [ ] Labels en todos los inputs
- [ ] Sin cards anidadas
- [ ] Sin gradient text
- [ ] Sin eyebrow en cada sección
- [ ] Sin hero metrics template
- [ ] Sin glassmorphism decorativo
- [ ] Sin overflow horizontal
