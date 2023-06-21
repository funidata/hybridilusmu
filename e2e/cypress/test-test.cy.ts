describe("Testing tests", () => {
  it("Asd", () => {
    // cy.visit('')
    // Must use Cypress.env('baseUrl') as Cypress has a bug in resolving baseUrl from cypress.env.json files.
    // No problem because we will need a custom visit/login function anyways.
    const acualBaseUrl = Cypress.env("baseUrl");
    console.log(acualBaseUrl);
    cy.visit(acualBaseUrl);
    console.log("asd");
    cy.contains("Sign in to");
  });
});
