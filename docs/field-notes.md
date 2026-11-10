# Field notes: Petteri's shop-floor experience

First-hand experience is a source in its own right in this project. These notes record what Petteri saw on the job, so the model and the case can lean on it and say where it comes from.

**Source:** Petteri, more than four years in grocery retail. The notes below are from the dairy department of a K-Citymarket (Kesko hypermarket), up to about November 2021.
**Recorded:** 2026-11-10, from a conversation while challenging the first simulation results.
**Caveat:** One person, one store type, about five years ago. Interviews should test whether this still holds and whether it holds elsewhere (other chains, smaller stores).

## Current access to the shop floor (2026)

Petteri still knows people who work in grocery stores today, in different store sizes. That gives current, first-hand views beyond his own hypermarket experience. (Details are kept out of the public repo.)

**Caveats for the case:**
- Ask both for permission before naming them or their role in the published case.
- Interviewing people you know is convenient and gives access, but it is a biased sample: one chain, people who know Petteri. Say so in the case and try to add at least one interviewee Petteri does not know, or from another chain.
- Ask for permission before mentioning anyone in the case.

---

## Observations

### O1. Fast sellers almost never get close to their date

In a store that runs normally, a fast-selling product very rarely has units with two days left. The ones that do are mostly slow sellers.

**Exception:** sometimes a delivered batch already has a shorter date than usual.

### O2. Volumes depend on the store type

Stores sell at very different speeds and volumes. Hypermarkets (K-Citymarket, and on the S-Group side most likely Prisma) sell the most and in the largest quantities. The same product can be a fast seller in one store and a slow seller in another.

### O3. The routine at the time

- Shelves were **faced** (products pulled forward and tidied) **several times a day**.
- A dedicated **date check**, looking for short dates, was done **about twice a day: morning and evening**.
- Every facing also meant watching the dates, so the **oldest go to the front and the newest to the back**.

### O4. Dairy and meat carry most of the date work

From Petteri's experience in dairy: dairy, and probably meat, are the departments with the most expiry-date issues.

### O5. Older dates hide behind newer ones

With small yoghurt pots in particular, facing sometimes turned up older dates underneath or behind newer units. Two causes:

- **Staff error:** new stock placed in front of old stock.
- **Customers digging** for the longest date and leaving the older units at the back.

### O6. Nothing here is black and white

Every rule has exceptions: short-dated deliveries, human error, customer behaviour. A design that assumes a clean, ordered shelf will be wrong in practice.

### O7. A date check has no single duration

Recorded 2026-11-10. The time a check takes depends on:

- **Size of the shelf and number of products.**
- **Interruptions:** helping customers, customers in the way.
- **Who does it.**
- **Disorder:** if products are in the wrong order, you have to dig, which slows the check a lot (connects to O5).
- **Product type:** a milk cooler (cartons) is checked much faster than a shelf of puddings (small multipacks and pots).
- **It is mixed with facing:** in the evenings, checks were done while facing the shelves, so the time spent only on checking is very hard to separate.

**Consequences:**
- There is no "good single number" for check time, and interviews will not produce one either. Research also found no published figure (report D14).
- The model's staff-time savings (and the € value derived from them) rest on the most uncertain parameter there is. **Present time results as ranges, and do not lead the case with euros from saved minutes.** The robust result is the one that does not depend on this parameter: fewer missed batches, and results that do not depend on who is working.
- In a pilot, measure the **whole evening round (facing + checks)** with and without the map, not check time alone.
- **Product idea:** vision cannot see dates, but it can see **disorder** (products not fronted, gaps, mixed facings). A "face this section" task from a sweep fits how the work is actually done, and it targets the slow sections (puddings, small pots) where digging costs time.

---

## Idea: scan at receiving, build a batch table

> If the scan gives the date, products could be scanned when they arrive in the store. That gives a table of which products and batches are in the store, at what price. Compare the table to today, and the system can say: "Milk arrived on Tuesday that looks like it expires next Wednesday. It is Monday now, go through those."

- **Open:** Petteri does not remember whether incoming goods are scanned at receiving today. Ask in interviews.
- This is close to the `dataMap` strategy in the model, with receiving as the moment the data enters the system.

## The hard part: knowing that a batch is gone

The table is only as good as the knowledge that a batch has actually sold. In practice stock drifts away from the records:

- **Theft**
- **Breakage**, especially if nobody scans the broken units out
- **Lost or misplaced units**, e.g. moved to another spot in the store

A system that says "this batch is sold out" will sometimes be wrong. Building one that measures this well enough is probably expensive.

**Design consequence:** the map should *prompt a check* ("this batch should be close to its date, have a look") rather than *assert a fact* ("there are 4 units left"). A wasted visit is cheap; a silently missed batch is the failure we are trying to avoid.

## Economics: when is it worth it for a store?

- Everything except the manual work is faster and more efficient, but it costs more as a **one-time investment**.
- The question a store would ask: if one day's waste is, say, **3 yoghurts, 5 puddings and 1 pack of butter**, how many such days does the system need to save before it pays for itself?
- That is a **break-even calculation**: investment ÷ (weekly value of waste avoided + staff time saved − extra markdowns).

## A label is not a rescue

Even if every near-expiry unit gets a discount label, not all of them sell. **Labelled ≠ rescued.** The case must not count labels as saved food.

---

## What this means for the model

Status as of 2026-11-10 in the last column. Details in [build-log.md](build-log.md).

| # | Change | Why (observation) | Status |
|---|---|---|---|
| M1 | Check where the markdown cost in the model comes from. Split labelled units by product sales speed. If fast sellers reach the 2-day window often in the model, the model overstates how much margin a full-labelling policy loses. Calibrate until fast sellers rarely get there. | O1 | **Done.** Fast sellers were near their date on 15–19 % of days and got ~48 % of all labels. Recalibrated (2 days of stock on the shelf, 7–14 days of shelf life on arrival): now ~2 % of days, ~6–10 % of labels. |
| M2 | Add short-dated deliveries: a small share of batches arrive with less shelf life than usual. | O1 exception | **Done.** 5 % of deliveries arrive 3 days shorter. |
| M3 | Make the route strategy match the real routine: date checks morning and evening, plus rotation during facing. | O3 | **Partly.** Checks run in two rounds (morning, evening). Facing between rounds fixes rotation with 50 % probability; facing time is not counted. |
| M4 | Add hidden old units: some units end up behind newer ones (staff error or digging customers) and are only found when the section is faced or checked. | O5 | **Done.** 10 % of restocks put new stock in front. Until someone faces or checks the section, front-pickers take the newest units. |
| M5 | Add stock drift to the data strategies: a share of units disappear without a record (theft, breakage, misplacement). The map then sends staff to batches that no longer exist, or the record is wrong. Measure how much drift the data map tolerates before it stops beating the manual map. | Hard part | **Done.** 0.3 %/day of units vanish; half are recorded, the rest stay as ghost stock until someone looks. Result: ghosts cost wasted visits, not missed batches. |
| M6 | Add staff cost per hour and a one-time system cost, and compute break-even in weeks. Both values need sources or interview estimates. | Economics | **Partly.** Staff time priced at 20 €/h (assumption). Break-even needs a system cost, not modelled yet. |
| M7 | Report "labelled but still wasted" as its own metric next to waste and missed units. The model already sells labelled units only with a probability; the result just is not shown separately yet. | Labelled ≠ rescued | **Done.** New metric: labelled but still wasted. |
| M8 | Consider store type as a scenario: hypermarket (high volume) vs smaller store (lower volume, more slow sellers). | O2 | **Not yet.** |
| M9 | Category profiles beyond dairy: meat, bread, deli, each with its own shelf life and sales speed. | Design principle P3 | **Not yet.** |
| M10 | Staff experience as a scenario (new vs experienced employee). | Design principle P1 | **Tested as a one-off run** (build log). Not on the page yet. |
| M11 | ESL strategy: when a near-expiry batch is alone on its section, discount it via the shelf label without staff time; otherwise a label task. | [ideas.md](ideas.md) I1 | **Not yet.** |
| M13 | Check time per section instead of one value: by product type (cartons fast, small pots and multipacks slow), extra time when the section is misrotated (digging), random interruptions. Report time results as ranges. | O7 | **Not yet.** |
| M12 | Replenishment rule: whole cases at a reorder point instead of a daily top-up. Implemented as an option (`replenish: 'case'`), not the default. Changes waste rates and the ESL result a lot. | I1; needs interviews | **Option added, default unchanged.** |

## What this means for the interviews

Questions to add to the interview guide:

1. How often are shelves faced, and how often are dates checked on purpose? Who does it, at what time?
2. Are incoming goods scanned at receiving? What does the scan record?
3. Which products typically reach their date? Fast or slow sellers? Which departments?
4. How often does a delivery arrive with a shorter date than usual?
5. How often do you find older dates hidden behind newer ones? Why does it happen?
6. How are broken or stolen products recorded? How far does the system's stock count drift from the shelf?
7. What share of red-labelled products still end up as waste?
8. How is each category restocked: topped up every day, or whole cases when the shelf runs low? Is there backroom stock?
9. Does your store have electronic shelf labels? Are prices on them ever changed for short-dated products?

## How this can be used in the case

- **Credibility:** the project starts from four years on the shop floor, not from a desk. These observations show it.
- **"Nothing is black and white"** is a good framing for the honest-limits section.
- **The receiving scan and batch table** is a concrete, explainable version of the 2026 concept for the prototype.
- **"A label is not a rescue"** and **break-even** move the case from "less waste" to the store's actual decision.
- **Stock drift** explains why the design prompts a check rather than trusting the data, which is a design decision worth showing.
