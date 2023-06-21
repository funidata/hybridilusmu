describe("Testing tests", () => {
  it("Asd", () => {
    const email = Cypress.env("USER_EMAIL");
    const password = Cypress.env("USER_PASSWORD");
    cy.visit("sign_in_with_password");
    cy.get('[data-qa="login_email"]').type(email);
    cy.get('[data-qa="login_password"]').type(password);
    cy.get('[data-qa="signin_button"]').click();
    //cy.get(".p-message_pane__foreword_description__container_header").contains("asd");
    cy.contains("Welcome to the #lusmu channel");
  });
});
