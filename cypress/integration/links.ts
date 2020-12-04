describe("Virtual Office", () => {
  it("shows a room with links", () => {
    cy.replaceOffice({
      rooms: [
        {
          roomId: "1",
          name: "A room",
          meetingId: "123",
          joinUrl: "http://fake-zoom.us/123",
          links: [
            { text: "A link", href: "http://linked-page.com", icon: "http://asdkgjassjdgl.com/icon.jpg" },
            {
              text: "Another link",
              href: "http://another-linked-page.com",
              icon: "http://asdffsdkgjassjdgl.com/another-icon.jpg",
            },
          ],
        },
      ],
      groups: [],
    });

    cy.visit("/");

    cy.get(".MuiCard-root").as("card");
    cy.assertCard({ alias: "@card", title: "A room", isJoinable: true });
    cy.findByText("Join").parent("a").should("have.prop", "href", "http://fake-zoom.us/123");

    cy.findByText("A link").parent("a").as("firstLink");
    cy.get("@firstLink").should("have.prop", "href", "http://linked-page.com/");
    cy.get("@firstLink").children("img").should("have.prop", "src", "http://asdkgjassjdgl.com/icon.jpg");

    cy.findByText("Another link").parent("a").as("secondLink");
    cy.get("@secondLink").should("have.prop", "href", "http://another-linked-page.com/");
    cy.get("@secondLink").children("img").should("have.prop", "src", "http://asdffsdkgjassjdgl.com/another-icon.jpg");
  });
});
