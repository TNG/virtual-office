# npm → pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace npm with pnpm as the package manager, using strict mode (no shamefully-hoist).

**Architecture:** Remove npm workspaces config, add pnpm-workspace.yaml, fix the two strict-mode breakages (Jest transformIgnorePatterns for .pnpm symlink paths, pino type resolution for object-first logging), update all scripts/Dockerfile/CI to use pnpm commands.

**Tech Stack:** pnpm 10+, Node 24, corepack

**Spec:** `docs/superpowers/specs/2026-06-17-npm-to-pnpm-design.md`

---

### Task 1: Add pnpm workspace config and .npmrc

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - client
  - server
```

- [ ] **Step 2: Create .npmrc**

```ini
# MUI 4 peer dep warnings handled via pnpm.peerDependencyRules in root package.json
# (remove .npmrc entirely when MUI 4 is migrated to MUI 6+)
```

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml .npmrc
git commit -m "chore: add pnpm-workspace.yaml and .npmrc"
```

---

### Task 2: Update root package.json for pnpm

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove workspaces field, update engines, move overrides, add peerDependencyRules**

Replace the entire `package.json` content with:

```json
{
  "name": "virtual-office",
  "version": "0.1.0",
  "engines": {
    "node": ">=24",
    "pnpm": ">=10"
  },
  "devDependencies": {
    "@testing-library/cypress": "^10.0.0",
    "cypress": "^15.17.0",
    "husky": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.8.0"
  },
  "scripts": {
    "format": "prettier --write \"{client,server}/**/*.{ts,tsx,html,scss,js,md,json}\"",
    "lint": "prettier --check \"{client,server}/**/*.{ts,tsx,html,scss,js,md,json}\"",
    "installAll": "pnpm install",
    "buildAll": "pnpm run --recursive build",
    "testAll": "pnpm run --recursive test",
    "cypress": "TZ=Etc/UTC cypress run",
    "cypress:dev": "TZ=Etc/UTC cypress open",
    "start": "pnpm --filter=virtual_office_server start",
    "start:e2e": "pnpm --filter=virtual_office_server run start:e2e"
  },
  "type": "module",
  "pnpm": {
    "overrides": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "@types/react": "^19.0.0",
      "ws": "^8.21.0",
      "js-yaml": "^4.2.0"
    },
    "peerDependencyRules": {
      "allowedVersions": {
        "react": "^19",
        "react-dom": "^19",
        "@types/react": "^19"
      }
    }
  }
}
```

Note: `"workspaces"` removed (pnpm uses `pnpm-workspace.yaml`). `"overrides"` moved into `"pnpm.overrides"`. `"pnpm.peerDependencyRules.allowedVersions"` silences MUI 4's `react@"^16 || ^17"` peer dep warnings since MUI 4 works with React 19. Remove when MUI 4 is migrated.

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: switch root package.json from npm to pnpm"
```

---

### Task 3: Update server and client package.json engines

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`

- [ ] **Step 1: Update server engines and format script**

In `server/package.json`, change:
```json
"engines": {
  "node": ">=24",
  "npm": ">=10"
}
```
to:
```json
"engines": {
  "node": ">=24",
  "pnpm": ">=10"
}
```

And change the `format` script from:
```json
"format": "cd .. && npm run format",
```
to:
```json
"format": "cd .. && pnpm run format",
```

- [ ] **Step 2: Update client engines**

In `client/package.json`, change:
```json
"engines": {
  "node": ">=24",
  "npm": ">=10"
}
```
to:
```json
"engines": {
  "node": ">=24",
  "pnpm": ">=10"
}
```

- [ ] **Step 3: Commit**

```bash
git add server/package.json client/package.json
git commit -m "chore: switch server/client engines from npm to pnpm"
```

---

### Task 4: Fix server pino logging calls for pnpm strict types

**Files:**
- Modify: `server/express/routes/AdminRoute.ts`
- Modify: `server/express/routes/ZoomUsWebHookRoute.ts`
- Modify: `server/services/EventService.ts`
- Modify: `server/services/ZoomWebhookService.ts`

Under pnpm strict mode, TypeScript resolves pino's overloaded `info()`/`error()`/`debug()` signatures differently. The string-first-with-merge-object form `log.info("msg", {data})` fails TS2769 because pino's type overloads no longer match. Fix by switching to pino's idiomatic object-first form: `log.info({data}, "msg")`.

- [ ] **Step 1: Fix AdminRoute.ts**

In `server/express/routes/AdminRoute.ts`, change line 44-47:
```ts
      logger.info("replacing office", {
        user: req.auth.user,
        data: req.body,
      });
```
to:
```ts
      logger.info({ user: req.auth.user, data: req.body }, "replacing office");
```

And change line 53-56:
```ts
      logger.info("update clientConfig", {
        user: req.auth.user,
        data: req.body,
      });
```
to:
```ts
      logger.info({ user: req.auth.user, data: req.body }, "update clientConfig");
```

- [ ] **Step 2: Fix ZoomUsWebHookRoute.ts**

In `server/express/routes/ZoomUsWebHookRoute.ts`, change line 51-56:
```ts
      logger.info("Received an zoom.us notification", {
        event: event,
        meetingId: id,
        participant: loggableParticipant(participant, this.config.enableParticipantLogging),
        traceId,
      });
```
to:
```ts
      logger.info({
        event: event,
        meetingId: id,
        participant: loggableParticipant(participant, this.config.enableParticipantLogging),
        traceId,
      }, "Received an zoom.us notification");
```

- [ ] **Step 3: Fix EventService.ts**

In `server/services/EventService.ts`, change line 29:
```ts
        logger.error("Failed to track event", error);
```
to:
```ts
        logger.error({ error }, "Failed to track event");
```

- [ ] **Step 4: Fix ZoomWebhookService.ts**

In `server/services/ZoomWebhookService.ts`, change line 48:
```ts
        logger.debug("Mapping update", mappingUpdate);
```
to:
```ts
        logger.debug({ mappingUpdate }, "Mapping update");
```

And change line 51:
```ts
          logger.error("Could not send mapping update", { error: e.response?.data });
```
to:
```ts
          logger.error({ error: e.response?.data }, "Could not send mapping update");
```

- [ ] **Step 5: Commit**

```bash
git add server/express/routes/AdminRoute.ts server/express/routes/ZoomUsWebHookRoute.ts server/services/EventService.ts server/services/ZoomWebhookService.ts
git commit -m "fix: switch pino calls to object-first form for pnpm strict type resolution"
```

---

### Task 5: Add swagger-ui-express type declaration

**Files:**
- Modify: `server/declarations.d.ts`

Under pnpm strict mode, `@types/swagger-ui-express` (previously removed as a direct dep) is no longer resolved via hoisting. Add a module declaration instead.

- [ ] **Step 1: Add swagger-ui-express declaration**

In `server/declarations.d.ts`, add after the existing declarations:

```ts
declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  const swaggerUI: { serve: RequestHandler[]; setup: (options?: any) => RequestHandler };
  export default swaggerUI;
  export const serve: RequestHandler[];
  export const setup: (options?: any) => RequestHandler;
}
```

Full file content after edit:
```ts
declare module "passport-slack-oauth2";
declare module "dotenv" {
  export function config(options?: any): any;
}
declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  const swaggerUI: { serve: RequestHandler[]; setup: (options?: any) => RequestHandler };
  export default swaggerUI;
  export const serve: RequestHandler[];
  export const setup: (options?: any) => RequestHandler;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/declarations.d.ts
git commit -m "fix: add swagger-ui-express module declaration for pnpm strict resolution"
```

---

### Task 6: Fix client Jest transformIgnorePatterns for pnpm symlink layout

**Files:**
- Modify: `client/jest.config.cjs`

With pnpm strict mode, ESM packages live under `node_modules/.pnpm/<pkg>/node_modules/<pkg>/`. The current pattern `/node_modules/(?!(uuid|chai)/)` only matches the top-level path, not the `.pnpm/` symlink path. Jest skips transforming chai@5, causing `SyntaxError: Unexpected token 'export'`.

- [ ] **Step 1: Update transformIgnorePatterns**

In `client/jest.config.cjs`, change:
```js
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid|chai)/)",
  ],
```
to:
```js
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm/)?(?:uuid|chai)/)",
  ],
```

This pattern matches both `node_modules/chai/` (npm layout) and `node_modules/.pnpm/chai@5.x.x/node_modules/chai/` (pnpm layout).

- [ ] **Step 2: Commit**

```bash
git add client/jest.config.cjs
git commit -m "fix: update Jest transformIgnorePatterns for pnpm .pnpm symlink paths"
```

---

### Task 7: Switch to pnpm (delete package-lock.json, run pnpm install, verify)

**Files:**
- Delete: `package-lock.json`
- Generated: `pnpm-lock.yaml`

- [ ] **Step 1: Delete package-lock.json and node_modules**

```bash
rm -f package-lock.json
rm -rf node_modules
```

- [ ] **Step 2: Run pnpm install**

```bash
pnpm install
```

Expected: succeeds with no peer dependency errors. May show MUI 4 peer dep warnings (silenced by `peerDependencyRules`).

- [ ] **Step 3: Verify server build passes**

```bash
pnpm run --filter=virtual_office_server build
```

Expected: `tsc` exits with 0 errors.

- [ ] **Step 4: Verify client build passes**

```bash
pnpm run --filter=virtual-office-client build
```

Expected: `vite build` succeeds.

- [ ] **Step 5: Verify all tests pass**

```bash
pnpm run --recursive test -- --forceExit
```

Expected: 83/83 tests pass (15 server suites + 7 client suites).

- [ ] **Step 6: Verify 0 vulnerabilities**

```bash
pnpm audit
```

Expected: 0 vulnerabilities.

- [ ] **Step 7: Commit lockfile**

```bash
git add -A
git commit -m "chore: switch from package-lock.json to pnpm-lock.yaml"
```

---

### Task 8: Update Dockerfile for pnpm

**Files:**
- Modify: `Dockerfile`

- [ ] **Step 1: Rewrite Dockerfile for pnpm**

Replace the entire `Dockerfile` content with:

```dockerfile
FROM node:24 as build
ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app

RUN corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY client ./client/
COPY server ./server/

RUN pnpm run --recursive build

FROM node:24
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

USER node

COPY --chown=node --from=build /app/client/build ./client/build
COPY --chown=node --from=build /app/server/build ./server/build

EXPOSE 9000

CMD [ "node", "server/build/server/index.js" ]
```

Key changes: `corepack enable pnpm`, `pnpm install --frozen-lockfile`, `pnpm run --recursive build`, copy `pnpm-workspace.yaml` and `pnpm-lock.yaml` instead of `package-lock.json`, `--prod` flag for production stage.

- [ ] **Step 2: Commit**

```bash
git add Dockerfile
git commit -m "chore: update Dockerfile for pnpm"
```

---

### Task 9: Update GitHub Actions CI workflow for pnpm

**Files:**
- Modify: `.github/workflows/build.yml`

- [ ] **Step 1: Rewrite build.yml for pnpm**

Replace the entire `.github/workflows/build.yml` content with:

```yaml
name: Build

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  pre_job:
    # continue-on-error: true # Uncomment once integration is finished
    runs-on: ubuntu-latest
    # Map a step output to a job output
    outputs:
      should_skip: ${{ steps.skip_check.outputs.should_skip }}
    steps:
      - id: skip_check
        uses: fkirc/skip-duplicate-actions@master
        with:
          skip_after_successful_duplicate: true
          concurrent_skipping: 'same_content'

  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with:
        node-version: '24.x'
    - name: Enable pnpm
      run: corepack enable pnpm
    - name: pnpm install
      run: pnpm install --frozen-lockfile
    - name: lint
      run: pnpm run lint
    - name: build
      run: pnpm run --recursive build
    - name: test server
      run: pnpm --filter=virtual_office_server test
    - name: test client
      run: pnpm --filter=virtual-office-client test
    - name: Run cypress tests
      uses: cypress-io/github-action@v6
      with:
        start: pnpm --filter=virtual_office_server run start:e2e
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/build.yml
git commit -m "chore: update CI workflow for pnpm"
```

---

### Task 10: Update Renovate config for pnpm-lock.yaml

**Files:**
- Modify: `.github/renovate.json`

- [ ] **Step 1: Add lockFileMaintenance for pnpm-lock.yaml**

In `.github/renovate.json`, change:
```json
{
  "extends": [
    "config:recommended",
    ":automergeMinor",
    ":automergeBranch",
    ":gitSignOff",
    "schedule:daily"
  ],
  "ignoreDeps": [
    "prettier"
  ]
}
```
to:
```json
{
  "extends": [
    "config:recommended",
    ":automergeMinor",
    ":automergeBranch",
    ":gitSignOff",
    "schedule:daily"
  ],
  "ignoreDeps": [
    "prettier"
  ],
  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["before 5am on Monday"]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .github/renovate.json
git commit -m "chore: add lockFileMaintenance for pnpm-lock.yaml in Renovate"
```

---

### Task 11: Final verification

- [ ] **Step 1: Clean install from scratch**

```bash
rm -rf node_modules
pnpm install
```

Expected: succeeds with no errors.

- [ ] **Step 2: Full build**

```bash
pnpm run --recursive build
```

Expected: server tsc + client vite both pass.

- [ ] **Step 3: Full test suite**

```bash
pnpm run --recursive test
```

Expected: 83/83 tests pass.

- [ ] **Step 4: Audit**

```bash
pnpm audit
```

Expected: 0 vulnerabilities.

- [ ] **Step 5: Verify no stale npm references remain**

Search for `npm install`, `npm run`, `npm test`, `npm start`, `package-lock.json` in tracked files (excluding `package-lock.json` in `.gitignore` and `node_modules/`). Only allowed remaining references should be in docs (upgrade plan/spec).
