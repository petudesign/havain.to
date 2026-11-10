# Brief for the portfolio agent: Havain

From Petteri, prepared with Claude on 2026-11-10. Use this to (1) replace Vire with Havain in the home page hero and (2) start a case page for Havain. Read it all before editing. **Do not invent facts. Everything below is either done, measured in a model, or clearly a plan.**

---

## 1. What Havain is (one paragraph)

Havain turns grocery shelves into structured data. A store employee sweeps a shelf with a phone; computer vision builds a model of the shelf from the shelf-edge labels and what sits above them; GS1 2D barcodes and receiving scans add batches and expiry dates; a maintenance centre on the desktop shows the department manager or retailer what needs attention: near-expiry batches, gaps, wrong products, shelves that need facing. The first use case is expiry and waste in fresh departments. It starts in Finnish grocery retail but is built on global standards.

**Core line:** *2D codes tell what and when. Vision tells where. Scans make it true.*

**Name:** Havain, from Finnish *havaita* (to detect, to observe). Planned domain `havain.to`, which reads as *havainto*, "an observation". Write the name as **Havain** in text; use `havain.to` only as an address, and only once it exists.

---

## 2. Hero change (home page)

Current: "Currently building **Vire**, a video analysis engine for sports data." with a hover preview image labelled ILLUSTRATION.

Replace with one of these (Petteri picks; option A recommended):

- **A.** Currently building **Havain**, a computer vision platform that turns grocery shelves into data.
- **B.** Currently building **Havain**, computer vision that shows grocery stores what is on their shelves, and what needs doing.
- **C.** Currently building **Havain**, a shelf-intelligence platform for grocery stores, starting with expiry and waste.

**Hover preview:** use the provided screenshot of the working maintenance centre demo (see §8). It is a real, running app with a **simulated store**, so the tag should say **DEMO** or **SIMULATED DATA** (not ILLUSTRATION, and not implying real store data).

**Link target:** the Havain case page once it exists. Until then, no link, or link to the case page draft if it is published.

**Where to edit:** the single-column redesign. The hero text "Currently building Vire" was not found on the `feat/desk-to-screen-intro` branch, so it is on another branch or worktree (check `redesign`, `kelikamera-case` and `main`). Vire is also mentioned inside the KorisLab case ("Data and next steps"). **Leave that as is**; Vire still exists as its own project.

---

## 3. Status: be exact about what exists

| Exists now | In the repo `petudesign/hyllykartta` (Havain's working repo, to be renamed later) |
|---|---|
| **Research** | Sourced report on GS1 2D codes, Sunrise 2027, Finnish pilots, food waste figures, EU rules, competitors. Most sources not yet verified by Petteri. |
| **Simulation** | Day-by-day model of one dairy shelf, comparing four ways of finding near-expiry products; interactive page. Most parameters are assumptions. |
| **Phone prototype** | Scanning a GS1 Digital Link QR code adds a batch to the shelf or confirms a task; tasks one at a time; shelf map with icon + word statuses; Finnish and English. Tested in a desktop browser at phone width; **not yet tested on a real iPhone in a store**. |
| **Maintenance centre demo** (`centre/`) | Desktop web app with a simulated dairy department: department map with each fixture's most urgent status and data age, shelf front view with vision overlays (labels read, products seen, near date, past date, gap, needs facing, check product), slot details with batches marked observed / inferred / verified, alerts, a review queue for what vision was unsure about, captures list. Products are drawn; in the product the front view comes from phone captures. |
| **Platform strategy** | Audit, competitor research, computer vision pipeline design, data model, architecture, validation plan. |

| Not built yet | |
|---|---|
| Computer vision pipeline | Planned as validation spikes T1–T6. **No real shelf has been captured yet.** |
| Maintenance centre on real data | The demo runs on a simulated store. |
| Pilot | None. No retailer has been approached (deliberate: proof first). |

**Status line for the case:** "Simulation, phone prototype and maintenance centre demo on a simulated store; computer vision in progress." Update it as spikes finish.

---

## 4. Story of the case (recommended structure)

The portfolio's existing cases use short sections with a heading, a TL;DR / Full case toggle, and an honest note on what is not done. Follow the same pattern.

1. **Start from S-hävikki (2025).** My 2025 concept for near-expiry products in grocery stores had one big gap: an EAN barcode does not carry the expiry date, so checking dates stays manual. *Link to the S-hävikki case. Add a "Revisited in 2026 → Havain" link on the S-hävikki page.*
2. **The outside change.** GS1 2D barcodes can carry the batch and expiry date, and retail is moving to read them at checkout ("Sunrise 2027"; an industry goal, not a law). Finland is in the pilot stage.
3. **Test the idea before building it: simulation.** Four strategies on one simulated dairy shelf: today's walk-through routine; a manually updated shelf map (the 2025 concept); a shelf map with 2D data; the same plus sales speed.
4. **My shop-floor experience corrected the model.** The first version said labelling every near-expiry product would *lower* margin. From four years in a hypermarket dairy department I knew fast sellers almost never get close to their date. The model had an unrealistic shelf; once fixed, that result disappeared. *This is a strong story about domain knowledge vs. models. Tell it plainly.*
5. **What held up.** With the data map, almost no near-expiry batch is missed, **and the result no longer depends on who is working**. Tested over a wide range of new-employee skill levels: today's routine missed 5–14 near-expiry units per shelf per week, the data map 0. These are model results under stated assumptions, not field measurements.
6. **Design for the newest person on the shift.** Retail has high staff turnover, and stores employ people with special needs. Tasks one at a time, plain language, never colour alone, undo everywhere, "I can't find these" as a normal answer, tasks scoped by role.
7. **Phone prototype.** One scan, two jobs: receive a new batch, or confirm the right product for a task. GS1 Digital Link QR codes open it straight from the iPhone camera. Demo codes use the GS1 example prefix 952, so no real product codes.
8. **From expiry tool to platform: Havain.** The model assumed a shelf map already exists and stays correct. In reality someone has to build and maintain it as assortments change, and that is the job for computer vision. Key technical idea: **identity comes from the shelf-edge label; vision only checks what is above it.** Identifying any of thousands of products becomes checking whether this is the product the label says.
9. **Two products from the same data:** a maintenance centre on the desktop (store map, shelf front views, a review queue for what vision is unsure about) and a field app on the phone (scan, tasks, guided capture).
10. **What is next and what is not proven.** Capture real shelves (with the store's permission), measure what vision recognises, publish each validation spike's result. No retailer contacted yet; the demo comes first.

---

## 5. Numbers you may use, and how

Always say "in the model" or "simulated", and give ranges.

| Claim | Source | How to phrase |
|---|---|---|
| Today's routine missed 5–14 near-expiry units per shelf per week, the data map 0, across a range of new-employee skill and speed | Simulation, 12-combination sensitivity grid | "In the simulation, …" |
| Waste per shelf fell by about a third with the data map | Simulation, defaults | "about a third, in the model" |
| Fast sellers reached the label window on 15–19 % of days in the first model; ~2 % after correction | Simulation diagnostics | Use in the "experience corrected the model" section |
| NorgesGruppen (Norway) cut waste by 18 % with the expiry date in the barcode | Research report A5, **unverified** | Only after Petteri verifies; say it is the retailer's own figure |
| Aalto study: date-based automatic discounts cut waste by ~10 % | Research report A5/D13, **unverified** | Only after verification |
| Finnish retail food waste 0.92 % of throughput (2025) | Luke via a secondary source, **unverified** | Only after verification |

**Do not use:**
- **Euros from saved staff time** (e.g. "+€32 per shelf per week"). It rests on the most uncertain parameter; date-check time has no single value (it depends on shelf, product type, disorder, customers, the person, and is mixed with facing).
- Any accuracy figure for computer vision: none has been measured.
- Any claim of a pilot, a customer, or interest from Kesko, S Group or Lidl.
- Vendor marketing figures (Scandit "up to 40 %", Woolworths "up to 40 %").

---

## 6. Tone and wording

- Same voice as the other cases: first person, short sentences, honest about limits ("planned measures, not results").
- Shop-floor words: shelf, facing, date check, discount label, batch, receiving. Not "SKU velocity optimisation".
- Name the outside standards correctly: **GS1 2D barcodes**, **GS1 Digital Link**, **Sunrise 2027** (industry goal), **GTIN**.
- Avoid hype: no "revolutionary", no "AI-powered" as a headline. Say what the vision does.
- **People Petteri knows in stores:** **do not name anyone or their stores** in the case unless Petteri confirms they have agreed. If mentioned at all: "people I know who work in grocery stores today".
- Keep it chain-neutral. S-hävikki's S-Group styling belongs to the 2025 concept, not to Havain.

---

## 7. Visuals for the case

| Visual | Status | Note |
|---|---|---|
| Hover / cover: maintenance centre screenshot | **Provided** (§8) | Tag: DEMO or SIMULATED DATA |
| Maintenance centre: shelf front view, review queue, captures | Available in the demo | Screenshots; caption "simulated store" |
| Simulation chart (margin after staff time / missed units by staff minutes) | Available on the simulation page | Screenshot; caption "simulated, assumptions listed on the page" |
| Phone prototype: task card, scan receive card, shelf map | Available | Screenshots at 375 px; Finnish UI with English captions |
| Diagram: label-anchored recognition (label → identity, detector → presence, embedding → verification) | To make | Simple three-layer diagram |
| Diagram: observed / inferred / verified | To make | Ties the data model to design principle "prompt, don't assert" |
| 3D store view (concept) | Not built | If made later, label "concept" |
| Real shelf captures with detections | Not yet | Comes from spike T1–T3, with permission, people blurred |

---

## 8. Hover image (provided)

Files in this repo: `docs/portfolio/havain-centre.webp` (3200 × 2000, 2× retina) and `docs/portfolio/havain-centre.png`.

What it shows: the **working maintenance centre demo** (`centre/`) on a simulated dairy department: four summary figures, the department map (each fixture with its most urgent status as icon + word, and when it was last captured), the selected slot's details (Natural yoghurt 150 g, near date, batches marked inferred and observed, "send task"), the alerts list, and the top of the yoghurt cooler's front view with vision overlays.

Tag it **DEMO** or **SIMULATED DATA**, the same way Vire's preview carries a tag. Copy the WebP (and the PNG fallback if the portfolio uses one) into the portfolio's `assets/` and wire it into the hero hover exactly the way Vire's preview is wired. If the hover is small, a crop of the map + details panel reads best.

Earlier there was a drawn shelf illustration; it was dropped in favour of the real app. Any further illustrations will be made with an image generator, not here.

## 9. Links

- Repo: https://github.com/petudesign/hyllykartta (public). Will likely be renamed to Havain later.
- Demo: maintenance centre at `/centre/`, simulation at `/`, phone prototype at `/app/`, all planned on Vercel; **no public URL yet**. Do not link a demo until Petteri provides the address.
- S-hävikki case: https://www.petu.design/s-havikki/
- Domain `havain.to`: planned, not live. Do not link it.

---

## 10. Checklist for the portfolio agent

- [ ] Find the hero on the redesign branch; replace the Vire line with the chosen Havain line.
- [ ] Add the hover image (maintenance centre screenshot) with a DEMO / SIMULATED DATA tag, same behaviour as Vire's.
- [ ] Keep the Vire mention in the KorisLab case unchanged.
- [ ] Create a Havain case page following §4, with the TL;DR / Full case pattern and an honest status line.
- [ ] Add "Revisited in 2026 → Havain" to the S-hävikki case.
- [ ] Use only the numbers in §5, with their phrasing.
- [ ] No personal names, no retailer claims, no CV accuracy figures, no euros from saved minutes.
- [ ] Check alt texts and that every status in images is described in text, not only by colour.
