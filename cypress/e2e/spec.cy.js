describe('Add Vehicle', () => {
  it('should log in and add a new vehicle', () => {
    // Log in as admin
    cy.login('garagiste@vroumvroum.fr', 'Azerty@01');

    // Wait for navigation to dashboard
    cy.url().should('include', '/dashboard');

    // Fill out the vehicle form
    cy.get('input[name="marque"]').type('Renault');
    cy.get('input[name="modele"]').type('Mégane');
    cy.get('input[name="annee"]').type('2021');
    cy.get('select[name="client_id"]').select('2'); // Assumes the client with id 1 exists
    cy.get('input[name="plaque"]').type('AB123YZ');

    // Submit the form
    cy.get('button[type="submit"]').contains('Ajouter').click();

    // Verify the vehicle was added
    cy.get('ul').should('contain', 'Renault Mégane (2021) - AB123YZ');
  });
});
