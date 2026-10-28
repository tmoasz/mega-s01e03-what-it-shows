# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Run and publish

Use Node.js 22.17 or newer. From this directory:

```sh
npm ci
npm run dev
```

Open `/kb/` on the development server. To produce the static site:

```sh
npm run build
```

The generated `build/` directory contains prerendered pages and their Svelte client
bundles; serve the whole directory at the domain root, then open `/kb/`. For example,
`npx http-server build -p 4173` serves it at `http://localhost:4173/kb/`.
Routes use directory `index.html` files so an ordinary static server can serve deep links.
The build directory is intentionally not ignored, so the rendered site can be committed.

The `.svx` pages are compiled with mdsvex and use the original shared runbook layout.
SvelteKit prerenders the pages while retaining client hydration for interactive components
such as `DedupeExplorer`; no application server or handcrafted HTML replacement is needed.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
