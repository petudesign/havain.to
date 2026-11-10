# Visual direction: maintenance centre on the desktop, field tool on the phone

Decided 2026-11-10 (Petteri), revised the same day. Two reference images were shared in the conversation: an isometric 3D store dashboard with heat maps and alerts, and a warehouse-style scanning app. **Neither is the target 1:1.** They are references only and are not stored here (origin and rights unknown; do not publish them).

## Two products from the same data

| | **Maintenance centre** (*ylläpitokeskus*) | **Field app** |
|---|---|---|
| Device | **Desktop / laptop** in the back office | **Phone** on the shop floor |
| Users | Department manager, retailer (store owner), later chain | Employee, also the manager when on the floor |
| Job | See the state of the store or department, decide what needs doing, plan and assign, review what vision found, follow trends | Capture shelves, scan (receive / confirm), do tasks |
| Map | **Central:** the whole store or department as a map, down to each fixture's elevation view | Minimal: only "where" for the current task (like the prototype's mini shelf) |
| Main view | Map + alerts + review queue | One task at a time (P1, P2) |

**The visual shelf map is the core UX concept, but on the desktop.** On the phone the employee does not navigate a map; they get the next task with its location. This follows the brief's wish to keep the map central and the design principles' wish to keep the employee's view simple.

## Maintenance centre

**Store / department map (2D, the working version):**
- Floor plan with fixtures as shapes. Each fixture shows status with icon + word (P2) and **how old its data is** ("captured 3 d ago", "not captured in 2 weeks").
- Alerts placed on the map and listed as a timeline with timestamps: near-expiry batches, gaps, wrong product, needs facing, a reset shelf.
- Filters by department, alert type and data age.

**Fixture elevation view:** a front view of the shelf built from the capture (keyframes on the shelf plane, spike T1), with overlays. Click a slot to see the product, its batches with dates (each fact marked observed / inferred / verified), its other locations and its history. **This is the view no reference shows and the one only vision makes possible.**

**Review queue:** what vision was unsure about ("label says A, shelf looks like B", "new product not in catalogue", "shelf looks reorganised"). The manager confirms or corrects on a big screen. Each answer makes the fact **verified** and adds training data (the label-anchored gallery). Reviewing works far better at a desk than on a phone.

**Planning:** which fixtures to capture this week (oldest data, most alerts); assign tasks to people or roles; see what got done.

**Value view (retailer):** trends with data age and confidence; waste in the departments in scope; missed batches; open and completed tasks. **No euros from saved minutes as a headline** (decision log, O7).

**3D store view (vision, portfolio concept):** the same store model rendered as an isometric 3D store (Three.js). Clearly labelled concept. Uses real fixtures and real statuses, so it is not a fake picture.

## Field app (phone)

- **Scan anywhere:** a scan receives a batch, confirms a task or shows the product's place and status.
- **Tasks one at a time** with the location (mini shelf, later a crop of the elevation view: "this spot").
- **Guided capture** of a fixture when the centre asks for it (ARKit).
- Today's `app/` prototype is the starting point.

## Take from the references

- Alerts placed on the map, with timestamps (centre).
- Owner-level figures in panels around the map (centre), with data age.
- Scan screen: camera with a clear "recognised" confirmation, result card right below, manual entry as fallback (field app).
- **A product's list of locations** (both).
- Recent activity with person and time (both).

## Do not take

- **Shopper traffic and heat maps:** need fixed cameras or tracking customers. Phone sweeps cannot produce them, and they raise privacy issues. Out of scope unless a real data source exists.
- **Precise-looking KPIs without data age** ("In-stock 92 %"): show when each part was last captured and how certain it is (P4).
- **Colour-only status** (P2).
- **Stock counts asserted as fact** ("148 units on hand"): we only know what was seen and when (P4).
- **"View item" as the main action on the phone:** the main action is the task.
- Warehouse vocabulary (bins, transfers, reserved): use shop-floor words.

## Technology

- Maintenance centre: web app (TypeScript + React), SVG for the 2D map and overlays, Three.js for the 3D concept. Same store model as JSON from the API.
- Field app: native iOS (capture, scanning, tasks), as decided.
- Elevation view: stitched keyframes on the shelf plane as an image, overlays as SVG.

## Order

1. 2D maintenance centre with a hand-made store model and simulated data (shows the concept early, no CV needed).
2. Fixture elevation view once spike T1 produces stitched shelf images.
3. Review queue alongside spikes T2–T4 (it is also the annotation tool).
4. 3D concept view once a real store model exists.
