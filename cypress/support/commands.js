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
// Cypress.Commands.add('login', (email, password) => { ... })

/* globals Cypress cy */
import "cypress-file-upload";
import helpers from "./helpers";
import { GraphQLClient, request } from 'graphql-request'
import { gql } from '../../backend/src/helpers/jest'
import config from '../../backend/src/config'
import encode from '../../backend/src/jwt/encode'

const switchLang = name => {
  cy.get(".locale-menu").click();
  cy.contains(".locale-menu-popover a", name).click();
};

const authenticatedHeaders = (variables) => {
  const mutation = gql`
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password)
    }
  `
  return new Cypress.Promise((resolve, reject) => {
    request(config.GRAPHQL_URI, mutation, variables).then((response) => {
      resolve({ authorization: `Bearer ${response.login}` })
    })
  })
}

Cypress.Commands.add("switchLanguage", (name, force) => {
  const { code } = helpers.getLangByName(name);
  if (force) {
    switchLang(name);
  } else {
    cy.get("html").then($html => {
      if ($html && $html.attr("lang") !== code) {
        switchLang(name);
      }
    });
  }
});

Cypress.Commands.add("login", user => {
  const token = encode(user)
  cy.setCookie('human-connection-token', token)
    .visit("/")
});

Cypress.Commands.add("manualLogin", ({ email, password }) => {
  cy.visit(`/login`)
    .get("input[name=email]")
    .trigger("focus")
    .type(email)
    .get("input[name=password]")
    .trigger("focus")
    .type(password)
    .get("button[name=submit]")
    .as("submitButton")
    .click();
});

Cypress.Commands.add("logout", () => {
  cy.visit(`/logout`);
  cy.location("pathname").should("contain", "/login"); // we're out
});

Cypress.Commands.add("openPage", page => {
  if (page === "landing") {
    page = "";
  }
  cy.visit(`/${page}`);
});

Cypress.Commands.add(
  'authenticateAs',
  ({email, password}) => {
    return new Cypress.Promise((resolve, reject) => {
      authenticatedHeaders({ email, password }).then((headers) => {
        resolve(new GraphQLClient(config.GRAPHQL_URI, { headers }))
      })
    })
  })

Cypress.Commands.add(
  'mutate',
  { prevSubject: true },
  (graphQLClient, mutation, variables) => {
    return new Cypress.Promise((resolve, reject) => {
      graphQLClient.request(mutation, variables).then(() => resolve(graphQLClient))
    })
  })

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
