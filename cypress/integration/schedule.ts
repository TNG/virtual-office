import { OfficeLegacy } from "../../server/express/types/OfficeLegacy";

describe("Schedule", () => {
  beforeEach(() => {
    // only mock setInterval and date, but not setTimeout to not break socket.io sockets
    cy.clock(new Date(Date.UTC(2020, 11, 18, 9, 49, 0)).getTime(), ["setInterval", "clearInterval", "Date"]);
  });

  describe("shows a schedule", () => {
    let office: OfficeLegacy;
    beforeEach(() => {
      office = {
        rooms: [],
        groups: [],
        schedule: {
          tracks: [],
          sessions: [],
        },
      };
    });

    describe("with a single track", () => {
      beforeEach(() => {
        office.schedule.tracks = [{ id: "track1", name: "Track 1" }];
      });

      describe("and a single room", () => {
        beforeEach(() => {
          office.rooms = [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }];
        });

        it("with a subtitle", () => {
          office.rooms = [
            { roomId: "1", name: "A room", subtitle: "With a subtitle", meetingId: "123", joinUrl: "join-url" },
          ];
          office.schedule.sessions = [{ start: "09:00", end: "11:00", roomId: "1", trackId: "track1" }];
          cy.replaceOffice(office);

          cy.visit("/");

          cy.get(".MuiCard-root").as("card");
          cy.assertCard({
            alias: "@card",
            title: "A room",
            subtitle: "(9:00 AM-11:00 AM UTC) With a subtitle",
            isJoinable: true,
          });
        });

        it("that is disabled", () => {
          office.schedule.sessions = [{ start: "10:00", end: "12:00", roomId: "1", trackId: "track1" }];
          cy.replaceOffice(office);

          cy.visit("/");

          cy.get(".MuiCard-root").as("card");
          cy.assertCard({ alias: "@card", title: "A room", subtitle: "(10:00 AM-12:00 PM UTC)", isJoinable: false });
        });

        it("that is active", () => {
          office.schedule.sessions = [{ start: "08:00", end: "10:00", roomId: "1", trackId: "track1" }];
          cy.replaceOffice(office);

          cy.visit("/");

          cy.get(".MuiCard-root").as("card");
          cy.assertCard({ alias: "@card", title: "A room", subtitle: "(8:00 AM-10:00 AM UTC)", isJoinable: true });
        });
      });
    });

    describe("with multiple tracks", () => {
      beforeEach(() => {
        office.schedule.tracks = [
          { id: "track1", name: "Track 1" },
          { id: "track2", name: "Track 2" },
          { id: "track3", name: "Track 3" },
        ];
      });

      it("and parallel sessions", () => {
        office.rooms = [
          { roomId: "1", name: "Session 1", meetingId: "123", joinUrl: "join-url" },
          { roomId: "2", name: "Session 2", meetingId: "123", joinUrl: "join-url" },
          { roomId: "3", name: "Session 3", meetingId: "123", joinUrl: "join-url" },
          { roomId: "4", name: "Session 4", meetingId: "123", joinUrl: "join-url" },
        ];
        office.schedule.sessions = [
          { start: "09:00", end: "12:00", roomId: "1", trackId: "track1" },
          { start: "10:00", end: "12:30", roomId: "2", trackId: "track2" },
          { start: "10:00", end: "14:00", roomId: "3", trackId: "track3" },
          { start: "14:00", end: "16:00", roomId: "4" },
        ];
        cy.replaceOffice(office);

        cy.visit("/");

        cy.findByText("Session 1").parents(".MuiCard-root").as("session1Card");
        cy.findByText("Session 2").parents(".MuiCard-root").as("session2Card");
        cy.findByText("Session 3").parents(".MuiCard-root").as("session3Card");
        cy.findByText("Session 4").parents(".MuiCard-root").as("session4Card");

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-12:00 PM UTC)",
          isJoinable: true,
        });
        cy.assertCard({
          alias: "@session2Card",
          title: "Session 2",
          subtitle: "(10:00 AM-12:30 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session3Card",
          title: "Session 3",
          subtitle: "(10:00 AM-2:00 PM UTC)",
          isJoinable: false,
        });

        tickMinutes(2); // 09:51

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-12:00 PM UTC)",
          isJoinable: true,
        });
        cy.assertCard({
          alias: "@session2Card",
          title: "Session 2",
          subtitle: "(10:00 AM-12:30 PM UTC)",
          isJoinable: true,
        });
        cy.assertCard({
          alias: "@session3Card",
          title: "Session 3",
          subtitle: "(10:00 AM-2:00 PM UTC)",
          isJoinable: true,
        });

        tickMinutes(10 + 120); // 12:01

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-12:00 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session2Card",
          title: "Session 2",
          subtitle: "(10:00 AM-12:30 PM UTC)",
          isJoinable: true,
        });
        cy.assertCard({
          alias: "@session3Card",
          title: "Session 3",
          subtitle: "(10:00 AM-2:00 PM UTC)",
          isJoinable: true,
        });

        tickMinutes(30); // 12:31

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-12:00 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session2Card",
          title: "Session 2",
          subtitle: "(10:00 AM-12:30 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session3Card",
          title: "Session 3",
          subtitle: "(10:00 AM-2:00 PM UTC)",
          isJoinable: true,
        });

        tickMinutes(120); // 14:31

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-12:00 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session2Card",
          title: "Session 2",
          subtitle: "(10:00 AM-12:30 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session3Card",
          title: "Session 3",
          subtitle: "(10:00 AM-2:00 PM UTC)",
          isJoinable: false,
        });
        cy.assertCard({
          alias: "@session4Card",
          title: "Session 4",
          subtitle: "(2:00 PM-4:00 PM UTC)",
          isJoinable: true,
        });
      });

      it("and sessions with groups", () => {
        office.groups = [{ id: "group1", name: "Group 1" }];
        office.rooms = [
          { roomId: "1", name: "Session 1", meetingId: "123", joinUrl: "join-url" },
          { roomId: "2", groupId: "group1", name: "Session 2", meetingId: "123", joinUrl: "join-url" },
          { roomId: "3", groupId: "group1", name: "Session 3", meetingId: "123", joinUrl: "join-url" },
        ];
        office.schedule.sessions = [
          { start: "09:00", end: "10:00", roomId: "1", trackId: "track1" },
          { start: "10:00", end: "12:00", groupId: "group1" },
        ];
        cy.replaceOffice(office);

        cy.visit("/");

        cy.findByText("Session 1").parents(".MuiCard-root").as("session1Card");
        cy.findByText("Session 2").parents(".MuiCard-root").as("session2Card");
        cy.findByText("Session 3").parents(".MuiCard-root").as("session3Card");
        cy.findByText("Group 1").parents(".MuiCard-root").as("group1Card");

        cy.get("@group1Card").should("have.css", "opacity", "0.65");

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-10:00 AM UTC)",
          isJoinable: true,
        });
        cy.assertCard({ alias: "@session2Card", title: "Session 2", isJoinable: false });
        cy.assertCard({ alias: "@session3Card", title: "Session 3", isJoinable: false });

        tickMinutes(12); // 10:01

        cy.get("@group1Card").should("have.css", "opacity", "1");

        cy.assertCard({
          alias: "@session1Card",
          title: "Session 1",
          subtitle: "(9:00 AM-10:00 AM UTC)",
          isJoinable: false,
        });
        cy.assertCard({ alias: "@session2Card", title: "Session 2", isJoinable: true });
        cy.assertCard({ alias: "@session3Card", title: "Session 3", isJoinable: true });
      });
    });
  });

  it("should enable a card when the start time is reached", () => {
    cy.replaceOffice({
      rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }],
      groups: [],
      schedule: {
        tracks: [{ id: "track1", name: "Track 1" }],
        sessions: [{ start: "10:00", end: "12:00", roomId: "1", trackId: "track1" }],
      },
    });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", subtitle: "(10:00 AM-12:00 PM UTC)", isJoinable: false });

    tickMinutes(11);

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", subtitle: "(10:00 AM-12:00 PM UTC)", isJoinable: true });
  });

  it("should disable a card when the end time is reached", () => {
    cy.replaceOffice({
      rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }],
      groups: [],
      schedule: {
        tracks: [{ id: "track1", name: "Track 1" }],
        sessions: [{ start: "08:00", end: "10:00", roomId: "1", trackId: "track1" }],
      },
    });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", subtitle: "(8:00 AM-10:00 AM UTC)", isJoinable: true });

    tickMinutes(11); // 10:01

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", subtitle: "(8:00 AM-10:00 AM UTC)", isJoinable: false });
  });
});

const tickMinutes = (minutes: number) => {
  cy.tick(1000 * 60 * minutes);
};
