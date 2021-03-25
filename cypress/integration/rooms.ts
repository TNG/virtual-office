describe("Virtual Office", () => {
  it("shows an empty office", () => {
    cy.replaceOffice({ rooms: [], groups: [] });

    cy.visit("/");

    cy.contains("Virtual Office for Cypress");
  });

  it("shows an office with a room", () => {
    cy.replaceOffice({
      rooms: [{ roomId: "1", name: "A room", meetingId: "123", joinUrl: "http://fake-zoom.us/123" }],
      groups: [],
    });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", isJoinable: true });
    cy.findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/123");
  });

  it("shows an office with a non-zoom room (no meeting id)", () => {
    cy.replaceOffice({ rooms: [{ roomId: "1", name: "A room", joinUrl: "http://not-zoom.us/xyz" }], groups: [] });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", isJoinable: true, hasNoParticipantsView: true });

    cy.findByText("Join").parent("a").should("have.prop", "href", "http://not-zoom.us/xyz");
  });

  it("shows an office with two rooms", () => {
    cy.replaceOffice({
      rooms: [
        { roomId: "1", name: "A room", meetingId: "123", joinUrl: "http://fake-zoom.us/123" },
        {
          roomId: "2",
          name: "A second room",
          meetingId: "234",
          joinUrl: "http://fake-zoom.us/234",
          description: "A subtitle",
        },
      ],
      groups: [],
    });

    cy.visit("/");

    cy.get(".MuiCard-root").first().as("firstCard");
    cy.assertCard({ alias: "@firstCard", title: "A room", isJoinable: true });
    cy.get("@firstCard").findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/123");

    cy.get(".MuiCard-root").last().as("secondCard");
    cy.assertCard({ alias: "@secondCard", title: "A second room", description: "A subtitle", isJoinable: true });
    cy.get("@secondCard").findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/234");
  });

  it("shows an office with two rooms", () => {
    cy.replaceOffice({
      rooms: [
        { roomId: "1", name: "A room", meetingId: "123", joinUrl: "http://fake-zoom.us/123" },
        {
          roomId: "2",
          name: "A second room",
          meetingId: "234",
          joinUrl: "http://fake-zoom.us/234",
          description: "A subtitle",
        },
      ],
      groups: [],
    });

    cy.visit("/");

    cy.get(".MuiCard-root").first().as("firstCard");
    cy.assertCard({ alias: "@firstCard", title: "A room", isJoinable: true });
    cy.get("@firstCard").findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/123");

    cy.get(".MuiCard-root").last().as("secondCard");
    cy.assertCard({ alias: "@secondCard", title: "A second room", description: "A subtitle", isJoinable: true });
    cy.get("@secondCard").findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/234");
  });
});
