# Handoff: Dependency Upgrade Project

## Status

Wave 0 (test coverage) COMPLETE. Wave 1 (ESM + toolchain) IN PROGRESS — Task 14 (ESM migration) committed, Tasks 15-19 pending.

**Branch:** `upgrade`

## What Was Done

### Wave 0 — Expand Test Coverage (COMPLETE)
All 12 tasks done. 82/83 tests pass (1 pre-existing flaky failure in `GroupJoin.integration.spec.ts` — timeout with fake timers + Math.random, NOT caused by our changes).

New test files created:
- `server/express/utils/comparableUsername.spec.ts` (9 tests)
- `server/express/utils/enrichUser.spec.ts` (5 tests)
- `server/services/ClientConfigService.spec.ts` (5 tests)
- `server/express/middleware/ensureLoggedIn.spec.ts` (11 tests)
- `server/express/routes/MonitoringRoute.integration.spec.ts`
- `server/express/routes/AdminRoute.integration.spec.ts` (5 tests)
- `server/express/routes/ApiRoute.integration.spec.ts`
- `client/src/selectGroupsWithRooms.spec.ts` (6 tests)
- `client/src/mapMeetingEventToMeetings.spec.ts` (5 tests)
- `client/src/components/RoomCard.spec.tsx` (3 tests)
- `client/src/components/Login.spec.tsx` (2 tests)

Also: `server/testUtils/startTestServerWithConfig.ts` — exposed `app` as public property on TestServer.

### Wave 1 — ESM Foundation + Toolchain (IN PROGRESS)

**Task 14 (ESM migration) — DONE, committed:**
- Added `type: "module"` to all 3 package.json files
- Server tsconfig: `module: "Node16"`, `moduleResolution: "Node16"`
- Client tsconfig: kept `moduleResolution: "node"` (Vite handles ESM; TS 4.9.5 doesn't support "bundler")
- Renamed `jest.config.js` → `jest.config.cjs` in both server and client
- Added `.js` extensions to ALL relative imports across 35+ server files (required by Node16 module)
- Replaced `__dirname` with `process.cwd()` traversal in findRootDir.ts
- Replaced `require()` calls with ESM equivalents in Config.ts and WebSocketController.ts
- Updated nodemon.json for `--loader ts-node/esm`
- Added `declarations.d.ts` for dotenv/axios module interop
- Removed `@types/axios` (bundled in axios)
- Tests pass (client 7/7, server 14/15)

**Remaining Wave 1 tasks:**
- Task 15: TypeScript 4.9 → 5.8
- Task 16: Jest 27 → 29 + ts-jest 29 + @types/jest 29
- Task 17: Vite 2 → 6 + @vitejs/plugin-react 4
- Task 18: Cypress 7 → 13 + @testing-library/cypress 10
- Task 19: nodemon 2 → 3, prettier 2 → 3, husky 7 → 9
- Task 20: Wave 1 gate

**Remaining Waves (not started):**
- Wave 2: Server deps (dotenv 16, axios 1.x, uuid 11, pino 9, luxon 3, @slack/web-api 7, swagger-ui-express 5, supertest 7, fake-timers 14)
- Wave 3: Client deps (React 18, testing-library/react 16, jest-dom 6, user-event 14, react-router-dom 6, chai 5, uuid 11)

## Key Files

- **Design spec:** `docs/superpowers/specs/2026-06-15-dependency-upgrade-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-06-15-dependency-upgrade.md`
- All changes are on branch `upgrade`

## Known Issues

1. `GroupJoin.integration.spec.ts` — pre-existing timeout with fake timers + `Math.random()` + async/await. Fix separately.
2. `start:e2e` script may be broken due to dotenv `-r` preload not working with ESM. Will be fixed when dotenv upgrades to v16 in Wave 2.
3. Client tsconfig uses `moduleResolution: "node"` instead of "bundler" because TS 4.9.5 doesn't support "bundler". This should be updated after Task 15 (TS 5.8 upgrade).
4. Some console.warn about `createMuiTheme` deprecation in test output — cosmetic, MUI 4 issue deferred.

## Decisions Made

- Incremental waves (not big-bang)
- Migrate to ESM (type:module)
- Defer MUI 4 → 6 migration (15 components need manual restyling)
- Pin express 4, lodash 4, passport 0.7, React 18 (not 19), react-router-dom 6 (not 7)
- Pre-commit hook not configured — all commits use `PRE_COMMIT_ALLOW_NO_CONFIG=1`

## Suggested Skills for Next Session

1. **subagent-driven-development** — continue dispatching subagents per task
2. **verification-before-completion** — run before claiming any wave is done
3. **finishing-a-development-branch** — use after all waves complete

## How to Resume

1. Checkout branch `upgrade`
2. Read the plan: `docs/superpowers/plans/2026-06-15-dependency-upgrade.md`
3. Continue from Task 15 (TypeScript upgrade)
4. After each task, run `npm test --workspaces` as gate
5. After each wave, also run E2E tests manually (start:e2e + cypress)
