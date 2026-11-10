# Design principles

Decisions about **who the tool must work for**, and what follows from them. Each principle records where it came from, why, what it means for the design, and how we check it.

Raised by Petteri on 2026-11-10. Related: [audience.md](audience.md), [field-notes.md](field-notes.md), [decision-log.md](decision-log.md).

---

## P1. Designed for the newest person on the shift, not the most experienced

**Where it came from:** Retail has high staff turnover. People who start in a store often do not know how that store works. They may come from a store of a different size, from another chain, or have no retail experience at all. (Petteri, from experience. Turnover figures still need a source; see research follow-up F1.)

**Why:** Today's date check depends on tacit knowledge: which products tend to go short, where the slow sellers are, what the previous shift already did. That knowledge leaves with the person. A tool that assumes it would only help those who need it least.

**What the model says:** In a scenario with a new employee (lower chance of spotting a near-expiry batch, slower per section, little handover), today's route misses about **three times as many** near-expiry units (4.5 → 13.3 per shelf per week) and the manual map also gets worse (0.8 → 4.3), because it depends on that person's own records. The 2D data map gives the **same result** with either employee; it only takes a few more minutes (4.3 → 6.8 min/day). **There is no "average new employee".** People who start in a store differ a lot: how fast they learn, how careful and how quick they are, what they have done before. So the model was also run over a range instead of one guess: chance of spotting a near-expiry batch from 50 % to 95 %, and 0.6 to 1.5 minutes per shelf section. Across all 12 combinations, today's route missed 5–14 units per shelf per week, the manual map 0–7, and the 2D data map 0 every time, with waste steady at 13–14 €. Only the data map's time changed (4–10 min/day). The values are still guesses, but the conclusion does not depend on picking the right one: when the knowledge is in the system, the result depends much less on who is working. Details: [build-log.md](build-log.md).

**Not modelled:** learning over time (a new employee gets better week by week) and a mix of people on the same shelf across shifts.

**Design consequences:**
- The tool tells the person **what to do**, not only what the status is: "Put a discount label on 3 × [product], date 12.11.", with a product image, instead of a red square.
- **No prior knowledge of the store needed:** the task shows where the section is (aisle, shelf, a photo or a simple map).
- **Scanning confirms** the right product and batch, so a mistake is caught at the shelf, not afterwards.
- Store-specific rules (discount levels, what goes to the waste shelf) come from the system, not from memory.
- **First use without training:** the first task works with no instructions beyond the screen itself.

**How we check it:** Usability test with at least one person who has never worked in that store, ideally never in retail. Measure whether they complete a task without help.

---

## P2. Usable by employees with disabilities: the tool must not exclude anyone

**Where it came from:** Grocery chains have publicly hired more employees with disabilities and special needs (Petteri; examples still need sources, research F2). They often have narrower responsibilities, which is reasonable, but the tools they use should not shut them out of tasks they can do.

**Why:** If the tool only works for someone who can read dense text quickly, hold several things in mind and make judgement calls, it excludes people who could do the task with a clearer tool. Designing for them usually makes the tool better for everyone, including new and stressed staff (P1).

**Design consequences:**
- **Cognitive accessibility** as a baseline: follow W3C's guidance on making content usable for people with cognitive and learning disabilities (COGA) and WCAG 2.2.
- **One task at a time,** in a fixed order. No list of 40 sections to choose from.
- **Plain language,** short sentences, the same words every time.
- **Never colour alone:** every status has an icon and a word. (The 2025 S-hävikki shelf map used colour only; this fixes it.)
- **Large tap targets,** usable with gloves and a scanner in the other hand.
- **No time pressure,** no timers. Tasks can be paused and resumed.
- **Undo** for every action, and confirmation by scanning instead of typing.
- **Tasks can be scoped by role:** an employee can be given only labelling tasks, while decisions (discount depth, moving to the waste shelf) stay with a shift lead. This is a setting of the task, not a different, lesser app.

**How we check it:** Include at least one person with a cognitive or learning disability in usability testing, with their consent and if a store can arrange it. Run an accessibility review against WCAG 2.2.

---

## P3. Not only for dairy, not only for one chain or store type

**Where it came from:** Petteri's own experience is from a Kesko hypermarket's dairy department. A good project has to work beyond that.

**Why:** Dairy and meat have the most date work (field notes O4), but bread has the highest waste rate relative to sales in Finnish retail (3.6 %, report B7). Store sizes differ in volume and staffing (field notes O2). Chains differ in routines and systems.

**Design consequences:**
- The model's dairy shelf is the **first example**, not the scope. Add category profiles (meat, bread, deli) with their own shelf life and sales speed (model item M9).
- **Store-size scenarios** (hypermarket, supermarket, neighbourhood store), model item M8.
- Interviews cover **different store sizes and, if possible, more than one chain** (personal contacts cover several Kesko store sizes; add someone from another chain).
- Fruit and vegetables have no printed date and are a different problem. **Out of scope**, say so in the case.

---

## P4. Prompt a check, never assert stock

**Where it came from:** Stock drifts away from the records through theft, breakage and misplaced units (field notes, "the hard part").

**Design consequence:** The map says "this batch should be close to its date, have a look", not "there are 4 units left". Looking at the shelf corrects the record.

**What the model says:** Unrecorded losses cost wasted visits, but no near-expiry batch is missed because of them.

---

## P5. A label is not a rescue

**Where it came from:** Field notes. Not every labelled unit sells.

**Design consequence:** The tool and the case never count labels as saved food. Report "labelled but still wasted" separately (the model does).
