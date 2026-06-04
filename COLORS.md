# 🎨 Guía de color — Florín

> Documento para cambiar colores **sin leer todo el código**. Te dice exactamente
> qué archivo y qué línea tocar según lo que quieras cambiar.

---

## 1. Filosofía (la regla de oro)

La UI es **minimalista premium** (estilo Apple · Notion · Linear). El color tiene significado, no es decoración:

| Significado | Color | Cuándo |
|---|---|---|
| 🟢 Ingreso / positivo | verde `#16A34A` | SOLO ingresos y variaciones positivas |
| 🔴 Gasto / negativo / deuda | rojo `#DC2626` | SOLO gastos, deudas y variaciones negativas |
| ⚫ Todo lo demás | negro/gris neutro | balance, ahorro, suscripciones, cuentas, textos, fondos |

**Regla:** si dudas, va en **neutro**. El verde y el rojo se reservan para dinero que entra / sale.

---

## 2. La fuente central: `src/lib/colors.ts`

**El 90% de los colores salen de aquí.** Es el objeto `C`. Cambiar un valor aquí se propaga a toda la app (≈737 usos).

| Token | Valor | Uso |
|---|---|---|
| `C.bg` | `#F5F5F7` | fondo de la app |
| `C.card` | `#FFFFFF` | tarjetas |
| `C.text` | `#111827` | texto principal |
| `C.textDim` | `#6B7280` | texto secundario |
| `C.textMute` | `#9CA3AF` | texto terciario / placeholder |
| `C.border` | `rgba(17,24,39,0.08)` | bordes |
| `C.primary` / `C.accentDark` | `#111111` | botones de acción, marca |
| `C.navbar` | `#111827` | sidebar / barras oscuras |
| `C.success` / `C.pos` / `C.olive` | `#16A34A` | ingresos / positivo |
| `C.danger` / `C.neg` | `#DC2626` | gastos / negativo |
| `C.info` | `#2563EB` | ahorro / informativo |
| `C.subscription` / `C.purple` | `#7C3AED` | suscripciones |
| `C.goal` / `C.warn` | `#CA8A04` | objetivos / alertas |
| `*Soft` (ej. `C.successSoft`) | tono claro | fondos de badges suaves |

> **Para cambiar el color global de algo** (ej. "el verde de toda la app a otro verde"):
> edita el valor en `colors.ts` y listo.

---

## 3. ⚠️ Componentes con paleta PROPIA (la trampa)

Estos componentes **NO usan `C`** — tienen sus colores hardcodeados dentro. Si cambias `colors.ts` y algo sigue del color viejo, está aquí:

| Qué se ve | Archivo | Qué buscar dentro |
|---|---|---|
| **Cards Ingresos / Gastos / Ahorro / Suscripciones** | `src/components/dashboard/home/KpiCard.tsx` | objeto `THEMES` → `green`, `red`, `neutral` (cada uno con `light` y `dark`) |
| ¿Qué tema usa cada card? | `IngresosKpiCard.tsx` (green), `GastosKpiCard.tsx` (red), `AhorroKpiCard.tsx` (neutral), `SuscripcionesKpiCard.tsx` (neutral) | prop `theme="..."` |
| **Balance Total** (card grande) | `src/components/dashboard/home/HeroBalance.tsx` | bloque de constantes `const cardBg = D ? ... : ...` (líneas ~19-33). El lado después de `:` es modo claro |
| **Cuentas** (tarjetas de banco) | `src/components/dashboard/home/TarjetasCard.tsx` | bloque `const cardBg = D ? ... : ...` (líneas ~68-86); color del saldo en línea ~216; badges de banco en `BANK_BADGES` (arriba) |
| **Donut Categorías** (card + anillo) | `src/components/dashboard/home/CategoriesDonut.tsx` | `LIGHT_TOKENS` / `DARK_TOKENS` (fondo card); `OTROS_COLOR` (gris del segmento "Otros") |
| **Colores de los segmentos del donut** | `src/shared/hooks/use-dashboard-categories.ts` | `EGRESO_SCALE` (rojos) y `INGRESO_SCALE` (verdes) |
| **Otras secciones** (Suscripciones/Deudas/Préstamos) | `src/components/dashboard/home/DebtsCard.tsx` | objeto `LIGHT` (fondo, montos, tabs) |
| **Sincronizar Notion** (card + botón) | `src/components/dashboard/home/NotionSync.tsx` | fondo en el `<div>` raíz; botón Sincronizar usa `C.primary` |
| **Headers y tabs de las cards** (label, pills "Egreso/Ingreso", "Comparativa", botones ▢) | `src/components/dashboard/home/CardHeaderSection.tsx` | objeto `LIGHT` + `btnStyle` (botón activo) |
| **Fondo card de Análisis** | `src/components/dashboard/home/ChartCard.tsx` | `CARD_BG.light` |
| **Gráfica de Análisis** (líneas ingresos/gastos) | `src/components/dashboard/home/ChartVisuals.tsx` | `M3_LIGHT` / `M3_DARK` (área), y las otras variantes `StackedBars`, `PillBars`, `MinimalBars`, `DebtLine` |
| **Estilos globales** (fondo body, hovers, scrollbar, glow) | `src/app/globals.css` | todo el archivo (usa `rgba(17,24,39,...)` neutro) |
| **Accent configurable** (fijo en negro) | `src/components/tweaks/index.tsx` | `DEFAULTS.accent = '#111111'` |

---

## 4. "Quiero cambiar X" → ve aquí

| Quiero… | Archivo · qué tocar |
|---|---|
| El **fondo** de la app | `colors.ts` → `C.bg` **y** `globals.css` → `html, body { background }` |
| El **verde de ingresos** | `colors.ts` → `C.success` (+ `ChartVisuals.tsx` `M3_LIGHT.incLine` para la gráfica, + `KpiCard.tsx` `THEMES.green` para la card) |
| El **rojo de gastos** | `colors.ts` → `C.danger` (+ `M3_LIGHT.expLine`, + `THEMES.red`) |
| Que **Ahorro/Suscripciones** dejen de ser neutros | sus archivos `*KpiCard.tsx` → cambia `theme="neutral"` a `"green"`/`"red"` |
| Los **tonos del donut** | `use-dashboard-categories.ts` → `EGRESO_SCALE` / `INGRESO_SCALE` |
| El **negro de botones/marca** | `colors.ts` → `C.primary` / `C.accentDark` |
| El **avatar** del header | `TopBar.tsx` → buscar `linear-gradient(140deg` |
| Los **badges de banco** (colores de logo) | `TarjetasCard.tsx` → `BANK_BADGES` |

---

## 5. Buscar cualquier color suelto

Si ves un color que no sale de `C` y no está en la tabla de arriba, búscalo así (PowerShell, dentro de `finanzas-1.0-front`):

```powershell
# Buscar un hex concreto en todo el front
Select-String -Path src\**\*.tsx -Pattern '#16a34a' -List

# Buscar TODOS los hex hardcodeados (los que no pasan por C)
Select-String -Path src\**\*.tsx -Pattern '#[0-9a-fA-F]{6}'
```

> Quedan ~300 hex hardcodeados en pantallas secundarias (modales, Notion, Deudas, etc.)
> y en **todo el modo oscuro** (que mantiene su propia paleta). Si quieres estandarizar
> esas también, búscalas con el comando de arriba.

---

## 6. Prompt para pedirle el cambio a Claude

Copia esto y rellena lo que quieras cambiar:

```
Lee COLORS.md (está en la raíz de finanzas-1.0-front). Respeta la filosofía:
verde solo ingresos, rojo solo gastos, el resto neutro.

Quiero cambiar: <DESCRIBE: ej. "el verde de ingresos a un verde más azulado #15B98A">

Aplica el cambio en la fuente central (colors.ts) y en los componentes con paleta
propia que correspondan según la tabla de la sección 3 del COLORS.md (KpiCard THEMES,
HeroBalance, TarjetasCard, CategoriesDonut, ChartVisuals, use-dashboard-categories).
No toques el modo oscuro salvo que lo pida. Al final corre `npx tsc --noEmit`.
```
