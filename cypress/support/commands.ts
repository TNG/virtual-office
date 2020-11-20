// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { Office } from "../../server/express/types/Office";

//@ts-ignore-next-line
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      replaceOffice(office: Office): void;
    }
  }
}

Cypress.Commands.add("replaceOffice", (office: Office) => {
  cy.request({
    method: "POST",
    url: "http://localhost:9000/api/admin/replaceOffice",
    body: office,
    auth: { username: "admin", password: "Testp4ssw0rd" },
  });
});

export {};
