# Decision log

Newest at the bottom. Format: decision, why, options dropped, who decided.

---

## 2026-11-10 — Revisit S-hävikki instead of leaving it as is

**Decision:** Come back to the 2025 S-hävikki concept and test its assumptions.

**Why:** The 2025 case contains no numbers. It says honestly that the pilot was never run and that it is unclear how expiry data would reach the tool. That was the weakest point of the case.

**Who:** Petteri.

---

## 2026-11-10 — Make it a separate project, not a "2026 revisit" tab on S-hävikki

**Decision:** New project that links back to S-hävikki. S-hävikki stays as it is, with a short "Revisited in 2026" link.

**Why:**
- The question changed. S-hävikki asked how to design a service for staff, store and app (service design). The new question is what changes on the shelf when the expiry date becomes machine-readable, and whether prioritising checks actually helps (data and systems design).
- An outside change is real: GS1 2D barcodes make the 2025 case's open gap solvable.
- Two linked cases tell a better story ("I came back and tested my own assumptions") than one long case.
- A new project can be chain-neutral and does not need S-Group branding.

**Test we used:** If the first paragraph of the new case works without reading S-hävikki, it is its own project.

**Options dropped:** A third tab "2026 revisit" next to TL;DR / Full case. Kept for Tahti, where the change really is an update.

**Who:** Petteri, on Claude's recommendation.

---

## 2026-11-10 — Own repository, deployed separately from the portfolio

**Decision:** Separate repo `hyllykartta`. Prototype deploys as its own Vercel project, planned subdomain `hyllykartta.petu.design`. The portfolio only gets the case page later.

**Why:**
- GS1 Digital Link QR codes contain a URL. Printed codes need a stable address that does not break if the portfolio changes.
- Documentation lives with the product.
- A public repo is evidence in itself.
- The portfolio is a static site with no build step; keep it clean.

**Options dropped:** A branch in the portfolio repo.

**Who:** Petteri. GitHub repo: https://github.com/petudesign/hyllykartta (created by Petteri 2026-11-10).

---

## 2026-11-10 — Name: `hyllykartta` (working name)

**Why:** Matches the Finnish naming of the other portfolio projects (S-hävikki, Tahti, Peluutin, Kelikamera) and describes the core idea. Product and case names can still change; GitHub redirects renamed repos.

**Options dropped:** `shelfmap` — generic, likely taken by an existing product.

**Who:** Petteri.

---

## 2026-11-10 — Prototype uses GS1 Digital Link QR, not DataMatrix

**Decision:** The phone prototype reads GS1 Digital Link QR codes with the iPhone's own camera app. The QR contains a URL like `https://<our-domain>/01/<GTIN>/10/<batch>?17=<YYMMDD>`; opening it updates the shelf map.

**Why:**
- Petteri tests on an iPhone. iOS browsers (including Chrome on iOS, which uses WebKit) do not support the `BarcodeDetector` web API, so reading DataMatrix in the browser would need a library (zxing) and camera handling.
- The iPhone camera app reads QR codes natively. No camera code needed.
- GS1 Digital Link is a real GS1 standard, which is a point for the case in itself.

**Options dropped:** DataMatrix with a zxing library in the browser. Can be added later if we want to show DataMatrix too.

**To verify (research E15–E16):** iOS Safari BarcodeDetector status in Nov 2026; whether Chrome on iOS in the EU still uses WebKit; whether Digital Link allows a custom domain.

**Who:** Petteri and Claude.

---

## 2026-11-10 — Simulation first, with placeholder parameters

**Decision:** Build the simulation before research is finished. Every parameter is marked `assumption` until it has a source or has been checked against interviews.

**Why:** Research and building can run in parallel. Petteri verifies the research agent's sources while the model gets built.

**Who:** Petteri and Claude.

---

## 2026-11-10 — Simulation scope: one dairy shelf, three strategies

**Decision:** Model one dairy shelf (40 shelf sections) over four weeks and compare:

1. **Route** — today's practice. Walk the shelf in order as far as time allows. Without a shared record, the next shift often starts from the beginning again.
2. **Shelf map, manual** — the 2025 S-hävikki concept. Staff record the earliest date they see in each section; the map prioritises sections from those records. Recording takes extra time.
3. **Shelf map + 2D data** — the 2026 idea. Dates come from scanning 2D codes at restocking, so the map knows each section's dates without anyone writing them down.

**Why three, not two:** Comparing only "today" vs "2026" would hide which part helps — prioritisation and handover (possible already in 2025) or the data source (2D codes). Separating them is the honest test of the 2025 concept and of the 2026 claim.

**Who:** Claude proposed, Petteri to confirm.

---

## 2026-11-10 — Measure margin, not only "missed items"

**Decision:** Add purchase cost and gross margin to the model. Report margin and staff time next to missed units and waste.

**Why:** "Missed items" rewards labelling everything. Once margin was in, labelling everything turned out to cost more in markdowns than it saved in waste. A store decides in euros and hours.

**Who:** Claude, after the iteration 2 results.

---

## 2026-11-10 — Add a fourth strategy: label only the excess

**Decision:** `dataSmart` uses the same 2D data plus the sales rate and labels only units not expected to sell before their date.

**Why:** Iteration 2 showed the data's value is not in finding more items but in deciding which ones need a label. This is also a sharper case story than "2D codes find everything".

**Open:** The model gives this strategy the true demand rate. In reality it would be an estimate from checkout data and would be wrong sometimes. Add estimation error before drawing conclusions.

**Who:** Claude proposed, Petteri to confirm.

---

## 2026-11-10 — Show margin as a paired difference to today's route

**Why:** Absolute margin varies more between simulated shelves than between strategies, so the chart hid the effect. Every strategy runs on the same seeds, so the per-run difference isolates the strategy.

**Who:** Claude.

---

## 2026-11-10 — Precompute results instead of simulating in the browser

**Why:** In-browser simulation took 13–18 s per change, too slow for a portfolio visitor and worse on a phone. Precomputed JSON loads instantly and makes the numbers on the page reproducible and fixed.

**Trade-off:** The page only offers the precomputed slider steps (coverage in 25 % steps, minutes in 5-minute steps).

**Who:** Claude.

---

## 2026-11-10 — Petteri's shop-floor experience challenges the "Map + 2D lowers margin" result

**What happened:** The model said that labelling every near-expiry unit (Map + 2D data) lowers margin compared with today's route, because many labelled units would have sold at full price anyway. Petteri challenged this: in a normally running store, fast sellers almost never get within two days of their date. If that is true, the model overstates the markdown cost.

**Decision:**
1. Record his experience as a source: [field-notes.md](field-notes.md).
2. Do not present the margin result in the case until the model is checked against it (M1 in field notes).
3. Report margin both with and without staff time. The first version left staff time out of margin, which made the data map look worse than it is.
4. Design principle from stock drift: the map **prompts a check**, it does not **assert** stock levels.

**Who:** Petteri raised it; Claude agreed and recorded it.

---

## 2026-11-10 — Chain-neutral case, with current Kesko shop-floor access

**Decision:** The project is not tied to S-Group. It is about grocery stores in general; S-hävikki is mentioned only as the 2025 origin.

**Why:**
- Petteri's own experience is from Kesko (K-Citymarket), and his current personal contacts in grocery stores are too, across different store sizes.
- The research shows the topic is industry-wide: Kesko, S-Group and Lidl are all moving at their own pace with 2D codes (report A2), and the reference cases are from Norway and Australia.
- A chain-neutral case avoids looking like unsolicited work for one company.

**Open:** permission from anyone before naming them in the case. Add at least one interviewee Petteri does not know, or from another chain, to balance the sample.

**Who:** Petteri.

---

## 2026-11-10 — Calibrate the model against Petteri's experience; drop "finding everything is the wrong goal" as a headline

**Decision:** Shelf stock and shelf life are calibrated so fast sellers almost never reach the label window (field notes O1). New parameter status `experience` for values that rest on Petteri's shop-floor experience.

**Consequence:** After calibration, labelling every near-expiry unit no longer clearly lowers margin. The headline "finding everything is the wrong goal" is withdrawn; the case leads with **staff time** and **waste**, and keeps "label only the excess" as a nuance.

**Why it matters for the case:** This is a good story in itself: the first model gave a striking result, shop-floor experience showed it came from an unrealistic shelf, and the corrected model tells a calmer but more credible story.

**Who:** Petteri challenged, Claude diagnosed and recalibrated.

---

## 2026-11-10 — Design for the newest person on the shift and for employees with disabilities

**Decision:** Two design principles, written up in [design-principles.md](design-principles.md):
- **P1:** The tool is designed for a new or temporary employee who does not know the store, not for someone with years of experience.
- **P2:** The tool must be usable by employees with disabilities or special needs. Cognitive accessibility (W3C COGA, WCAG 2.2) is a baseline, roles can narrow the tasks, and colour is never the only cue.
Also recorded: P3 (beyond dairy and one chain), P4 (prompt a check, never assert stock), P5 (a label is not a rescue).

**Why:** Retail has high staff turnover, and people arrive from different store sizes and chains (Petteri). Stores have publicly hired more employees with special needs (Petteri; sources to find, research F2). A tool built for experienced staff helps those who need it least and can exclude people who could do the task.

**Evidence so far:** The new-employee scenario in the model: today's route misses about three times as many near-expiry units; the data map's result does not change.

**Who:** Petteri.

---

## 2026-11-10 — Prototype: the scan both receives and confirms; tasks are prompts

**Decisions:**
- **Same QR scan does two jobs:** receive a new batch, or confirm the product for an open task. One gesture for staff to learn (P1).
- **Receiving is the moment data enters the system** (Petteri's idea in field notes), not checkout. Checkout data would also show what sold, but receiving alone is enough to know dates and places.
- **Tasks are prompts, not claims** (P4): the count stepper starts from the received quantity, and "I can't find these" is a first-class answer.
- **Phone web app, not a native app:** works on any phone, the iPhone camera opens it from a QR code, nothing to install. A real store would run it on handheld scanners; the logic is the same.
- **Finnish first, English second:** the users are Finnish store staff; English is for case readers.

**Dropped for now:** reading DataMatrix in the browser (needs a library and camera code; iOS has no `BarcodeDetector`, report E15); sales data at checkout; multi-device sync.

**Who:** Claude, from Petteri's field notes and the design principles.

---

## 2026-11-10 — Platform ambition: start in Finland, design for anywhere; every milestone pays off on both paths

**Decision:** The shelf intelligence platform ([platform/strategy.md](platform/strategy.md)) starts in Finland but is not locked to it. Data model, standards and integrations are country-neutral (GS1 identifiers, GDSN, Digital Link, translatable copy, per-store locale, per-country rules as data). Expansion hypothesis: Finland → Sweden → Norway → rest of Europe.

**Also:** The project will most likely end as portfolio work, but it is done as well as possible and at full ambition. So every milestone must be worth something on both paths: a step towards a product, and a publishable result (working system, measured numbers, write-up) if the product stops.

**Why:** Finland is the easiest start (own experience and personal contacts in K-stores, GS1 Finland pilots, ESLs in both big chains, a concentrated market). The market is small (three buyers hold over 90 %), so locking to it would cap the product.

**Who:** Petteri.

---

## 2026-11-10 — Proof first: no outreach until the system works on real shelves

**Decision:**
- No sales or partnership outreach (retailers, Kesko/SOK, GS1, ESL vendors) until there is a working demo on real shelves.
- Petteri captures shelves himself in a store, tests what computer vision recognises, annotates and fine-tunes.
- The batch / barcode / expiry layer is **simulated** with the existing model (`sim/`), placed on top of the **real realogram** built from the captures. Real shelf, simulated batches; the data model marks which is which.
- **Exceptions that are not outreach:** permission to film (asked from a store's retailer through personal contacts) and informal questions to people Petteri knows in stores about how long date checks take and how shelves are restocked.

**Why:** Waiting for answers would only cost time, and a working demo on real data is a far stronger opening than a plan. Filming in a store needs the retailer's permission anyway (store policy, GDPR: customers and staff in frame), and named permission also allows using blurred images in the portfolio later.

**Order:** permission → plain iPhone photos and short videos of 5–10 dairy bays → off-the-shelf models, then own annotations and fine-tuning, measured honestly → ARKit capture app → shelf plane and multi-frame fusion → simulated batches on the real realogram → shelf map and tasks → only then show it to a retailer.

**Also decided:** pilot devices are phones (store-owned shared iPhones in a later pilot, not employees' own phones), not Honeywell terminals. The backend stays device-neutral so terminal scans can be consumed later.

**Who:** Petteri.

---

## 2026-11-10 — Do not lead with euros from saved staff time

**Decision:** The case and any demo lead with the robust results (fewer missed near-expiry batches; results independent of who works). Staff-time savings are shown as ranges, as a secondary result.

**Why:** Petteri (field notes O7): check time depends on shelf size, product type, disorder, customers, the person, and is mixed with facing, so no single value exists. The model's € from saved minutes rests on this parameter.

**Follow-ups:** model item M13 (check time per section type, digging penalty, interruptions); pilot measures the whole evening round; product idea: vision-detected disorder → "face this section" tasks.

**Who:** Petteri raised it; Claude recorded it.

---

## 2026-11-10 — 2D shelf map is the product; 3D store dashboard is the vision

**Decision:** Build a 2D shelf map (store → fixture elevation → slot) as the working product, and a 3D isometric store dashboard as a clearly labelled concept for the portfolio. Both render from the same store model. Details: [ux/visual-direction.md](ux/visual-direction.md).

**Why:** The 2D map is what employees can use on a phone; the 3D view shows where the platform could go. Rendering both from real data keeps the vision honest. Shared reference images were inspiration only (not 1:1, not stored).

**Who:** Petteri.

---

## 2026-11-10 — Revised: the store map is a desktop maintenance centre, not a phone view

**Decision:** The store-wide map is a **maintenance centre** (*ylläpitokeskus*) used on a computer by department managers and retailers: store/department map, fixture elevation views, alerts, a review queue for vision results, planning of captures and tasks, value view. The **phone** is the field tool: scan, tasks one at a time with their location, guided capture. The 3D store view stays as a labelled concept in the maintenance centre. Replaces the previous entry's split (2D phone map as product). Details: [ux/visual-direction.md](ux/visual-direction.md).

**Why:** Petteri: the map is for overseeing and maintaining the store, done by a manager or the retailer at a desk, not by an employee on the floor. It also suits the review queue (confirming or correcting vision results), which needs a big screen, and keeps the employee's phone simple (P1, P2).

**Who:** Petteri.

---

## 2026-11-10 — Name: Havain; portfolio shows the working demo, not an illustration

**Decisions:**
- The platform is called **Havain** (from *havaita*, to detect / observe). Planned address `havain.to`, which reads as *havainto*. The name is written "Havain"; `havain.to` is only the address.
- Havain replaces Vire in the portfolio hero ("Currently building …"). Vire stays as its own project.
- The hover shows a screenshot of the **working maintenance centre demo** on a simulated store, tagged DEMO / SIMULATED DATA. A drawn illustration was made first and dropped: Petteri wants a real product visible, and illustrations, if needed, are better made with an image generator.
- A brief for Petteri's portfolio agent: [portfolio/havain-portfolio-brief.md](portfolio/havain-portfolio-brief.md).

**Who:** Petteri.
