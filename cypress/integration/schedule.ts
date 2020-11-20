describe("Schedule", () => {
  beforeEach(() => {
    // create the date in UTC so its always the same
    // no matter what local timezone the browser is running in
    cy.clock(new Date(Date.UTC(2020, 11, 18, 8, 0, 0)).getTime());
  });

  it("shows a schedule with a single track", () => {
    cy.replaceOffice({
      rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }],
      groups: [],
      schedule: {
        tracks: [{ id: "track1", name: "Track 1" }],
        sessions: [{ start: "10:00", end: "12:00", roomId: "1", trackId: "track1" }],
      },
    });

    cy.visit("http://localhost:8080");
    cy.get(".MuiCircularProgress-root");
    cy.tick(500);

    cy.get(".MuiCard-root").as("card");
    cy.get("@card").should("contain", "A room");
    cy.get("@card").should("not.contain", "No one is here");
    cy.get("@card").should("not.contain", "Join");
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

    cy.visit("http://localhost:8080");
    cy.get(".MuiCircularProgress-root");
    cy.tick(500);

    cy.get(".MuiCard-root").as("card");
    cy.get("@card").should("contain", "A room");
    cy.get("@card").should("not.contain", "No one is here");
    cy.get("@card").should("not.contain", "Join");

    cy.tick(1000 * 3600);

    cy.get(".MuiCard-root").as("card");
    cy.get("@card").should("contain", "A room");
    cy.get("@card").should("contain", "No one is here");
    cy.get("@card").should("contain", "Join");
  });
});
