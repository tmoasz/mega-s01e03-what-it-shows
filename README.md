# What it shows — S01E03

Evidence-backed split of the support desk's ticket #4471. Source export dated 2026-10-04; analysis reviewed 2026-10-28.

## Deliverables

- GitHub issues: one per evidenced cause, with exact report membership and uncertainty.
- Signed decision: [`support-kb/src/routes/kb/decisions/0002-evidence-based-triage/+page.svx`](support-kb/src/routes/kb/decisions/0002-evidence-based-triage/+page.svx).
- Rendered decision: [`support-kb/build/kb/decisions/0002-evidence-based-triage/index.html`](support-kb/build/kb/decisions/0002-evidence-based-triage/index.html), with its CSS/JS under `support-kb/build/`.
- Original KB source, JSON and accepted decision preserved under `support-kb/src/`.
- Later engineering update: [signed source](support-kb/src/routes/kb/incidents/4471-resolution/+page.svx) and [rendered page](support-kb/build/kb/incidents/4471-resolution/index.html). The live desk reports the parser fixed and booking-v3 retired; issue #1 is closed as completed and issue #2 as not planned. The accepted triage decision remains unchanged.

The original executable classifier yields 379 parser-route reports and 33 booking-v3 hint-route reports from 412 unique IDs (427 export rows). Five reports within the parser group have conflicting symptoms; the new page quotes and distinguishes them rather than pretending every assignment proves a root cause. Intake tags are not used as the source of truth.

## View and reproduce

Requires Node.js 22.17 or newer.

```sh
cd support-kb
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173/kb/decisions/0002-evidence-based-triage/ . Serve the build directory over HTTP rather than opening HTML through `file://`; original Svelte interactions require the compiled assets. GitHub's blob viewer displays source, not the rendered application.

The static build uses SvelteKit, mdsvex and the original KB components. Counts, overlap checks, receipt/merge chronology, and desk-reference signature are computed during rendering. The interactive dedupe explorer hydrates in the browser. No production product fix is claimed.

The course-issued page signature is intentionally present only where the challenge requires it to identify the deliverable. Authentication credentials and local course exchange logs are not part of this repository.
