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
    cy.get("@card").contains("A room");
    cy.get("@card").contains("No one is here");
    cy.get("@card").contains("Join");
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
    cy.get("@firstCard").contains("A room");
    cy.get("@firstCard").contains("No one is here");
    cy.get("@firstCard").contains("Join");

    cy.get(".MuiCard-root").last().as("secondCard");
    cy.get("@secondCard").contains("A second room");
    cy.get("@secondCard").contains("A subtitle");
    cy.get("@secondCard").contains("No one is here");
    cy.get("@secondCard").contains("Join");
  });
});
