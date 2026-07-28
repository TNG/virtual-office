describe("Virtual Office", () => {
  before(() => {
    cy.clearAllParticipants();
  });

  it("shows an avatar when a user joins a room", () => {
    cy.replaceOffice({ rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "join-url" }], groups: [] });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", isJoinable: true });

    cy.webhook("meeting.participant_joined", "123", {
      id: "user1",
      user_id: "user1",
      user_name: "Test User",
    });

    cy.webhook("meeting.participant_joined", "123", {
      id: "user2",
      user_id: "user2",
      user_name: "Another User",
    });

    cy.get(".MuiAvatar-root").first().should("contain", "AU");
    cy.get(".MuiAvatar-root").last().should("contain", "TU");

    cy.webhook("meeting.participant_left", "123", {
      id: "user2",
      user_id: "user2",
      user_name: "Another User",
    });

    cy.get(".MuiAvatar-root").should("contain", "TU");

    cy.webhook("meeting.participant_left", "123", {
      id: "user1",
      user_id: "user1",
      user_name: "Test User",
    });

    cy.get("@card").should("contain", "No one is here");
  });
});
