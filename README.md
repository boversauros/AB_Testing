# A/B Testing — vanilla TypeScript

A small A/B testing engine written in vanilla TypeScript, with no framework and
no external testing library. The project is a clean-architecture exercise: two
deep modules behind small interfaces, wired together by a thin composition
root.

Live demo: [https://abtest.surge.sh/](https://abtest.surge.sh/)

## Requirements

- Node.js 24
- pnpm 11

The exact development versions are pinned in the `packageManager` field of
`package.json`.

## Getting started

```sh
pnpm install
pnpm dev
```

Available commands:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Build the production site into `dist` |
| `pnpm preview` | Preview the production build |
| `pnpm typecheck` | Type-check the strict TypeScript project |
| `pnpm lint` | Lint with ESLint and type-aware typescript-eslint rules |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:coverage` | Run the suite and write a coverage report to `coverage/` |
| `pnpm check` | Type checking, linting, tests, and production build in one gate |

`pnpm check` is the single quality command; CI runs exactly the same gate on
every push and pull request (see `.github/workflows/ci.yml`). Coverage is an
observation tool — there is intentionally no percentage threshold to game.

## Architecture

The design goal is two [deep modules](https://web.stanford.edu/~ouster/cgi-bin/aposd.php)
behind small interfaces, and a composition root that only wires them together:

```
src/
├── main.ts                 Composition root: wires real dependencies, no logic
├── db/experiments.ts       Typed experiment catalog (stand-in for a server)
├── experimentation/        Deep module #1: assignment, persistence, rendering
│   ├── index.ts            Public factory + `Experimentation` interface
│   ├── types.ts            Public types (catalog in, activation result out)
│   ├── assignments.ts      Internal: reconcile stored assignments
│   ├── render.ts           Internal: variant content → DOM element
│   └── validate.ts         Internal: catalog invariants
└── analytics/              Deep module #2: consent, deduplication, delivery
    ├── index.ts            Public factory + `Analytics` interface
    ├── types.ts            Public types (event in, record result out)
    ├── deduplication.ts    Internal: once-only delivery markers
    └── consoleSink.ts      A sink implementation for development and demos
```

`src/main.ts` is the only place that knows about real browser dependencies. It
hands `document`, `window.localStorage`, a console sink, and a visitor-context
provider to the two factories and contains no experiment or analytics logic
itself. Both modules depend only on the narrow interfaces they declare
(`AssignmentStorage`, `DeduplicationStorage`, `AnalyticsSink`,
`ContextProvider`), which is also how the tests inject fakes.

## Experimentation

The whole module is one operation:

```ts
const experimentation = createExperimentation({ root: document, storage: localStorage })
const activation = experimentation.activate(catalog)
// activation: { exposures, issues }
```

`activate` assigns one variant per experiment, persists the assignments,
renders each variant into the element carrying the matching
`data-placement` attribute, and reports what happened. Its invariants:

- **One variant per experiment.** Every catalog experiment gets exactly one
  assigned variant, picked uniformly at random on first visit.
- **Exposures are truthful.** `exposures` only contains variants that actually
  reached the DOM — an assigned variant whose placement is missing is not an
  exposure.
- **Failures are contained.** A missing placement becomes an entry in `issues`
  and leaves the existing page content untouched; one broken experiment can
  never take down the rest of the page.
- **Activation is idempotent.** Rendering replaces the placement's children,
  so activating again yields the same page, not duplicated content.
- **Invalid catalogs throw early.** A catalog that violates its invariants
  (duplicate ids, empty variant lists, …) is a programming error: `activate`
  throws before touching storage or the DOM.

### Assignment persistence

Assignments live under a single versioned localStorage key,
`ab-testing:assignments:v1`, mapping experiment id → variant id. On every
activation the stored map is reconciled against the catalog:

- A stored assignment is reused while it still points to an existing variant,
  so a visitor keeps seeing the same variant across reloads.
- Corrupt JSON, unknown shapes, or assignments referencing removed variants
  degrade to "no assignment yet" and are repaired with a fresh random pick.
- The repaired map is persisted back, so the next reload is stable again.

## Analytics

The analytics module is also one operation:

```ts
const analytics = createAnalytics({ context, storage, sink })
const result = analytics.record({ kind: 'page', name: 'Home Viewed', once: true })
// result.status: 'delivered' | 'duplicate' | 'skipped' | 'failed'
```

`record` enriches the event with the current visitor context (consent,
experiment exposures, screen, user agent) and delivers it to the sink. Instead
of failing silently, it reports what it did with every event:

- `delivered` — the sink accepted the enriched event.
- `duplicate` — the event was marked `once` and was already delivered to this
  visitor. Markers live under `ab-testing:analytics:v1:<kind>:<name>` keys and
  are written only **after** successful delivery, so a failed delivery stays
  retryable.
- `skipped` — the context reports no consent; nothing is delivered and nothing
  is stored.
- `failed` — the sink threw; the reason is included in the result.

Exposures reach analytics through the context provider in `main.ts`, so every
recorded event carries which variants the visitor saw. The console sink prints
events during development; a real destination only needs to implement the
one-method `AnalyticsSink` interface.

## Known limitations

- **Client-side only.** Assignment happens in the browser after the page
  loads, so the original content can flash before a variant renders. A real
  setup would assign on the server or at the edge.
- **localStorage identity.** Assignments and delivery markers are per browser
  profile — a visitor switching devices or clearing storage is a new visitor.
- **Uniform split only.** Variants are equally likely; there is no traffic
  weighting, targeting, or scheduling (the variant objects leave room to add
  them).
- **Demo wiring.** Consent is granted up front in `main.ts` and events go to
  the console sink; a real integration would supply a consent flow and a
  network sink.
- **Static catalog.** The catalog ships with the bundle from
  `src/db/experiments.ts`; remote configuration is out of scope.
