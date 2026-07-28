# Dependency Upgrade Design

## Context

The project has significant dependency debt. Core packages are 2-6 major versions behind. Goal: update safely with incremental waves, each gated by passing tests.

## Decisions

- **Incremental waves** — not big-bang
- **Migrate to ESM** — add `type: "module"`, unlock uuid/chai latest
- **Defer MUI 4 → 6** — 15 components need manual restyling, separate future effort
- **Add tests first** — coverage gaps (0% React components, 7% server routes) make upgrades risky

## Pinned (not upgrading)

| Package | Reason |
|---------|--------|
| express 4 | v5 still pre-release |
| lodash 4 | Final release, no v5 |
| passport 0.7 | Stuck at 0.x, stable |
| ts-mockito | Unmaintained but functional |
| express-basic-auth | Unmaintained but functional |
| @material-ui/* | Deferred to future MUI migration |
| React 19 | Too fresh, stay on 18 |
| react-router-dom 7 | Too fresh, stay on 6 |

## Wave 0 — Expand Test Coverage

Add tests for untested areas most at risk during upgrades.

### Server

| Target | Test Type | Priority |
|--------|-----------|----------|
| `ExpressApp.ts` | Integration — app bootstrap, middleware order | High |
| `AuthRoute.ts` | Integration — login flow, redirect | High |
| `AdminRoute.ts` | Integration — admin protection | High |
| `ensureLoggedIn.ts` | Unit — auth middleware | High |
| `getAdminLoggedInMiddleware.ts` | Unit — admin middleware | High |
| `compareableUsername.ts` | Unit — string normalization | Medium |
| `enrichUser.ts` | Unit — user enrichment | Medium |
| `ZoomWebhookService.ts` | Unit — webhook processing | Medium |
| `ClientConfigService.ts` | Unit — config delivery | Low |
| `WebSocketController.ts` | Integration — socket events | Medium |
| `MonitoringRoute.ts` | Integration — health check | Low |
| `ApiRoute.ts` | Integration — API endpoints | Medium |

### Client

| Target | Test Type | Priority |
|--------|-----------|----------|
| `selectGroupsWithRooms.ts` | Unit — pure logic | High |
| `mapMeetingEventToMeetings.ts` | Unit — event mapping | High |
| `Dashboard.tsx` | Component smoke — renders rooms | Medium |
| `RoomCard.tsx` | Component smoke — renders card, join link | Medium |
| `Login.tsx` | Component smoke — renders login form | Medium |

### Gate

All new + existing tests pass (unit + E2E).

## Wave 1 — ESM Foundation + Toolchain

### Changes

1. Add `"type": "module"` to root, server, and client package.json
2. TypeScript 4.9 → 5.8 (latest stable)
3. Update tsconfig: `module` → `ESNext`, `moduleResolution` → `bundler` (client) / `node16` (server)
4. Migrate config files:
   - `jest.config.js` → `jest.config.cjs` (or rewrite as ESM `.mts`)
   - `vite.config.ts` — verify ESM compatibility
   - Other `.js` configs → `.cjs` where needed
5. Jest 27 → 29, ts-jest 27 → 29, @types/jest 27 → 29, jest-junit 13 → 16
6. Vite 2 → 6, `@vitejs/plugin-react-refresh` → `@vitejs/plugin-react` 4
7. Cypress 7 → 13, `@testing-library/cypress` 8 → 10
8. nodemon 2 → 3, prettier 2 → 3, husky 7 → 9

### Key Risks

- **Jest 27 → 29**: `testEnvironment` defaults changed, `jest-jasmine2` removed in favor of `jest-circus`. Check for `jasmine2`-specific globals (`jasmine.DEFAULT_TIMEOUT_INTERVAL`, etc.).
- **Cypress 7 → 13**: Config system rewritten (`cypress.json` → `cypress.config.ts`), plugin API changed.
- **Vite 2 → 6**: Config format changes, plugin API v2+.
- **ESM migration**: Server startup via `node -r dotenv/config` may need adjustment. `ts-node` ESM support requires `--loader ts-node/esm` or `tsconfig` changes.

### Gate

All tests pass (unit + E2E). Server starts. Client builds and renders.

## Wave 2 — Server Dependencies

### Changes

| Package | From | To | Breaking Notes |
|---------|------|----|----------------|
| dotenv | 8.6.0 | 16.x | Multiline handling changed, `processEnv` option added |
| axios | 0.30.2 | 1.x | Error handling rewrite — `error.response` structure changed, `AxiosError` class |
| uuid | 8.3.2 | 11.x | ESM-only (unlocked by Wave 1) |
| pino | 7.11.0 | 9.x | Transport API changed in v8+ |
| pino-pretty | 7.6.1 | Match pino 9 | Must match pino major |
| luxon | 2.5.2 | 3.x | Dropped Node 12, locale handling changes |
| @slack/web-api | 6.13.0 | 7.x | ESM-only, Node 18+ required |
| swagger-ui-express | 4.6.3 | 5.x | Uses swagger-ui-dist v5 |
| supertest | 6.2.4 | 7.x | API changes |
| @types/axios | 0.14.4 | Remove | Types bundled in axios v1 |
| @types/socket.io-client | 1.4.36 | Remove | Types bundled in socket.io-client v4 |
| @sinonjs/fake-timers | 8.1.0 | 14.x | API refinements |

### Key Risks

- **axios**: Error handling is the biggest change. Catch blocks using `error.response` need review.
- **dotenv**: Multiline `.env` values may parse differently.
- **pino**: Transport configuration format changed.

### Gate

All tests pass (unit + E2E).

## Wave 3 — Client Dependencies (excl. MUI)

### Changes

| Package | From | To | Breaking Notes |
|---------|------|----|----------------|
| react | 17.0.2 | 18.x | Concurrent features, `createRoot` replaces `ReactDOM.render` |
| react-dom | 17.0.2 | 18.x | Same |
| @types/react | 17.x | 18.x | Must match React major |
| @types/react-dom | 17.x | 18.x | Must match React major |
| @testing-library/react | 12.1.5 | 16.x | Requires React 18+ |
| @testing-library/jest-dom | 5.17.0 | 6.x | ESM-first |
| @testing-library/user-event | 13.5.0 | 14.x | API changes |
| react-router-dom | 5.3.4 | 6.x | `<Switch>` → `<Routes>`, relative routes, `useNavigate` replaces `useHistory` |
| chai | 4.5.0 | 5.x | ESM-only (unlocked by Wave 1) |
| uuid | 8.3.2 | 11.x | ESM-only |
| @sinonjs/fake-timers | 8.1.0 | 14.x | Same as server |
| @types/socket.io-client | 1.4.36 | Remove | Types bundled |

### Key Risks

- **react-router-dom 5 → 6**: Every route definition and navigation call changes. `<Switch>` → `<Routes>`, `useHistory()` → `useNavigate()`, route params access changed.
- **React 17 → 18**: `ReactDOM.render` → `createRoot`. Mostly backward-compatible but warns on deprecated APIs.
- **@testing-library/react 12 → 16**: Container-based rendering changes, async utilities updated.

### Gate

All tests pass (unit + E2E). Client builds and renders correctly.

## Deferred

| Item | Reason |
|------|--------|
| MUI 4 → 6 | 15 components need manual restyling. Codemod handles renames; styling migration is manual. Separate project. |
| Express 4 → 5 | v5 still in RC. Revisit when stable. |
| React 18 → 19 | Too fresh. |
| react-router-dom 6 → 7 | Too fresh. |
| ts-mockito → jest mocks | Functional, low priority. |
| express-basic-auth replacement | Functional, low priority. |
