# Build log

What was built, how, and what did not work. Newest at the bottom.

---

## 2026-11-10 — Project set up

- Created the repo `hyllykartta`. GitHub: https://github.com/petudesign/hyllykartta
- Documentation structure in `docs/`.

---

## 2026-11-10 — Simulation model, first version

**What:** `sim/model.js`, a day-by-day model of one dairy shelf (40 sections, one product each). Every morning sections are restocked to capacity with a new batch. Customers buy in two half-days; some reach to the back for the freshest batch, some prefer a discount-labelled unit, and labelled units attract extra bargain demand. At the end of the day anything past its date is waste. Staff get a fixed number of minutes per day, split over two shifts, and spend them according to the strategy.

**How:** Plain JavaScript ES module, no dependencies, so the same code runs in Node (`sim/run.mjs`) and in the browser. Seeded random numbers (mulberry32) so results can be reproduced. Strategies are compared on the same seeds (paired comparison), so differences come from the strategy and not from luck in demand. 4 weeks measured after 2 weeks of warm-up; 200 runs per cell.

**Iteration 1 → 2 (what did not work):** With uniform demand of 2–8 units/day per section, the shelf produced almost no waste even with zero checks (≈0.4 % of units). Every strategy looked perfect after 15 minutes. Real shelves have many slow sellers that still fill a whole facing. Changed demand to log-uniform 0.5–10 units/day and added a minimum facing of 6 units. Waste with no checks is now ≈2.2 % of units (placeholder; to be checked against research B7 and D11).

**Iteration 2 → 3 (unexpected result):** Added purchase cost (70 % of price) and gross margin. Both map strategies find almost every near-expiry unit, but labelling all of them at −30 % *lowers* margin compared with today's route. Many labelled units would have sold at full price anyway; the discount shifts customers to them. Holds when the share of customers who choose a labelled unit is changed from 0.2 to 0.8.

**Iteration 3:** Added a fourth strategy, `dataSmart`: same 2D data plus the section's sales rate (which checkout scanning of 2D codes would give). It labels only the units that are not expected to sell before their date.

### Results at default parameters (all placeholders), 20 min/day

Medians over 200 runs, per shelf per week.

| Strategy | Missed units | Waste € | Markdown € | Margin € | Staff min/day used | Visits with nothing to do |
|---|---|---|---|---|---|---|
| Route (today) | 4.8 | 24.0 | 24.8 | 498 | 19.4 | 87 % |
| Manual map (2025) | 0.5 | 17.3 | 43.4 | 487 | 16.3 | 66 % |
| Map + 2D data | 0.0 | 16.5 | 51.4 | 487 | 5.9 | 4 % |
| Map + 2D + sales | 3.0 | 23.5 | 9.6 | 512 | 2.6 | — |

Paired margin difference, `dataSmart` − route: +3.4 € at 5 min/day, +5.3 € at 10, +11.7 € at 20 (p10–p90 at 20 min: −4.4 … +30.3).

### What this says so far

1. **The clearest effect is time.** Prioritising from data needs a fraction of the staff minutes for the same or better catch rate. Almost every route visit finds nothing to do.
2. **Prioritising and handover already help without 2D codes.** The 2025 manual map cuts missed units from 4.8 to 0.5 a week. 2D codes mostly save the time spent walking and writing records down.
3. **Finding everything is the wrong goal.** Labelling every near-expiry unit costs more in markdowns than it saves in waste. The useful thing 2D data adds is knowing *which* units will not sell in time.
4. **Effects on money are small and uncertain** per shelf (a few euros a week, wide spread). Do not extrapolate to a store or chain until the parameters have sources.

Full output: `node sim/run.mjs 200`.

---

## 2026-11-10 — Research report in, model updated

- Research agent's report copied to `docs/research/report.md` (original in the portfolio repo, `docs/research/s-havikki-gs1-2d-tutkimus.md`).
- Parameters now carry a status: `assumption`, `sourced`, `verified`, `model`.
- `backPick` 0.25 → **0.45** (`sourced`, D12: dairy 45 % in a field count; not yet verified).
- **Bug found by the change:** `dataSmart` estimated sales as if everyone took the front unit, so with 45 % back-picking it under-labelled and waste went *up* (40 €/wk vs route 36). Fixed: only the front-picking share counts toward selling older batches. Waste now 28 €/wk.
- Research found **no published data** for the two most important parameters: time on the shelf for dairy (D11) and time per date check (D14). These must come from interviews.
- The model's "labelling everything costs margin" result matches a known effect in the literature, the waste–markdown tradeoff (Knox et al., D13). The case should present it as confirming a known effect, not as a discovery.

### Results after the update, 20 min/day (200 runs, medians per shelf per week)

| Strategy | Margin vs route € (paired) | Markdown € | Waste € | Missed units | Staff min/day |
|---|---|---|---|---|---|
| Route | 0 | 34.0 | 35.8 | 7.8 | 19.4 |
| Manual map | −9.5 | 56.0 | 23.5 | 1.0 | 17.1 |
| Map + 2D data | −13.3 | 66.4 | 19.8 | 0.0 | 7.6 |
| Map + 2D + sales | +15.0 (p10–p90 −3.9 … +32.3) | 23.1 | 28.3 | 2.8 | 4.7 |

---

## 2026-11-10 — Interactive page

- `index.html` + `app.js` + `style.css`. No framework, no build step.
- Line chart over staff minutes (0–45 min/day), metric switch (margin, waste, missed units, staff time), 2D coverage slider (0–100 %), a results table at the chosen minutes, and the full assumption table with statuses.
- Colours: four categorical slots validated for colour-vision deficiency in light and dark mode. Lines are also labelled directly, and the table carries every value, so colour is never the only cue.
- **Margin is shown as a paired difference to the route.** The first version showed absolute margin, whose 10–90 % range (≈395–566 €) made all strategies look the same. That spread comes from shelves differing between runs, not from the strategies. Same seeds for every strategy → the difference isolates the strategy.
- **What did not work:** running the simulation in the browser (Web Worker) took ~13 s on load and ~18 s per slider change. Replaced with `sim/precompute.mjs`, which writes `sim/results.json` (5 coverage levels × 10 minute levels × 4 strategies × 200 runs, ~25 s in Node). The page now loads instantly, also on phones. Downside: change the model → re-run precompute.
- Checked: desktop and 375 px mobile, light and dark, no horizontal scroll, no console errors.

---

## 2026-11-10 — Model corrected with Petteri's shop-floor experience

Petteri challenged the result that "Map + 2D data" lowers margin: in a normally run store, fast sellers almost never get within two days of their date ([field-notes.md](field-notes.md), O1).

**Diagnosis (M1):** He was right. In the model, fast sellers (≥ 3 units/day) had near-expiry units on 15–19 % of days and received ~48 % of all discount labels. The full-labelling strategy was mostly discounting products that would have sold anyway. Cause: the shelf held 3 days of demand while shelf life on arrival could be as short as 5 days; with 45 % of customers reaching to the back, old front units lingered.

**Calibration:** grid over shelf stock (1.5 / 2 / 3 days of demand) × shelf life on arrival (5–14 / 7–14 / 7–21 days). Chosen: **2 days of stock, 7–14 days of shelf life**. Fast sellers now near their date on ~2 % of days and get ~6–10 % of labels. Waste rate with today's route is ~1.1 %, close to Luke's figure for all retail (0.92 %, report B7). Status of these parameters: `experience`.

**Added from the field notes:** short-dated deliveries (M2), new stock placed in front of old (M4) and facing that fixes it (M3, partly), stock that vanishes without a record (M5), staff time priced at 20 €/h (M6, assumption), and a "labelled but still wasted" metric (M7).

**Stock drift test (M5):** raising unrecorded losses from 0.15 %/day up to 3 %/day raised the data map's share of wasted visits from 14 % to 54 %, but it still missed no near-expiry units. Ghost stock costs time, not food. This supports the design rule that the map prompts a check instead of asserting stock. **Limit:** the model only has ghosts that the system thinks exist. It does not have units on the shelf that the system does not know about (e.g. never scanned).

### Results after the correction, 20 min/day (200 runs, medians per shelf per week, paired with today's route)

| Strategy | Margin vs route € | Margin after staff time vs route € | Waste € | Labelled, still wasted | Missed units | Staff min/day |
|---|---|---|---|---|---|---|
| Route | 0 | 0 | 21.0 | 5.8 | 4.5 | 19.4 |
| Manual map | +0.2 (−18 … +15) | +13.8 (−5 … +29) | 14.8 | 6.8 | 0.8 | 13.6 |
| Map + 2D data | −3.3 (−25 … +14) | +32.2 (+12 … +49) | 13.5 | 6.8 | 0.0 | 4.2 |
| Map + 2D + sales | +3.5 (−13 … +21) | +41.3 (+24 … +60) | 16.5 | 8.0 | 0.3 | 3.3 |

### What changed in the story

1. **The margin penalty of Map + 2D data was mostly a calibration error.** Before staff time is counted, margin is now about the same for every strategy; the differences are inside the noise.
2. **The value is staff time.** Priced at 20 €/h, the data strategies come out 30–40 € per shelf per week ahead of today's route. This depends on two unverified numbers: the hourly cost, and how long today's date checks really take (D14, no published data). Interviews must answer the second one.
3. **Waste falls by about a third** (21 → 13.5 €/week) with the data map.
4. **Labelled ≠ rescued:** about 6–8 labelled units per week per shelf still end up as waste, whichever strategy.
5. The "label only the excess" strategy still gives the best result, but the gap to "label everything" is now small. The earlier "finding everything is the wrong goal" claim is weaker than first stated; keep it as a nuance, not a headline.

---

## 2026-11-10 — Scenario: new employee vs experienced employee

One-off run, 150 runs, defaults otherwise. New-employee values are guesses: chance of spotting a near-expiry batch 0.85 → 0.6, minutes per section 0.75 → 1.2, minutes to write a record 0.25 → 0.4, handover 0.4 → 0.1, guided spotting 0.95 → 0.9.

Medians per shelf per week at 20 min/day:

| Strategy | Missed, experienced | Missed, new | Waste €, experienced | Waste €, new | Min/day, experienced | Min/day, new |
|---|---|---|---|---|---|---|
| Route | 4.5 | 13.3 | 21.0 | 30.5 | 19.4 | 19.3 |
| Manual map | 0.8 | 4.3 | 15.0 | 20.0 | 13.6 | 19.0 |
| Map + 2D data | 0.0 | 0.0 | 13.5 | 13.5 | 4.3 | 6.8 |
| Map + 2D + sales | 0.3 | 0.3 | 16.5 | 16.0 | 3.3 | 5.3 |

**Reading:** With the data map the result no longer depends on who is working; only the time grows a little. Supports design principle P1. Not on the page yet (M10).

---

## 2026-11-10 — Sensitivity: new employees are not one person

Petteri pointed out that new employees vary a lot (how fast they learn, how quick and careful they are), so one "new employee" scenario looks more precise than it is. Ran a grid instead, 80 runs per cell, handover 0.2, guided spotting = manual spotting + 0.15 (max 0.97), time to write a record = ⅓ of time per section.

| Spotting chance | Min/section | Missed: route | Missed: manual map | Missed: 2D map | Waste €: route | Waste €: 2D map | 2D map min/day |
|---|---|---|---|---|---|---|---|
| 0.50 | 0.6 | 7.5 | 6.3 | 0.0 | 25.3 | 14.0 | 4.4 |
| 0.50 | 1.0 | 11.8 | 6.3 | 0.0 | 29.3 | 13.5 | 7.0 |
| 0.50 | 1.5 | 13.6 | 7.4 | 0.0 | 31.5 | 14.3 | 10.1 |
| 0.70 | 0.6 | 6.5 | 2.5 | 0.0 | 23.5 | 14.0 | 3.8 |
| 0.70 | 1.0 | 10.4 | 2.3 | 0.0 | 27.5 | 14.0 | 5.9 |
| 0.70 | 1.5 | 12.5 | 3.5 | 0.0 | 29.8 | 14.0 | 8.7 |
| 0.85 | 0.6 | 5.0 | 0.8 | 0.0 | 23.3 | 14.0 | 3.6 |
| 0.85 | 1.0 | 10.5 | 0.5 | 0.0 | 27.8 | 14.0 | 5.5 |
| 0.85 | 1.5 | 13.3 | 1.3 | 0.0 | 31.3 | 13.0 | 7.7 |
| 0.95 | 0.6 | 5.0 | 0.0 | 0.0 | 22.0 | 14.0 | 3.6 |
| 0.95 | 1.0 | 9.5 | 0.0 | 0.0 | 26.3 | 14.0 | 5.5 |
| 0.95 | 1.5 | 12.6 | 0.5 | 0.0 | 29.8 | 13.0 | 7.7 |

**Reading:** The route depends mostly on speed (does the person get round the shelf in time), the manual map mostly on accuracy (are the records right). The 2D map gives the same catch and waste across the whole grid; only its time varies. The conclusion holds without knowing what a "typical" new employee is like.

**Not modelled:** learning over time; different people on the same shelf on different shifts. Recorded as a general rule in [docs/README.md](README.md): prefer ranges to single guesses, and only put conclusions in the case that hold across the range.

---

## 2026-11-10 — Phone prototype (`app/`)

**What:** A mobile web app that shows the 2026 idea working end to end.

- **One scan, two jobs.** The iPhone camera reads a GS1 Digital Link QR code (`https://<domain>/01/<GTIN-14>/10/<batch>?17=<YYMMDD>`) and opens the app. If the batch is new, it is **received**: product, date, place on the shelf and quantity go into the batch table (Petteri's receiving-scan idea, field notes). If the batch already has a task, the scan **confirms the right product** and opens that task.
- **Tasks, one at a time** (design principles P1, P2): a verb first ("Put on a discount label", "Take off the shelf"), the product, the date in plain words ("Date is tomorrow"), the place with a small shelf diagram, three numbered steps, a count stepper, one big "Done" button.
- **"I can't find these on the shelf"** is a normal answer, not an error. It marks the batch as not found and corrects the record (P4).
- **Undo** on every action, in a toast that stays 7 seconds.
- **Shelf map** with icon + word for every status (Take off / Label now / Soon / OK), never colour alone. Fixes the colour-only map of the 2025 concept.
- **Role setting:** "Discount labels only" hides removal tasks (P2: tasks can be narrowed by role; same app, not a lesser one).
- **Finnish and English.** Plain-language copy in `app/i18n.js`.
- **Demo tools:** load a demo shelf with dates relative to today, move the demo day forward, print demo codes (`app/qr.html`).

**How:**
- Plain HTML/CSS/ES modules, no build step. State in `localStorage` (prototype only).
- `app/digital-link.js` parses and builds Digital Link URIs: GTIN-14 check digit (GS1 mod 10), batch (AI 10), use-by date (AI 17) or best-before (AI 15), and the GS1 rule that day `00` means the last day of the month. Tests in `tests/digital-link.test.mjs`, including the GS1 standard's own example GTIN `09520123456788`.
- Demo GTINs use the GS1 prefix **952**, reserved for examples (report E17), with correct check digits. Products are generic, not real brands.
- `vercel.json` rewrites `/01/*` to the app, so a printed code works on the deployed site. `tools/dev-server.mjs` does the same locally.
- QR codes drawn with qrcodejs 1.0.0 from cdnjs (only on the print page).

**Checked:** Chrome at 375 px (iPhone width), light and dark, Finnish and English: demo shelf → remove task → Done → Undo; scanning a batch that has a task opens it with "You scanned the right product"; scanning a new batch → received → shown on the shelf map; a damaged code → plain-language error; role filter; next demo day; QR page renders 8 codes. No console errors. **Not yet checked on a real iPhone**: needs the deployed site.

**What did not work at first:** the toast's `display: flex` overrode the `hidden` attribute, leaving an empty black bar; fixed with `.toast[hidden] { display: none }`. Finnish dates already end in a dot (`ke 11.11.`), so a sentence ending in a date got a double dot; the sentence template now leaves the final dot to the date.

---

## 2026-11-10 — Maintenance centre demo (`centre/`)

**What:** The first visible piece of Havain: a desktop web app for a department manager or retailer, on a simulated dairy and chilled department (8 fixtures, 3 levels each).

- **Department map:** each fixture shows its most urgent status (icon + word) and how long ago it was captured; a fixture not captured for over a week shows "Not captured".
- **Shelf front view (elevation):** drawn from the fixture's slots, with vision overlays: label read (green), products seen (blue), near date, past date, gap, needs facing, check product (label and shelf disagree). Products are drawn shapes; the page says so. In the product this view is stitched from a phone capture.
- **Slot details:** product, GTIN (demo prefix 952), what the label says, facings seen with confidence, other locations, batches with dates and **observed / inferred / verified** badges, and a "send task" action.
- **Alerts:** sorted by urgency, each linking to its slot.
- **Review queue:** what vision was unsure about (label vs shelf mismatch, unknown product, facing vs new pack design), shown as a crop of the front view with answer buttons. Each answer marks the fact verified ("the image goes to the reference gallery").
- **Captures:** last capture per fixture, by whom, keyframes, status, "ask for a capture".

**How:** Plain ES modules, no build. `centre/data.js` (store model, products, slots, batches, reviews), `centre/shelf.js` (SVG front view and layout), `centre/app.js` (views and state), `centre/style.css` (dark theme; status colours always with icon + word).

**Checked:** Chrome at 1600 × 1000: map, front view, details, alerts, task toast, fixture switching, review answers (badge updates), captures table. No console errors. Not yet tuned for narrow screens (it is a desktop tool; basic stacking only).

**Portfolio:** screenshot `docs/portfolio/havain-centre.webp` (2×) for the home page hover, replacing the drawn illustration made earlier.
