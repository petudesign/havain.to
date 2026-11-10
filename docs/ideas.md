# Ideas

Concept ideas that came up during the work, with conditions, risks and what would test them. An idea moves to [decision-log.md](decision-log.md) when we decide to build or drop it.

---

## I1. Electronic shelf labels drop the price automatically when only one batch is left

**Raised by:** Petteri, 2026-11-10, reading the Aalto finding that date-based automatic discounts cut waste by about 10 % (report A5, D13).

**Idea:** Many stores already have electronic shelf labels (ESL). If the batch table shows that a near-expiry batch is the **only batch** of product X on the shelf, the system can set the ESL to the discount price directly. Nobody has to put on a paper label.

### The condition matters: one batch only

An ESL changes the price of the **whole product**, not of one batch. If old and new batches are mixed on the shelf, the discount also applies to the fresh units, and customers who reach to the back (45 % in dairy, report D12) take exactly those. The research supports this: with ESLs alone, price changes rose by 54 %; with ESLs and batch-level data, by 853 % (Chehrazi et al., report A5/C10). Batch data is what makes frequent price changes safe.

### Three levels, depending on what the store has

| Store has | What happens | Staff work |
|---|---|---|
| Batch table + ESL, **one batch on the shelf** | ESL switches to the discount price. The app shows it as done, not as a task. | None. Maybe a check that the old units are at the front. |
| Batch table + ESL + **checkout reads 2D dates**, several batches | ESL shows the offer ("−30 % on date 12.11."). The checkout gives the discount to the right units by reading the date in the code, as NorgesGruppen does (report A5). | None. |
| Batch table only, or several batches without 2D checkout | Paper discount label, as in the prototype today. | Label task. |

### Risks and open questions

- **"Only one batch" can be wrong** (design principle P4): stock drift, units hidden behind others (field notes O5), a newer batch brought from the backroom. If a fresh batch goes on the shelf while the discount is on, fresh units sell at a discount.
  - **Mitigation:** the **receiving scan ends the ESL discount** for that section, or switches it to the "offer for date X" mode. Restocking is the moment the condition changes, and it is already a scan.
- **Price rules:** shelf price and checkout price must match. Does Finnish price-marking regulation allow automatic ESL price drops like this, and how must a near-expiry discount be shown? (Research F8.)
- **Customer trust:** frequent price changes on the shelf can feel unpredictable. Showing *why* ("short date") on the ESL helps.
- **Cost:** ESL is an investment some stores have already made; the batch table is the new part.

### What the model says

Measured with the model, 2026-11-10 (Map + 2D data strategy, 100 runs):

| Replenishment rule | Near-expiry batch is alone on its shelf section |
|---|---|
| Fill the shelf every morning (current default) | 0 % |
| Whole cases of 6 when stock falls to 1 day of demand | 41 % |
| Whole cases of 6 at ½ day of demand | 56 % |
| Whole cases of 12 at 1 day of demand | 67 % |

The answer depends entirely on how stores restock. With daily top-ups a fresh batch always lands next to the old one; with whole cases, slow sellers (the ones that reach their date) often sit as a single batch. **Restocking practice is now an interview question.** Under case replenishment, roughly half of the label work could move to ESLs.

### Next steps

- Interviews: how is each category restocked (daily top-up or whole cases)? How common are ESLs in your store? (Added to interview questions.)
- Model: decide the replenishment rule (M12) and add an ESL strategy (M11): when the batch is alone, discount without staff time; otherwise fall back to a label task.
- Prototype: show an ESL task as "done automatically" in the task list, and let the receiving scan end the discount.
- Research F7–F9.
