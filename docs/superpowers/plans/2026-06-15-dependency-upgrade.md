# Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incrementally upgrade all dependencies across 4 waves (Wave 0: tests, Wave 1: ESM+toolchain, Wave 2: server deps, Wave 3: client deps), each gated by passing tests.

**Architecture:** Waves are sequential — each wave must fully pass its gate before the next begins. Within waves, tasks are ordered by dependency (e.g., ESM before ESM-only packages). Each task is self-contained with its own commit.

**Tech Stack:** Node.js 20, TypeScript, Jest, Vite, Express, React, Cypress, TypeDI

---

## Wave 0 — Expand Test Coverage

### Task 1: Add unit tests for `comparableUsername`

**Files:**
- Create: `server/express/utils/comparableUsername.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import { comparableUsername } from "./compareableUsername";

describe("comparableUsername", () => {
  it("should lowercase the username", () => {
    expect(comparableUsername("JohnDoe")).toBe("johndoe");
  });

  it("should remove whitespace", () => {
    expect(comparableUsername("John Doe")).toBe("johndoe");
  });

  it("should normalize unicode", () => {
    expect(comparableUsername("café")).toBe("café");
  });

  it("should replace ß with ss", () => {
    expect(comparableUsername("Straße")).toBe("strasse");
  });

  it("should replace ä with ae", () => {
    expect(comparableUsername("Bär")).toBe("baer");
  });

  it("should replace ö with oe", () => {
    expect(comparableUsername("Schön")).toBe("schoen");
  });

  it("should replace ü with ue", () => {
    expect(comparableUsername("Grün")).toBe("gruen");
  });

  it("should handle empty string", () => {
    expect(comparableUsername("")).toBe("");
  });

  it("should handle combined umlauts", () => {
    expect(comparableUsername("Müller Öhmäß")).toBe("muelleroehmaess");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=server -- --testPathPattern="comparableUsername"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add server/express/utils/comparableUsername.spec.ts
git commit -m "test: add unit tests for comparableUsername"
```

---

### Task 2: Add unit tests for `enrichParticipant`

**Files:**
- Create: `server/express/utils/enrichUser.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import { enrichParticipant } from "./enrichUser";
import { MeetingParticipant } from "../types/MeetingParticipant";
import { User } from "../types/User";

describe("enrichParticipant", () => {
  const participant: MeetingParticipant = {
    id: "1",
    username: "testuser",
  };
  const user: User = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    imageUrl: "http://avatar.png",
  };

  it("should fill missing email from user", () => {
    const result = enrichParticipant(participant, user);
    expect(result.email).toBe("test@example.com");
  });

  it("should fill missing imageUrl from user", () => {
    const result = enrichParticipant(participant, user);
    expect(result.imageUrl).toBe("http://avatar.png");
  });

  it("should not overwrite existing email", () => {
    const withEmail = { ...participant, email: "existing@example.com" };
    const result = enrichParticipant(withEmail, user);
    expect(result.email).toBe("existing@example.com");
  });

  it("should not overwrite existing imageUrl", () => {
    const withImage = { ...participant, imageUrl: "http://existing.png" };
    const result = enrichParticipant(withImage, user);
    expect(result.imageUrl).toBe("http://existing.png");
  });

  it("should preserve other participant fields", () => {
    const result = enrichParticipant(participant, user);
    expect(result.id).toBe("1");
    expect(result.username).toBe("testuser");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=server -- --testPathPattern="enrichUser"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add server/express/utils/enrichUser.spec.ts
git commit -m "test: add unit tests for enrichParticipant"
```

---

### Task 3: Add unit tests for `ClientConfigService`

**Files:**
- Create: `server/services/ClientConfigService.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import "reflect-metadata";
import { Container } from "typedi";
import { ClientConfigService } from "./ClientConfigService";
import { Config } from "../Config";

describe("ClientConfigService", () => {
  let service: ClientConfigService;

  beforeEach(() => {
    Container.reset();
    const config = Container.get(Config);
    service = new ClientConfigService(config);
  });

  afterEach(() => {
    Container.reset();
  });

  it("should return default config when no clientConfig provided", () => {
    const result = service.getClientConfig();
    expect(result.viewMode).toBe("grid");
    expect(result.theme).toBe("dark");
  });

  it("should merge partial clientConfig overrides", () => {
    service.updateClientConfig({ theme: "light" });
    const result = service.getClientConfig();
    expect(result.theme).toBe("light");
    expect(result.viewMode).toBe("grid");
  });

  it("should notify listeners on config change", () => {
    const listener = jest.fn();
    service.listenClientConfig(listener);
    service.updateClientConfig({ theme: "light" });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ theme: "light" }));
  });

  it("should support multiple listeners", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    service.listenClientConfig(listener1);
    service.listenClientConfig(listener2);
    service.updateClientConfig({ viewMode: "list" });
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it("should accumulate updates", () => {
    service.updateClientConfig({ theme: "light" });
    service.updateClientConfig({ viewMode: "list" });
    const result = service.getClientConfig();
    expect(result.theme).toBe("light");
    expect(result.viewMode).toBe("list");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=server -- --testPathPattern="ClientConfigService"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add server/services/ClientConfigService.spec.ts
git commit -m "test: add unit tests for ClientConfigService"
```

---

### Task 4: Add unit tests for `ensureLoggedIn` middleware

**Files:**
- Create: `server/express/middleware/ensureLoggedIn.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import "reflect-metadata";
import { Container } from "typedi";
import { Config } from "../../Config";
import ensureLoggedIn, { AuthenticatedRequest } from "./ensureLoggedIn";
import { Request, Response, NextFunction } from "express";

describe("ensureLoggedIn", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: jest.Mock;
  let endSpy: jest.Mock;
  let cookieSpy: jest.Mock;
  let nextSpy: jest.Mock;

  beforeEach(() => {
    Container.reset();
    statusSpy = jest.fn().mockReturnThis();
    endSpy = jest.fn();
    cookieSpy = jest.fn();
    nextSpy = jest.fn();
    mockReq = {
      signedCookies: {},
    };
    mockRes = {
      status: statusSpy,
      end: endSpy,
      cookie: cookieSpy,
    };
  });

  afterEach(() => {
    Container.reset();
  });

  function setConfig(authConfig: any) {
    process.env.DISABLE_AUTH = authConfig ? undefined : "true";
    if (authConfig) {
      process.env.AUTH_TYPE = authConfig.type;
      if (authConfig.type === "basic") {
        process.env.AUTH_USERNAME = authConfig.username;
        process.env.AUTH_PASSWORD = authConfig.password;
      }
    }
    const config = Container.get(Config);
    (config as any).authConfig = authConfig;
  }

  it("should call next() when auth is disabled", () => {
    setConfig({ type: "disabled" });
    ensureLoggedIn(mockReq as Request, mockRes as Response, nextSpy);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("should return 401 when no auth config found", () => {
    setConfig(null);
    ensureLoggedIn(mockReq as Request, mockRes as Response, nextSpy);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(endSpy).toHaveBeenCalled();
  });

  it("should call next() when valid user in signed cookie", () => {
    setConfig({ type: "basic", username: "admin", password: "pass" });
    mockReq.signedCookies = { currentUser: JSON.stringify({ id: "basic" }) };
    ensureLoggedIn(mockReq as Request, mockRes as Response, nextSpy);
    expect(nextSpy).toHaveBeenCalled();
  });

  it("should set currentUser on request when cookie is valid", () => {
    setConfig({ type: "disabled" });
    mockReq.signedCookies = { currentUser: JSON.stringify({ id: "123", name: "Test" }) };
    ensureLoggedIn(mockReq as Request, mockRes as Response, nextSpy);
    expect((mockReq as AuthenticatedRequest).currentUser).toEqual({ id: "123", name: "Test" });
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=server -- --testPathPattern="ensureLoggedIn"`
Expected: All pass (may need adjustment depending on how Config initializes)

- [ ] **Step 3: Commit**

```bash
git add server/express/middleware/ensureLoggedIn.spec.ts
git commit -m "test: add unit tests for ensureLoggedIn middleware"
```

---

### Task 5: Add integration tests for `MonitoringRoute`

**Files:**
- Create: `server/express/routes/MonitoringRoute.integration.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import "reflect-metadata";
import { Container } from "typedi";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import request from "supertest";

const config = {
  rooms: [],
  groups: [],
};

describe("MonitoringRoute", () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  it("should return 200 OK on /api/monitoring/health", async () => {
    await request((server as any).app)
      .get("/api/monitoring/health")
      .expect(200);
  });

  it("should return OK text on health endpoint", async () => {
    const response = await request((server as any).app)
      .get("/api/monitoring/health");
    expect(response.text).toBe("OK");
  });
});
```

Note: The `TestServer` class wraps `supertest` but doesn't expose the express app directly. If `server as any.app` doesn't work, adjust `startTestServerWithConfig.ts` to expose the app, or use `request` on the existing test server differently. The integration test pattern in `GroupJoin.integration.spec.ts` uses `server.sendMeetingEvent` and `server.getParticipantIds` — extend `TestServer` with a generic request method if needed.

- [ ] **Step 2: Run the test and adjust if needed**

Run: `npm test --workspace=server -- --testPathPattern="MonitoringRoute"`
Expected: All pass (may need to adjust how supertest accesses the app)

- [ ] **Step 3: Commit**

```bash
git add server/express/routes/MonitoringRoute.integration.spec.ts
git commit -m "test: add integration tests for MonitoringRoute"
```

---

### Task 6: Add integration tests for `AdminRoute`

**Files:**
- Create: `server/express/routes/AdminRoute.integration.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import "reflect-metadata";
import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import { joinRoomEvent } from "../../testUtils/meetingEvents";
import request from "supertest";

const roomId = "1";
const config: ConfigOptions = {
  rooms: [{ meetingId: roomId, name: "Test Room", joinUrl: "https://zoom.us/j/1" }],
  groups: [],
};

describe("AdminRoute", () => {
  let server: TestServer;
  let app: any;

  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
    app = (server as any).app;
  });

  afterEach(() => {
    Container.reset();
  });

  it("should clear all participants", async () => {
    await server.sendMeetingEvent(joinRoomEvent(roomId, "user1", undefined));
    await request(app).post("/api/admin/clearAllParticipants").auth("admin", "admin").expect(200);
    expect(await server.getParticipantIds(roomId)).toEqual([]);
  });

  it("should require admin auth on admin endpoints", async () => {
    await request(app).post("/api/admin/clearAllParticipants").expect(401);
  });

  it("should end a room", async () => {
    await server.sendMeetingEvent(joinRoomEvent(roomId, "user1", undefined));
    await request(app).delete(`/api/admin/rooms/${roomId}`).auth("admin", "admin").expect(200);
    expect(await server.getParticipantIds(roomId)).toEqual([]);
  });
});
```

Note: Admin auth credentials come from the `Config.adminEndpointsCredentials`. In the test config, this may need to be set. Check how `Config` reads admin credentials and adjust the config accordingly. If `TestServer` doesn't expose the app, extend it similarly to Task 5.

- [ ] **Step 2: Run the test and adjust**

Run: `npm test --workspace=server -- --testPathPattern="AdminRoute"`
Expected: All pass (may need config adjustment for admin credentials)

- [ ] **Step 3: Commit**

```bash
git add server/express/routes/AdminRoute.integration.spec.ts
git commit -m "test: add integration tests for AdminRoute"
```

---

### Task 7: Add integration tests for `ApiRoute` (clientConfig + office endpoints)

**Files:**
- Create: `server/express/routes/ApiRoute.integration.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import "reflect-metadata";
import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import request from "supertest";

const config: ConfigOptions = {
  rooms: [
    { meetingId: "1", name: "Lobby", joinUrl: "https://zoom.us/j/1" },
  ],
  groups: [{ id: "g1", name: "Group One" }],
};

describe("ApiRoute", () => {
  let server: TestServer;
  let app: any;

  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
    app = (server as any).app;
  });

  afterEach(() => {
    Container.reset();
  });

  it("should return clientConfig on /api/clientConfig", async () => {
    const response = await request(app).get("/api/clientConfig").expect(200);
    expect(response.body).toBeDefined();
    expect(response.body.viewMode).toBeDefined();
  });

  it("should return office on /api/office when authenticated", async () => {
    const response = await request(app).get("/api/office").expect(200);
    expect(response.body.rooms).toBeDefined();
    expect(response.body.groups).toBeDefined();
  });
});
```

Note: Auth is disabled in test config (`DISABLE_AUTH=true`), so `ensureLoggedIn` should pass through. If it doesn't, add cookie headers.

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=server -- --testPathPattern="ApiRoute"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add server/express/routes/ApiRoute.integration.spec.ts
git commit -m "test: add integration tests for ApiRoute"
```

---

### Task 8: Extend `TestServer` to expose the Express app

Several integration tests above need direct `supertest` access. Currently `TestServer` only exposes helper methods.

**Files:**
- Modify: `server/testUtils/startTestServerWithConfig.ts`

- [ ] **Step 1: Update TestServer to expose the app**

In `server/testUtils/startTestServerWithConfig.ts`, change the `TestServer` class to expose `app`:

```ts
export class TestServer {
  public readonly app: Express;

  constructor(app: Express) {
    this.app = app;
  }
  // ... rest unchanged
}
```

And update the constructor call to pass `app` directly (remove `private readonly` and make it public).

- [ ] **Step 2: Run all existing server tests**

Run: `npm test --workspace=server`
Expected: All existing tests still pass

- [ ] **Step 3: Commit**

```bash
git add server/testUtils/startTestServerWithConfig.ts
git commit -m "refactor: expose Express app on TestServer"
```

---

### Task 9: Add unit tests for `selectGroupsWithRooms`

**Files:**
- Create: `client/src/selectGroupsWithRooms.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import { expect } from "chai";
import { selectGroupsWithRooms, GroupWithRooms } from "./selectGroupsWithRooms";
import { Room, RoomWithMeetingId } from "../../server/express/types/Room";
import { Group } from "../../server/express/types/Group";
import { Office } from "../../server/express/types/Office";
import { Meeting } from "../../server/express/types/Meeting";
import { keyBy } from "lodash";

const groupA: Group = { id: "a", name: "Group A" };
const groupB: Group = { id: "b", name: "Group B" };

const roomA1: RoomWithMeetingId = {
  meetingId: "1",
  roomId: "r1",
  name: "Room A1",
  groupId: groupA.id,
  joinUrl: "http://a1.join",
};
const roomB1: RoomWithMeetingId = {
  meetingId: "2",
  roomId: "r2",
  name: "Room B1",
  groupId: groupB.id,
  joinUrl: "http://b1.join",
};
const roomNoGroup: RoomWithMeetingId = {
  meetingId: "3",
  roomId: "r3",
  name: "No Group Room",
  joinUrl: "http://ng.join",
};

const meetings: Meeting[] = [
  { meetingId: "1", participants: [] },
  { meetingId: "2", participants: [] },
  { meetingId: "3", participants: [] },
];
const meetingsIndexed = keyBy(meetings, (m) => m.meetingId);

const office: Office = {
  groups: [groupA, groupB],
  rooms: [roomA1, roomB1, roomNoGroup],
};

describe("selectGroupsWithRooms", () => {
  it("should group rooms by their groupId", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "", office);
    const groupIds = result.map((g) => g.group.id);
    expect(groupIds).to.include(groupA.id);
    expect(groupIds).to.include(groupB.id);
  });

  it("should include rooms without a group under empty group", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "", office);
    const noGroup = result.find((g) => g.group.id === "");
    expect(noGroup).to.be.ok;
    expect(noGroup!.rooms).to.have.length(1);
    expect(noGroup!.rooms[0].roomId).to.equal("r3");
  });

  it("should filter rooms by search text", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "A1", office);
    const allRooms = result.flatMap((g) => g.rooms);
    expect(allRooms).to.have.length(1);
    expect(allRooms[0].name).to.equal("Room A1");
  });

  it("should exclude groups with no matching rooms", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "Room B1", office);
    const groupIds = result.map((g) => g.group.id);
    expect(groupIds).to.not.include(groupA.id);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=client -- --testPathPattern="selectGroupsWithRooms"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add client/src/selectGroupsWithRooms.spec.ts
git commit -m "test: add unit tests for selectGroupsWithRooms"
```

---

### Task 10: Add unit tests for `mapMeetingEventToMeetings`

**Files:**
- Create: `client/src/mapMeetingEventToMeetings.spec.ts`

- [ ] **Step 1: Write the test file**

```ts
import { expect } from "chai";
import { mapMeetingEventToMeetings } from "./mapMeetingEventToMeetings";
import { Meeting } from "../../server/express/types/Meeting";
import { MeetingEvent } from "../../server/express/types/MeetingEvent";

describe("mapMeetingEventToMeetings", () => {
  const participant = { id: "p1", username: "Alice" };

  it("should add a meeting if not yet present on join", () => {
    const event: MeetingEvent = {
      type: "join",
      meetingId: "m1",
      participant,
    };
    const result = mapMeetingEventToMeetings([], event);
    expect(result).to.have.length(1);
    expect(result[0].meetingId).to.equal("m1");
    expect(result[0].participants).to.have.length(1);
  });

  it("should add participant on join event", () => {
    const meetings: Meeting[] = [{ meetingId: "m1", participants: [] }];
    const event: MeetingEvent = {
      type: "join",
      meetingId: "m1",
      participant,
    };
    const result = mapMeetingEventToMeetings(meetings, event);
    expect(result[0].participants).to.have.length(1);
    expect(result[0].participants[0].id).to.equal("p1");
  });

  it("should remove participant on leave event", () => {
    const meetings: Meeting[] = [
      { meetingId: "m1", participants: [participant] },
    ];
    const event: MeetingEvent = {
      type: "leave",
      meetingId: "m1",
      participant,
    };
    const result = mapMeetingEventToMeetings(meetings, event);
    expect(result[0].participants).to.have.length(0);
  });

  it("should update participant on update event", () => {
    const updatedParticipant = { id: "p1", username: "Alice Updated", email: "alice@new.com" };
    const meetings: Meeting[] = [
      { meetingId: "m1", participants: [participant] },
    ];
    const event: MeetingEvent = {
      type: "update",
      meetingId: "m1",
      participant: updatedParticipant,
    };
    const result = mapMeetingEventToMeetings(meetings, event);
    expect(result[0].participants).to.have.length(1);
    expect(result[0].participants[0].username).to.equal("Alice Updated");
  });

  it("should not modify other meetings", () => {
    const otherParticipant = { id: "p2", username: "Bob" };
    const meetings: Meeting[] = [
      { meetingId: "m1", participants: [participant] },
      { meetingId: "m2", participants: [otherParticipant] },
    ];
    const event: MeetingEvent = {
      type: "join",
      meetingId: "m1",
      participant: { id: "p3", username: "Charlie" },
    };
    const result = mapMeetingEventToMeetings(meetings, event);
    const m2 = result.find((m) => m.meetingId === "m2");
    expect(m2!.participants).to.deep.equal([otherParticipant]);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test --workspace=client -- --testPathPattern="mapMeetingEventToMeetings"`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add client/src/mapMeetingEventToMeetings.spec.ts
git commit -m "test: add unit tests for mapMeetingEventToMeetings"
```

---

### Task 11: Add component smoke tests for `RoomCard`

**Files:**
- Create: `client/src/components/RoomCard.spec.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import React from "react";
import { render } from "@testing-library/react";
import RoomCard from "./RoomCard";
import { Room } from "../../../server/express/types/Room";

const room: Room = {
  roomId: "r1",
  name: "Test Room",
  joinUrl: "https://zoom.us/j/1",
  meetingId: "1",
  subtitle: "A test room",
};

describe("RoomCard", () => {
  it("should render the room name", () => {
    const { getByText } = render(
      <RoomCard room={room} participants={[]} isDisabled={false} isJoinable={true} isListMode={false} />
    );
    expect(getByText("Test Room")).toBeInTheDocument();
  });

  it("should render a join link when joinable and joinUrl present", () => {
    const { getByText } = render(
      <RoomCard room={room} participants={[]} isDisabled={false} isJoinable={true} isListMode={false} />
    );
    expect(getByText("Join")).toBeInTheDocument();
  });

  it("should not render join link when not joinable", () => {
    const { queryByText } = render(
      <RoomCard room={room} participants={[]} isDisabled={false} isJoinable={false} isListMode={false} />
    );
    expect(queryByText("Join")).not.toBeInTheDocument();
  });

  it("should render subtitle", () => {
    const { getByText } = render(
      <RoomCard room={room} participants={[]} isDisabled={false} isJoinable={true} isListMode={false} />
    );
    expect(getByText("A test room")).toBeInTheDocument();
  });

  it("should render disabled state with reduced opacity", () => {
    const { container } = render(
      <RoomCard room={room} participants={[]} isDisabled={true} isJoinable={true} isListMode={false} />
    );
    const card = container.firstChild;
    expect(card).toHaveStyle({ opacity: "0.65" });
  });
});
```

Note: This test requires `@testing-library/react` (already in devDeps) and `jest-dom` (already in setupTests.ts). The MUI `makeStyles` may need a ThemeProvider wrapper. If tests fail due to missing theme, wrap in a ThemeProvider or use `@material-ui/core/test-utils` render helpers.

- [ ] **Step 2: Run the test and adjust for MUI theme if needed**

Run: `npm test --workspace=client -- --testPathPattern="RoomCard"`
Expected: All pass (may need ThemeProvider wrapper)

- [ ] **Step 3: Commit**

```bash
git add client/src/components/RoomCard.spec.tsx
git commit -m "test: add component smoke tests for RoomCard"
```

---

### Task 12: Add component smoke tests for `Login`

**Files:**
- Create: `client/src/components/Login.spec.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import React from "react";
import { render } from "@testing-library/react";
import Login from "./Login";

describe("Login", () => {
  it("should render the Virtual Office heading", async () => {
    const { findByText } = render(<Login />);
    expect(await findByText("Virtual Office")).toBeInTheDocument();
  });

  it("should render a sign in with Slack button", async () => {
    const { findByAltText } = render(<Login />);
    expect(await findByAltText("Sign in with Slack")).toBeInTheDocument();
  });
});
```

Note: Login fetches `/api/clientConfig` on mount via axios. This will fail in test without mocking. You may need to mock axios or provide a test wrapper. If the component returns `null` before config loads, use `findByText` (async) to wait.

- [ ] **Step 2: Run the test and adjust for axios mocking if needed**

Run: `npm test --workspace=client -- --testPathPattern="Login"`
Expected: All pass (may need axios mock)

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Login.spec.tsx
git commit -m "test: add component smoke tests for Login"
```

---

### Task 13: Wave 0 gate — verify all tests pass

- [ ] **Step 1: Run all unit tests**

Run: `npm test --workspaces`
Expected: All pass (note: the existing `GroupJoin.integration.spec.ts` timeout test may still fail — that's a pre-existing issue)

- [ ] **Step 2: Run E2E tests** (manual — start server with `npm run start:e2e`, then `npm run cypress`)

- [ ] **Step 3: Commit any fixes needed to get tests green**

---

## Wave 1 — ESM Foundation + Toolchain

### Task 14: Add `type: "module"` and migrate config files to `.cjs`

**Files:**
- Modify: `package.json` (root) — add `"type": "module"`
- Modify: `server/package.json` — add `"type": "module"`
- Modify: `client/package.json` — add `"type": "module"`
- Rename: `server/jest.config.js` → `server/jest.config.cjs`
- Rename: `client/jest.config.js` → `client/jest.config.cjs`
- Modify: `server/tsconfig.json` — update `module` and `moduleResolution`
- Modify: `client/tsconfig.json` — update `module` and `moduleResolution`
- Modify: `server/index.ts` — ensure ESM-compatible imports
- Modify: `server/nodemon.json` — update exec command for ESM
- Modify: `server/package.json` scripts — update for ESM

- [ ] **Step 1: Add `type: "module"` to all package.json files**

In `package.json`, `server/package.json`, and `client/package.json`, add:
```json
"type": "module"
```

- [ ] **Step 2: Rename jest config files**

```bash
git mv server/jest.config.js server/jest.config.cjs
git mv client/jest.config.js client/jest.config.cjs
```

- [ ] **Step 3: Update server tsconfig.json for ESM**

In `server/tsconfig.json`, change:
```json
"module": "commonjs" → "Node16"
"moduleResolution": "node" → "Node16"
```

- [ ] **Step 4: Update client tsconfig.json for ESM**

In `client/tsconfig.json`, change:
```json
"module": "esnext" → "ESNext"
"moduleResolution": "node" → "bundler"
```

- [ ] **Step 5: Update server/nodemon.json for ESM**

```json
{
  "ext": "ts",
  "ignore": ["**/*.spec.ts"],
  "exec": "ts-node --esm --files ./index.ts"
}
```

- [ ] **Step 6: Update server package.json scripts for ESM**

The `start:e2e` script uses `node -r dotenv/config` which is CJS. For ESM:
```json
"start": "node build/server/index.js",
"start:e2e": "node --import dotenv/config build/server/index.js dotenv_config_path=../cypress/.env.test",
"serve:e2e": "nodemon --exec 'ts-node-esm --files ./index.ts'"
```

Note: `dotenv` v16+ supports `--import` for ESM. If still on v8, use a different approach (preloading via loader).

- [ ] **Step 7: Run all tests and fix breakages**

Run: `npm test --workspaces`
Expected: May have breakages from ESM migration. Fix iteratively.

Common fixes:
- Add `.js` extensions to relative imports in TypeScript files (required for Node16 moduleResolution)
- Update `ts-node` invocations to include `--esm` flag
- Handle `__dirname` usage (ESM doesn't have it — use `import.meta.dirname` in Node 20.11+ or `fileURLToPath`)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: migrate project to ESM (type:module)"
```

---

### Task 15: Upgrade TypeScript 4.9 → 5.x

**Files:**
- Modify: `server/package.json` — update typescript version
- Modify: `client/package.json` — update typescript version
- Modify: `package.json` (root) — update typescript version

- [ ] **Step 1: Update all typescript versions**

In all 3 package.json files, change:
```json
"typescript": "4.9.5" → "typescript": "^5.8.0"
```

- [ ] **Step 2: Install**

Run: `npm install`

- [ ] **Step 3: Build and test**

Run: `npm run buildAll && npm test --workspaces`
Expected: TS5 is mostly backward-compatible. Check for decorator metadata warnings.

- [ ] **Step 4: Fix any TypeScript 5 issues**

Common TS5 changes:
- `experimentalDecorators` + `emitDecoratorMetadata` still work but may warn
- `moduleResolution: "Node16"` or `"Bundler"` is recommended
- Some type narrowing improvements may surface previously-hidden errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: upgrade TypeScript 4.9 → 5.8"
```

---

### Task 16: Upgrade Jest 27 → 29 + ts-jest 27 → 29 + @types/jest 27 → 29

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`
- Modify: `server/jest.config.cjs`
- Modify: `client/jest.config.cjs`

- [ ] **Step 1: Update server devDependencies**

In `server/package.json`:
```json
"jest": "29.7.0"
"ts-jest": "29.3.2"
"@types/jest": "29.5.14"
"jest-junit": "16.0.0"
```

- [ ] **Step 2: Update client devDependencies**

In `client/package.json`:
```json
"ts-jest": "29.3.2"
"@types/jest": "29.5.14"
```

- [ ] **Step 3: Update jest config files for Jest 29**

In `server/jest.config.cjs`, add `testRunner` if needed and update transform:
```js
module.exports = {
  testRunner: "jest-circus/runner",
  reporters: ["default", "jest-junit"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/build/"],
  coverageReporters: ["lcov"],
  transform: {
    "^.+\\.ts?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testPathIgnorePatterns: ["/node-modules/", "/build/"],
};
```

In `client/jest.config.cjs`, update similarly:
```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
};
```

- [ ] **Step 4: Install and test**

Run: `npm install && npm test --workspaces`
Expected: Tests pass. If using `jasmine.DEFAULT_TIMEOUT_INTERVAL`, replace with `jest.setTimeout()`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: upgrade Jest 27 → 29, ts-jest 27 → 29"
```

---

### Task 17: Upgrade Vite 2 → 6 + plugin-react

**Files:**
- Modify: `client/package.json`
- Create: `client/vite.config.ts` (if not existing — the project doesn't have one currently)

- [ ] **Step 1: Update client devDependencies**

In `client/package.json`:
```json
"vite": "^6.0.0"
```
Remove:
```json
"@vitejs/plugin-react-refresh": "1.3.6"
```
Add:
```json
"@vitejs/plugin-react": "^4.0.0"
```

- [ ] **Step 2: Create `client/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 3: Install and build**

Run: `npm install && npm run build --workspace=client`
Expected: Build succeeds. Vite 6 config format is different but the defaults handle most cases.

- [ ] **Step 4: Fix any Vite 6 issues**

Common Vite 2 → 6 changes:
- Config `alias` format changed
- Some plugins may need updating
- `server` options may need adjustment
- CSS handling changes

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: upgrade Vite 2 → 6, plugin-react-refresh → plugin-react"
```

---

### Task 18: Upgrade Cypress 7 → 13 + @testing-library/cypress 8 → 10

**Files:**
- Modify: `package.json` (root)
- Delete: `cypress.json`
- Create: `cypress.config.ts`
- Modify: `cypress/support/index.ts` (may need updates for new plugin API)
- Modify: `cypress/support/commands.ts` (may need updates)
- Modify: `cypress/integration/*.ts` (migration may be needed)

- [ ] **Step 1: Update root devDependencies**

In `package.json`:
```json
"cypress": "^13.0.0"
"@testing-library/cypress": "^10.0.0"
```

- [ ] **Step 2: Create `cypress.config.ts` replacing `cypress.json`**

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:9000",
  },
});
```

- [ ] **Step 3: Delete `cypress.json`**

```bash
rm cypress.json
```

- [ ] **Step 4: Move integration tests to `cypress/e2e/` directory**

Cypress 10+ uses `cypress/e2e/` instead of `cypress/integration/`:
```bash
mkdir -p cypress/e2e
git mv cypress/integration/*.ts cypress/e2e/
```

- [ ] **Step 5: Update `cypress/support/index.ts` if needed**

Cypress 10+ changed the support file location and API. The support file should be at `cypress/support/e2e.ts` or configured in `cypress.config.ts`:
```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:9000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.ts",
  },
});
```

Rename support file if needed:
```bash
git mv cypress/support/index.ts cypress/support/e2e.ts
```

- [ ] **Step 6: Install and test**

Run: `npm install`
Then manually: start server with `npm run start:e2e`, run `npm run cypress`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: upgrade Cypress 7 → 13, migrate config to cypress.config.ts"
```

---

### Task 19: Upgrade nodemon 2 → 3, prettier 2 → 3, husky 7 → 9

**Files:**
- Modify: `server/package.json`
- Modify: `package.json` (root)
- Modify: `.husky/` files (if they exist)
- Modify: `server/nodemon.json` (if format changed)

- [ ] **Step 1: Update versions**

In `server/package.json`:
```json
"nodemon": "^3.0.0"
```

In `package.json` (root):
```json
"prettier": "^3.0.0"
"husky": "^9.0.0"
```

- [ ] **Step 2: Install**

Run: `npm install`

- [ ] **Step 3: Update husky configuration**

Husky 9 simplified config. Check `.husky/` directory:
- Remove `#!/usr/bin/env sh` and `. "$(dirname -- "$0")/_/husky.sh"` from hook files
- Replace with direct command in `.husky/pre-commit`:
```sh
npx lint-staged
```

- [ ] **Step 4: Run lint to verify prettier works**

Run: `npm run lint`
Expected: Prettier 3 is mostly backward-compatible. Check for changed default behavior.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: upgrade nodemon 2 → 3, prettier 2 → 3, husky 7 → 9"
```

---

### Task 20: Wave 1 gate — verify all tests pass

- [ ] **Step 1: Run all unit tests**

Run: `npm test --workspaces`
Expected: All pass

- [ ] **Step 2: Build client**

Run: `npm run buildAll`
Expected: Build succeeds

- [ ] **Step 3: Start server**

Run: `npm start`
Expected: Server starts without ESM/CJS errors

- [ ] **Step 4: Run E2E tests** (manual — start server with `npm run start:e2e`, then `npm run cypress`)

- [ ] **Step 5: Fix any remaining issues and commit**

---

## Wave 2 — Server Dependencies

### Task 21: Upgrade dotenv 8 → 16

**Files:**
- Modify: `server/package.json`
- Modify: `server/index.ts` (if dotenv API changed)

- [ ] **Step 1: Update version**

In `server/package.json`:
```json
"dotenv": "^16.0.0"
```

- [ ] **Step 2: Install and test**

Run: `npm install && npm test --workspace=server`
Expected: Dotenv 16 `config()` is backward-compatible. Multiline value parsing may differ — check `.env` files.

- [ ] **Step 3: Update server startup scripts if needed**

In `server/package.json`, the `start:e2e` script uses `dotenv/config` preloading. With dotenv 16 + ESM:
```json
"start:e2e": "node --import dotenv/config build/server/index.js"
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade dotenv 8 → 16"
```

---

### Task 22: Upgrade axios 0.30 → 1.x

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`
- Remove: `server/package.json` → `@types/axios`
- Search and update: all catch blocks using axios error handling

- [ ] **Step 1: Update versions and remove @types/axios**

In `server/package.json`:
```json
"axios": "^1.0.0"
```
Remove:
```json
"@types/axios": "0.14.4"
```

In `client/package.json`:
```json
"axios": "^1.0.0"
```

- [ ] **Step 2: Search for axios error handling patterns**

Search for patterns like:
- `error.response` — still works in v1 but `AxiosError` is now the standard
- `axios.isAxiosError()` — still works
- `error.response.data` — still works

Review files that use axios error handling:
- `server/services/ZoomWebhookService.ts` — already uses `axios.isAxiosError`
- `client/src/components/Dashboard.tsx` — uses `.catch()`
- `client/src/components/Login.tsx` — uses `.then()`

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspaces`
Expected: Most code should work. Axios v1 is backward-compatible for common patterns.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade axios 0.30 → 1.x, remove @types/axios"
```

---

### Task 23: Upgrade uuid 8 → 11 (ESM-only)

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`
- Search and update: all uuid imports

- [ ] **Step 1: Update versions**

In `server/package.json` and `client/package.json`:
```json
"uuid": "^11.0.0"
"@types/uuid": remove (types bundled in uuid v11)
```

Remove from both:
```json
"@types/uuid": "8.3.4"
```

- [ ] **Step 2: Search for uuid usage and ensure ESM-compatible imports**

Search for `import * as uuid` or `import { v4 }` patterns. UUID v11 exports named functions:
```ts
import { v4 as uuidv4 } from "uuid";
```

This pattern should already work with ESM. Verify all call sites.

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspaces`
Expected: All pass (ESM foundation from Wave 1 enables this)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade uuid 8 → 11, remove @types/uuid"
```

---

### Task 24: Upgrade pino 7 → 9 + pino-pretty

**Files:**
- Modify: `server/package.json`

- [ ] **Step 1: Update versions**

In `server/package.json`:
```json
"pino": "^9.0.0"
"pino-pretty": "^12.0.0"
```

- [ ] **Step 2: Search for pino transport configuration changes**

Pino v8+ changed how transports work. Search for `pino.transport()` or `pino-pretty` usage in the codebase.

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspace=server`
Expected: Pass. Pino v9 logging API is mostly backward-compatible. Transport config may need adjustment.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade pino 7 → 9, pino-pretty"
```

---

### Task 25: Upgrade luxon 2 → 3, @slack/web-api 6 → 7, swagger-ui-express 4 → 5, supertest 6 → 7

**Files:**
- Modify: `server/package.json`

- [ ] **Step 1: Update versions**

In `server/package.json`:
```json
"luxon": "^3.0.0"
"@slack/web-api": "^7.0.0"
"swagger-ui-express": "^5.0.0"
"supertest": "^7.0.0"
"@types/luxon": remove (bundled in luxon 3)
"@types/supertest": "^6.0.0"
"@types/swagger-ui-express": remove (bundled in v5)
```

Remove:
```json
"@types/luxon": "2.4.0"
"@types/swagger-ui-express": "4.1.8"
```

Note: `@slack/web-api` v7 is ESM-only — requires ESM foundation from Wave 1.

- [ ] **Step 2: Search for breaking changes**

- `luxon` 3: `Settings.defaultZone` may work differently
- `@slack/web-api` 7: API surface similar but ESM-only
- `swagger-ui-express` 5: `setup()` API may have changed
- `supertest` 7: mostly backward-compatible

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspace=server`
Expected: Tests pass with minor adjustments

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade luxon 3, @slack/web-api 7, swagger-ui-express 5, supertest 7"
```

---

### Task 26: Remove `@types/socket.io-client` (types bundled in socket.io-client v4)

**Files:**
- Modify: `server/package.json` (if present)
- Modify: `client/package.json`

- [ ] **Step 1: Remove from both package.json files**

Remove from `client/package.json`:
```json
"@types/socket.io-client": "1.4.36"
```

Check if it exists in `server/package.json` — the explore didn't find it there.

- [ ] **Step 2: Search for `@types/socket.io-client` imports**

Search codebase for any explicit imports from `@types/socket.io-client`. Remove them if found.

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspaces`
Expected: No breakage — socket.io-client v4 already bundles types

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove @types/socket.io-client (bundled in v4)"
```

---

### Task 27: Upgrade `@sinonjs/fake-timers` 8 → 14

**Files:**
- Modify: `server/package.json`
- Modify: `client/package.json`

- [ ] **Step 1: Update versions in both package.json files**

```json
"@sinonjs/fake-timers": "^14.0.0"
"@types/sinonjs__fake-timers": remove
```

- [ ] **Step 2: Install and test**

Run: `npm install && npm test --workspaces`
Expected: The `install()` and `clock.tick()` API is mostly stable. Check the GroupJoin integration test that was timing out.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: upgrade @sinonjs/fake-timers 8 → 14"
```

---

### Task 28: Wave 2 gate — verify all tests pass

- [ ] **Step 1: Run all unit tests**

Run: `npm test --workspaces`
Expected: All pass

- [ ] **Step 2: Run E2E tests** (manual)

- [ ] **Step 3: Fix any remaining issues and commit**

---

## Wave 3 — Client Dependencies (excl. MUI)

### Task 29: Upgrade React 17 → 18 + react-dom + @types/react

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/index.tsx` — `ReactDOM.render` → `createRoot`

- [ ] **Step 1: Update versions**

In `client/package.json`:
```json
"react": "^18.2.0"
"react-dom": "^18.2.0"
"@types/react": "^18.2.0"
"@types/react-dom": "^18.2.0"
```

- [ ] **Step 2: Migrate `ReactDOM.render` → `createRoot` in `client/src/index.tsx`**

Replace:
```tsx
import ReactDOM from "react-dom";
// ...
ReactDOM.render(
  <BrowserRouter>...</BrowserRouter>,
  document.getElementById("root")
);
```

With:
```tsx
import { createRoot } from "react-dom/client";
// ...
const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>...</BrowserRouter>
);
```

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspace=client`
Expected: React 18 is mostly backward-compatible. `createRoot` is the main change.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade React 17 → 18, migrate to createRoot"
```

---

### Task 30: Upgrade @testing-library/react 12 → 16, jest-dom 5 → 6, user-event 13 → 14

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/setupTests.ts` (if import path changes)

- [ ] **Step 1: Update versions**

In `client/package.json`:
```json
"@testing-library/react": "^16.0.0"
"@testing-library/jest-dom": "^6.0.0"
"@testing-library/user-event": "^14.0.0"
```

- [ ] **Step 2: Update `client/src/setupTests.ts`**

Replace:
```ts
import "@testing-library/jest-dom/extend-expect";
```

With:
```ts
import "@testing-library/jest-dom";
```

(jest-dom v6 changed the import path)

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspace=client`
Expected: Tests pass. @testing-library/react 16 requires React 18 (upgraded in Task 29).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade @testing-library/react 16, jest-dom 6, user-event 14"
```

---

### Task 31: Upgrade react-router-dom 5 → 6

**Files:**
- Modify: `client/package.json`
- Modify: `client/src/index.tsx` — `<Switch>` → `<Routes>`, `<Route>` syntax
- Modify: `client/src/components/Dashboard.tsx` — `useHistory` → `useNavigate`
- Search and update: all route-related code

- [ ] **Step 1: Update version**

In `client/package.json`:
```json
"react-router-dom": "^6.0.0"
"@types/react-router-dom": remove (types bundled in v6)
```

Remove:
```json
"@types/react-router-dom": "5.3.3"
```

- [ ] **Step 2: Migrate `client/src/index.tsx`**

Replace:
```tsx
import { BrowserRouter, Route, Switch } from "react-router-dom";
// ...
<Switch>
  <Route exact path="/" component={Dashboard} />
  <Route path="/login">
    <Login />
  </Route>
</Switch>
```

With:
```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
// ...
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/login" element={<Login />} />
</Routes>
```

Key changes:
- `<Switch>` → `<Routes>`
- `component={Dashboard}` → `element={<Dashboard />}`
- `exact` prop removed (v6 matches exactly by default)
- Children route syntax → `element` prop

- [ ] **Step 3: Migrate `client/src/components/Dashboard.tsx`**

Replace:
```tsx
import { useHistory } from "react-router-dom";
// ...
const history = useHistory();
// ...
axios.get("/api/me").catch(() => history.push("/login"));
```

With:
```tsx
import { useNavigate } from "react-router-dom";
// ...
const navigate = useNavigate();
// ...
axios.get("/api/me").catch(() => navigate("/login"));
```

- [ ] **Step 4: Search for any other react-router-dom usage**

Search for `useHistory`, `useParams`, `useRouteMatch`, `withRouter`, `Link`, `NavLink`, `Redirect` in client code.

- `Redirect` → `Navigate` component in v6
- `useRouteMatch` → `useMatch`
- `withRouter` → removed (use hooks instead)

- [ ] **Step 5: Install and test**

Run: `npm install && npm test --workspace=client`
Expected: Tests pass with updated router code

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: upgrade react-router-dom 5 → 6"
```

---

### Task 32: Upgrade chai 4 → 5 (ESM-only)

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: Update version**

In `client/package.json`:
```json
"chai": "^5.0.0"
```

Remove:
```json
"@types/chai": "5.2.3"
```

(Chai v5 bundles its own types)

- [ ] **Step 2: Check chai import compatibility**

Chai v5 is ESM-only. The current test files use:
```ts
import { expect } from "chai";
```

This should work with ESM (from Wave 1). If ts-jest needs configuration for ESM imports from chai, add to `client/jest.config.cjs`:
```js
moduleNameMapper: {
  "^chai$": "<rootDir>/node_modules/chai/index.js"
}
```

- [ ] **Step 3: Install and test**

Run: `npm install && npm test --workspace=client`
Expected: Tests pass. Chai v5 `expect` API is backward-compatible.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: upgrade chai 4 → 5"
```

---

### Task 33: Wave 3 gate — final verification

- [ ] **Step 1: Run all unit tests**

Run: `npm test --workspaces`
Expected: All pass

- [ ] **Step 2: Build client**

Run: `npm run buildAll`
Expected: Build succeeds

- [ ] **Step 3: Start server**

Run: `npm start`
Expected: Server starts

- [ ] **Step 4: Run E2E tests** (manual — start server with `npm run start:e2e`, then `npm run cypress`)

- [ ] **Step 5: Manual smoke test** — visit localhost:9000, verify login, rooms, schedule display

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: dependency upgrade complete — Waves 0-3 done"
```
