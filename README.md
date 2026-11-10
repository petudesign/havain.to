# havain.to

Shelf-level expiry tracking for grocery stores. A simulation and a working prototype exploring how GS1 2D barcodes, which carry the expiry date in the code, could help store staff find near-expiry products before they go to waste.

> **2D code tells what and when. The shelf map tells where.**

This is a 2026 follow-up to my 2025 service concept [S-hävikki](https://www.petu.design/s-havikki/). That concept's biggest open gap was data: a standard EAN barcode does not carry the expiry date, so checking dates is manual work. GS1 2D barcodes (GS1 DataMatrix, GS1 Digital Link QR) can carry the date, and the retail industry is moving to read them at checkout ("Sunrise 2027").

## What is here

| Path | What it is |
|---|---|
| `sim/model.js` | Shelf simulation. Compares four ways of checking dates on one dairy shelf. Plain ES module, no dependencies. |
| `sim/run.mjs` | Command-line Monte Carlo run: `node sim/run.mjs` |
| `sim/precompute.mjs` | Writes `sim/results.json`, which the page reads. **Run after every change to the model.** |
| `index.html`, `app.js`, `style.css` | Interactive page for the simulation |
| `centre/` | **Havain maintenance centre** (desktop demo, simulated store): department map, shelf front views with vision overlays, slot details with observed / inferred / verified batches, alerts, review queue, captures |
| `app/` | Phone prototype: scan a GS1 Digital Link QR code to add a batch to the shelf map; get one task at a time for near-expiry batches. `app/qr.html` prints demo codes. |
| `tools/dev-server.mjs` | Local server with the same `/01/...` rewrite as `vercel.json` |
| `tests/` | `node tests/digital-link.test.mjs` |
| `docs/` | Project documentation: decisions, build log, audience, design principles, field notes, research, interviews |

## Status

Work in progress. **Most simulation parameters are placeholders.** Each one in `sim/model.js` has a status: `assumption`, `sourced` (a source exists in `docs/research/report.md` but is not verified), `verified` or `model`. Research found no published data for the two that matter most: how long dairy sits on the shelf and how long a date check takes. Those will come from interviews. Results are comparisons between strategies under the same assumptions, not predictions of real waste.

## Run locally

No build step.

```bash
node sim/run.mjs
```

```bash
node sim/precompute.mjs
```

```bash
node tools/dev-server.mjs 8010
```

Then open http://localhost:8010 (simulation), http://localhost:8010/centre/ (maintenance centre) or http://localhost:8010/app/ (phone prototype).

**Testing the prototype on a phone:** the QR codes contain the address of the site that printed them. A phone cannot reach `localhost`, so print the codes from the deployed site (planned: `hyllykartta.petu.design`, a Vercel project with the rewrite in `vercel.json`).
