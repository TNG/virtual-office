# npm → pnpm Migration Design

## Goal
Replace npm with pnpm as the package manager, using strict mode (no `shamefully-hoist`).

## Why pnpm
- Content-addressable store: deduplicates packages across projects, saves disk
- Strict symlink layout: prevents phantom dependencies (accessing packages not declared in package.json)
- Faster installs on CI (hard links from global store)
- `pnpm audit` same as npm, `pnpm why` for tracing

## Empirical Findings (pnpm Strict Mode Test)

| Area | Result | Issue |
|------|--------|-------|
| `pnpm install` | Pass | MUI 4 peer dep warnings (cosmetic) |
| Server tests | 15/15 pass | None |
| Client tests | 2/7 pass | `transformIgnorePatterns` doesn't match `.pnpm/` symlink paths → chai@5 ESM not transformed |
| Server build (tsc) | Fail | pino type resolution differs under strict symlinks → TS2769 on `log.info("msg", {data})` calls |
| Client build (vite) | Pass | Vite handles ESM natively |

## Changes

### New Files

**`pnpm-workspace.yaml`** — pnpm's workspace definition (replaces `"workspaces"` in package.json):
```yaml
packages:
  - client
  - server
```

**`.npmrc`** — pnpm config (no shamefully-hoist):
```ini
# MUI 4 peer dep warnings handled via pnpm.peerDependencyRules in root package.json
```

### Deleted Files
- `package-lock.json` → replaced by `pnpm-lock.yaml` (auto-generated)

### Root `package.json`
- Remove `"workspaces"` field (pnpm uses `pnpm-workspace.yaml`)
- Change `"engines"`: `"npm": ">=10"` → `"pnpm": ">=10"`
- Move `"overrides"` → `"pnpm.overrides"` (pnpm reads from this key)
- Add `"pnpm.peerDependencyRules.allowedVersions"` to silence MUI 4 peer dep warnings:
  ```json
  "pnpm": {
    "overrides": { ... existing overrides ... },
    "peerDependencyRules": {
      "allowedVersions": {
        "react": "^19",
        "react-dom": "^19",
        "@types/react": "^19"
      }
    }
  }
  ```
  **Why:** MUI 4 declares `react@"^16.8.0 || ^17.0.0"` as peer dep. We run React 19. MUI 4 works fine with React 19 but pnpm warns about the mismatch. This rule silences the warnings. Remove when MUI 4 is migrated to MUI 6+ (deferred, separate effort — 15 components need manual restyling from JSS/makeStyles to emotion/styled).
- Update scripts:
  - `installAll`: `npm install` → `pnpm install`
  - `buildAll`: `npm run build --workspaces` → `pnpm run --recursive build`
  - `testAll`: `npm test --workspaces` → `pnpm run --recursive test`
  - `start`: `npm start --workspace=server` → `pnpm --filter=virtual_office_server start`
  - `start:e2e`: `npm run start:e2e --workspace=server` → `pnpm --filter=virtual_office_server run start:e2e`

### Server `package.json`
- `"engines"`: `"npm": ">=10"` → `"pnpm": ">=10"`
- `format` script: `cd .. && npm run format` → `cd .. && pnpm run format`

### Client `package.json`
- `"engines"`: `"npm": ">=10"` → `"pnpm": ">=10"`

### Client Jest Config — `transformIgnorePatterns` Fix
With pnpm strict mode, ESM packages live under `node_modules/.pnpm/<pkg>/node_modules/<pkg>/` instead of `node_modules/<pkg>/`. The existing `transformIgnorePatterns` doesn't match these paths, so Jest skips transforming chai@5 (ESM-only), causing `SyntaxError: Unexpected token 'export'`.

Fix: update `transformIgnorePatterns` in `client/jest.config.cjs` to also cover `.pnpm/` paths. Pattern: allow transforming chai and any other ESM packages under `.pnpm/`:
```js
transformIgnorePatterns: [
  "node_modules/(?!(?:.pnpm/)?chai)"
]
```

### Server TypeScript — Pino Logging Fix
Under pnpm strict symlinks, TypeScript resolves pino's overloaded `info()` signatures differently. ~7 call sites where `log.info("message", { data })` causes TS2769 because the merge-object overload no longer matches.

Fix: switch to pino's object-first calling convention:
```ts
// Before (breaks under pnpm strict type resolution):
log.info("replacing office", { user, data })

// After (pino idiomatic form):
log.info({ user, data }, "replacing office")
```

Affected files (from build errors):
- `server/express/routes/AdminRoute.ts` (2 calls)
- `server/express/routes/ZoomUsWebHookRoute.ts` (1 call)
- `server/services/EventService.ts` (1 call)
- `server/services/ZoomWebhookService.ts` (2 calls)
- `server/declarations.d.ts` — add `declare module 'swagger-ui-express'` (was previously resolved via hoisted @types, now needs explicit declaration)

### Dockerfile
```dockerfile
FROM node:24 as build
ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile

COPY client ./client/
COPY server ./server/

RUN pnpm run --recursive build

FROM node:24
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile --prod

USER node

COPY --chown=node --from=build /app/client/build ./client/build
COPY --chown=node --from=build /app/server/build ./server/build

EXPOSE 9000

CMD [ "node", "server/build/server/index.js" ]
```

### `.github/workflows/build.yml`
- Add step after `setup-node`: `corepack enable pnpm`
- Replace all `npm` commands:
  - `npm install` → `pnpm install --frozen-lockfile`
  - `npm run lint` → `pnpm run lint`
  - `npm run build --workspaces` → `pnpm run --recursive build`
  - `npm test --workspace=server` → `pnpm --filter=virtual_office_server test`
  - `npm test --workspace=client` → `pnpm --filter=virtual-office-client test`
- Cypress action: `start: npm run start:e2e` → `start: pnpm --filter=virtual_office_server run start:e2e`

### `.github/renovate.json`
- Add `"lockFileMaintenance": { "enabled": true, "schedule": ["before 5am on Monday"] }` for pnpm-lock.yaml updates

## What Doesn't Change
- All dependency versions (no upgrades in this migration)
- Workspace structure (client + server)
- MUI 4 remains (separate future effort)
- `package.json` `"type": "module"` in all workspaces

## Verification Gates
1. `pnpm install` — succeeds, 0 peer dep errors (warnings silenced by peerDependencyRules)
2. `pnpm run --recursive build` — server tsc + client vite both pass
3. `pnpm run --recursive test` — 83/83 pass
4. `pnpm audit` — 0 vulnerabilities
5. Docker build succeeds
