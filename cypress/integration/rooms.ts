describe("Rooms", () => {
  it("shows an empty office", () => {
    cy.replaceOffice({ rooms: [], groups: [] });

    cy.visit("/");

    cy.contains("Virtual Office for Cypress");
  });

  it("shows an office with a room", () => {
    cy.replaceOffice({ rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }], groups: [] });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", isJoinable: true });
  });

  it("shows an office with two rooms", () => {
    cy.replaceOffice({
      rooms: [
        { roomId: "1", name: "A room", meetingId: "123", joinUrl: "123-join-url" },
        { roomId: "2", name: "A second room", meetingId: "234", joinUrl: "234-join-url", subtitle: "A subtitle" },
      ],
      groups: [],
    });

    cy.visit("/");

    cy.get(".MuiCard-root").first().as("firstCard");
    cy.assertCard({ alias: "@firstCard", title: "A room", isJoinable: true });

    cy.get(".MuiCard-root").last().as("secondCard");
    cy.assertCard({ alias: "@secondCard", title: "A second room", subtitle: "A subtitle", isJoinable: true });
  });
});
