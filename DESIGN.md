# 🛡️ Project Axiom — Design System & Visual Specification

> **Platform:** Cognitive Domain Threat Intelligence & Astroturfing Detection System  
> **Target End-User:** Satuan Tugas Operasi Siber, PUSSIBERAD (Pusat Siber TNI Angkatan Darat)  
> **Design Philosophy:** Focused Tactical Intelligence (High-Clarity, Low Cognitive Load, Zero-Slop, Clean Hierarchy)

---

## 1. Brand Identity & Anti-Overwhelm Philosophy
Axiom is an operational cyber-defense intelligence platform engineered for clarity and rapid decision-making. It avoids the classic "military cockpit syndrome" (putting 20 confusing widgets on one screen) in favor of a calm, focused, Linear/Palantir-inspired workflow:
- **One Primary Task Per View:** Every screen must have **one** clear focal point (e.g., investigating a network graph OR reviewing a campaign table—never both fighting for 50/50 attention).
- **Low Cognitive Load:** Minimize simultaneous visual stimuli. If an element does not directly help the analyst identify a bot, buzzer, or narrative wave right now, hide it until requested.
- **Anti-Slop Posture:**
  - NO purple/magenta gradients, glowing orbs, or heavy drop shadows.
  - NO pill-shaped (`rounded-full`) buttons or floating 3D cards.
  - NO fake decorative widgets (fake radar sweeps, meaningless mini-sparklines, or redundant gauges).

---

## 2. Screen Complexity Caps (Strict Anti-Clutter Guardrails)
*To prevent a confusing and overwhelming UI, the AI agent MUST strictly obey these numerical limits on every page:*

1. **The "3-Group" Viewport Rule:** A single screen may contain at most **3 distinct visual component groups** visible at once (e.g., `1. Top Summary Strip` + `2. Main Visualization/Table` + `3. Slide-over Context Panel`).
2. **KPI / Summary Card Cap:** Maximum **3 to 4 KPI metric cards** in a single top row. Each card may contain only **2 data points** (the main number + 1 simple context label/trend). No mini-charts inside KPI cards.
3. **Chart Limit Per View:** Never render more than **2 charts/visualizations** simultaneously on the same screen. Prefer switching views via clean tabs (`[ Network Graph | Timeline | Raw Logs ]`) rather than stacking charts vertically.
4. **Navigation Simplicity:**
   - **Single Navigation Pattern:** Use **1 slim left sidebar** (4–5 top-level items max). NEVER combine a complex left sidebar with a secondary sub-sidebar and multiple rows of top horizontal tabs.
   - **Top Filter Bar:** Maximum **1 search input** + **2 primary filter dropdowns** visible by default. Group any additional advanced filters inside a single `[ + Filter ]` popover button.
5. **Table Column Cap:** Data tables must display a maximum of **5 to 6 columns** (e.g., *Target/Account, Classification Badge, Threat Score, Narrative Cluster, Last Active*). All secondary forensic data must be hidden inside the row-click **Inspector Drawer**.
6. **Minimum Whitespace Ratio:** At least **25% of the viewport** must remain open background/surface breathing room. Never pack cards edge-to-edge without padding.

---

## 3. Color Palette (Calm & Semantic)

### Surface & Structural Hierarchy
| Role | Hex Code | Tailwind Equivalent | Purpose & Application |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#090D16` | `slate-950` (Custom) | Deep matte background. Provides calm visual rest between panels. |
| **Primary Surface** | `#0F172A` | `slate-900` | Clean container surface for main workspace panels and cards. |
| **Elevated Surface** | `#1E293B` | `slate-800` | Hover states, active row highlights, dropdown menus, modals. |
| **Subtle Surface** | `#131C2E` | Custom | Table header backgrounds and secondary nested blocks. |
| **Primary Border** | `#1E293B` | `slate-800` | Crisp `1px solid` structural separation between main layout zones. |
| **Subtle Divider** | `#1E293B` (50% opacity) | `slate-800/50` | Clean internal table row dividers (replaces heavy grid boxes). |

### Accents & Typography
| Role | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| **Primary Accent** | `#38BDF8` | Clean Tactical Cyan. Active tabs, focus rings, primary CTA buttons (max 1 primary CTA per screen). |
| **Secondary Accent** | `#3B82F6` | Clinical Blue. Secondary interactive links and active graph connections. |
| **Text Primary** | `#F8FAFC` | Main headings, primary metrics, target identifiers. |
| **Text Secondary** | `#94A3B8` | Table body text, descriptions, axis labels. |
| **Text Muted** | `#64748B` | Timestamps, disabled states, column headers, subtle captions. |

### Semantic Threat Badges (Strictly Reserved for Attribution)
*Never use semantic colors for general UI decoration. Keep badge backgrounds subtle (10% opacity) with crisp 1px borders (30% opacity) and bright text:*
- **HUMAN / AUTHENTIC:** Text `#34D399` | Bg `#10B981/10` | Border `#10B981/30` (Emerald)
- **BUZZER / COORDINATED:** Text `#FBBF24` | Bg `#F59E0B/10` | Border `#F59E0B/30` (Amber)
- **BOT / AUTOMATED:** Text `#F87171` | Bg `#EF4444/10` | Border `#EF4444/30` (Rose)
- **CRITICAL THREAT:** Solid Bg `#DC2626` | Text `#FFFFFF` (Reserved strictly for active PsyOps alerts)

---

## 4. Typography & Numeric Discipline

- **UI Sans:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - **Page Title:** `18px` (`text-lg`), Semi-Bold (`600`), tracking `-0.02em`.
  - **Section / Card Header:** `14px` (`text-sm`), Medium (`500`), `#F8FAFC`.
  - **Column Headers / Labels:** `11px` (`text-xs`), Semi-Bold (`600`), Uppercase, tracking `0.05em`, `#64748B`.
  - **Body / Table Data:** `13px`, Regular (`400`), line-height `1.5`.
- **Forensic Monospace:** `"JetBrains Mono", "Fira Code", monospace`
  - Used strictly for `@usernames`, Account IDs, IP Addresses, SHA-256 Hashes, URLs, and Timestamps (`12px`).
- **Tabular Numerals (Mandatory):**
  - Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to all metrics, counters, percentages, and table columns so numbers align vertically.

---

## 5. Layout Architecture & Progressive Disclosure

- **Standard App Shell (3-Zone Max):**
  1. **Left Navigation Sidebar (`220px` fixed or collapsible icon rail):** Clean navigation with maximum 5 core modules (e.g., *Overview, Narrative Monitor, Network Graph, Target Directory, Case Reports*).
  2. **Main Workspace Canvas (Fluid):** Holds the primary active view with generous padding (`p-6` page container, `gap-4` between cards, `p-4` inside cards).
  3. **Contextual Inspector Drawer (`380px` right slide-over, hidden by default):** Opens *only* when an analyst clicks a specific account, node, or alert to inspect deep forensic metadata, raw JSON, or posting history.
- **Visual De-cluttering Rules:**
  - **No Box-in-Box Syndrome:** Never nest more than 2 levels of bordered containers. Use whitespace to separate ideas instead of drawing more boxes.
  - **Clean Tables:** No vertical borders between columns. Use horizontal row dividers (`border-b border-slate-800/60`) and comfortable cell padding (`py-3 px-4`).
  - **One Action Priority:** Every screen or modal may only have **one** solid Primary Action Button (`#38BDF8` fill with dark text). All secondary actions (*Export, Refresh, Filter*) must use quiet ghost/outline buttons (`border-slate-800 bg-slate-900/50 text-slate-300`).

---

## 6. Components, Data Visualization & Motion

- **Border Radius:** Cards & Panels: `6px` (`rounded-md`). Buttons, Inputs & Badges: `4px` (`rounded`).
- **Elevation:** Zero drop shadows on dashboard cards. Rely on surface contrast (`#090D16` vs `#0F172A`) and `1px` borders (`#1E293B`).
- **Network Graph (SNA) & Charts:**
  - **Charts:** Clean minimalist gridlines (`#1E293B` dashed), maximum 2–3 data series per chart to prevent "spaghetti graphs".
  - **Network Nodes:** Colored by *Semantic Threat Badges*. Unselected edges remain muted (`#334155` at `25%` opacity) so the graph never looks like a messy hairball; highlight active connections in `#38BDF8` only when a node is clicked.
- **Micro-Interactions:** Fast and grounded (`120ms ease-out`). No bounce, spring, or card-scaling animations.