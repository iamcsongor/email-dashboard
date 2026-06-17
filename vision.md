# Blob — Product Vision

> **Source:** *Blob × Alex Intro Deck* (investor pack), 6 Jan 2026.
> This file is the north-star articulation of what Blob is and why it exists. Every build
> decision should trace back to something here. It changes rarely — when the strategy
> itself changes, not when the code does. Day-to-day build context lives in `instructions.md`.

**Tagline:** Max Out Productivity. Stop Burnout. Retain Your Talent.

---

## One-liner

Blob is a platform that spots dropping employee productivity, burnout, and attrition **long
before it happens**. It translates everyday working signals — email, Slack, Zoom, calendar,
and meeting data — into early warnings, and recommends the right frameworks and nudges to
re-engage people.

The core bet: the signals that predict disengagement already exist in how people work. You
don't need to ask — you need to read what's already there, before it becomes a resignation.

---

## The problem

Stagnating productivity, rising burnout, and quiet quitting leave leaders flying blind.

- **77%** of employees report experiencing burnout (Deloitte, 2023)
- **56%** are open to new jobs even without actively searching (LinkedIn, 2024)
- Replacing an employee costs **1.5–2× salary** (SHRM, 2024)

Hybrid work is the new norm, and the old tooling can't see into it:

- **Surveys are lagging indicators.** By the time someone speaks up, it's already too late.
  Response rates collapse as surveys get longer (1–3 questions ≈ 83%, 9–14 questions ≈ 56%).
- **84%** report being more productive in hybrid/remote setups — but management visibility drops.
- **HR dashboards are noisy, disconnected, and reactive.** It's rear-view-mirror driving.

---

## The solution — passive signals → early warning

Instead of asking people how they feel, Blob reads the ambient signals work already produces
and converts them into a per-person **Blob Score**, plus company-wide views.

**Individual View.** How a person engages across platforms, what is moving their Blob Score,
and policy-based nudges/recommendations to counter the worst-contributing factors.

**Company Overview.** A portfolio view (map + scatter) to spot at-risk people and teams, and
apply a re-engagement framework to "get them back into the fold."

### The Blob Score (~50 factors)

A composite health signal built from behavioural *changes* over time, for example:

- No longer the usual "chatty Susan" (volume drop)
- Camera off all of a sudden
- Increasingly negative tone
- Sitting on 300% more unreads
- Turning up later and later
- No longer engaging with company LinkedIn posts

> The current build implements this as the **"Blob Factor"** — a 0–100 composite of behavioural
> signals. See `instructions.md` → *Blob Factor scoring model* for the live taxonomy and weights.

---

## Ideal Customer Profile (ICP)

- **Type:** B2B SaaS
- **Size:** £1M–£500M revenue / 500–10,000 employees
- **Geography:** UK & EU first, then USA
- **Sectors:** tech, finance, consulting, professional services
- **Personas:** Chief People Officer / HR Director · Team Lead / Director · CxO / CFO

---

## Market

- **TAM £350B · SAM £18B · SOM £2B**
- SOM basis: ~43k accounts × ~£50k AOV ≈ **£2.2B** immediate market.

---

## Business model / pricing (annual)

| Tier | Price | Notes |
|---|---|---|
| Freemium | Free (restricted) | Self-onboard; see anonymised Blob Score states |
| One-off snapshot | £25 / head | PDF artifact only, no platform access, min 100 heads |
| License | £1,000 / annum | Platform access |
| Custom API | £5,000 / API | |
| Per-head | <100: £2.99 · 500+: £1.49 · 1k+: £0.99 · 10k+: lower* | Volume-tiered |

\* The 10k+ rate is obscured by an overlay in the deck; it follows the descending pattern. Confirm before quoting.

---

## Growth plan

Y1 founder-led growth → **Y2–Y5 chasing PMF** → **Y6+ pivot from point solution to platform play**.

| | Y1 | Y2 | Y3 | Y4 | Y5 | Y6 | Y7 |
|---|---|---|---|---|---|---|---|
| ARR | £0.3M | £1.2M | £3.6M | £10.8M | £21.6M | £43.2M | £86.4M |

Phase markers: **100 customers → Product-Market Fit → Platform Play.**

---

## Go-to-market

- **Motions:** PLG / Freemium · One-off snapshot analysis · SMB · Mid-Market (MMS) · Enterprise · Channel sales. (Sales-led core = SMB / MMS / Enterprise.)
- **Tactics:** multi-channel sequencing · founder's network · converting LOIs · early BIMs · HR-tech events · LinkedIn post sniping · PLG "loot box" mechanic.

---

## Traction

Pre-revenue, with clear market appetite. **Letters of Intent (LOIs)** secured from ICP personas
(HR, CxO). The deck cites **11 LOIs** in the body and **"9 ICP-aligned"** in the headline; the top
7 are highlighted (e.g. SVP RevOps, Sr. Director People Tech, CEO, People Director, CFO, CIO, CRO).
*(Numbers as stated in the deck — reconcile the 9 vs 11 before using externally.)*

---

## Roadmap milestones

- Past 3 months — **Market validation** ✓
- **Next 3 months — Funding & platform build** ← current focus
- 3–6 months — First live customers
- 6–12 months — All Blob features live
- 12+ months — Platform expansion

---

## Founder

**Csongor Doma** — Revenue Operations leader across B2B SaaS (OpenTable, Criteo, Fourth, Cambri).
Experienced the problem of dropping employee engagement first-hand. Strong in GTM strategy and tactics.

---

## Brand & design language

Dark UI; electric teal/green accents; purple-gradient "blob" mark; PlayStation-style geometric
glyphs (◇ ○ × □ △ +); bold condensed display type. Product UI should stay consistent with the deck.
