// cypress/integration/spec2.js
describe('Teste End-to-End', () => {
  beforeEach(() => {

    cy.intercept({ method: 'GET', url: 'http://localhost:3000/products*' }, (req) => {
      const u = new URL(req.url)
      req.url = `http://host.docker.internal:3000${u.pathname}${u.search}`
    }).as('getProducts')

    cy.intercept({ method: 'GET', url: 'http://localhost:3000/shipping/*' }, (req) => {
      const u = new URL(req.url)
      req.url = `http://host.docker.internal:3000${u.pathname}${u.search}`
    }).as('calcFrete')

    cy.visit('/') // baseUrl deve ser http://host.docker.internal:5000
    cy.wait('@getProducts').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('Teste 1: Visita Página', () => {
    cy.location('pathname').should('match', /^\/?$|^\/index\.html$/)
  })

  it('Teste 2: Verifica item na página', () => {
    cy.get('[data-id="3"]', { timeout: 10000 })
      .should('contain.text', 'Design Patterns')
  })

  it('Teste 3: Calcula Frete', () => {
    cy.get('[data-id="3"]', { timeout: 10000 }).as('card')

    cy.get('@card').find('input[type="text"], input').first()
      .clear().type('10000-000')

    cy.get('@card').contains(/calcular frete/i).click()

    cy.wait('@calcFrete').its('response.statusCode').should('be.oneOf', [200, 304])

    cy.get('.swal-text', { timeout: 10000 })
      .should('contain.text', 'O frete é: R$')

    cy.get('.swal-button').click()
  })

  it('Tarefa #2: Testando a Compra de um Livro', () => {
    cy.get('[data-id="3"]', { timeout: 10000 }).as('card')
      .should('contain.text', 'Design Patterns')

    cy.get('@card').contains(/^comprar$/i)
      .should('be.visible')
      .click()

    cy.get('.swal-text', { timeout: 10000 })
      .should(($el) => {
        const txt = $el.text().trim().toLowerCase()
        expect(txt).to.include('sua compra foi realizada com sucesso')
      })

    cy.get('.swal-button', { timeout: 10000 }).click()
  })
})
