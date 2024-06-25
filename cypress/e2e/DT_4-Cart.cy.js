/// <reference types='Cypress' />

describe('Test cases for Cart flow', () => {
    let usuarios;
    let initialCartState;
    let initialItemCount;

    before(() => {
        cy.fixture('usuariosRegistrados').then((data) => {
            usuarios = data;
        });
    });

    beforeEach(() => {
        cy.setCookie('user_allowed_save_cookie', '%7B%2213%22%3A1%7D')
        cy.visit('/');
        cy.closeNewsletterPopup();

        // Captura el estado inicial del carrito
        cy.get('.counter.qty.empty, .counter.qty').invoke('text').then((text) => {
            initialCartState = text.trim();
        });

        // Captura el número inicial de productos en el carrito
        cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
            initialItemCount = parseInt(text.trim()) || 0;
        });
    });

    context('Cart flow', () => {

        //Verificar que se pueda eliminar un producto del CART y se realice la actualización del SUMMARY
        it('CART-001: Verify that a product can be removed from the CART and the SUMMARY update is performed', () => {

           // Selecciona una categoría de manera aleatoria
           cy.selectRandomCategory();

           // Espera a que los productos se carguen y selecciona uno aleatorio
           cy.get('#amasty-shopby-product-list .item.product.product-item', { timeout: 10000 }).should('be.visible').then(($products) => {
               const randomIndex = Math.floor(Math.random() * $products.length);
               cy.wrap($products).eq(randomIndex).find('.product-item-link').invoke('removeAttr', 'target').click();
           });

            // Espera adicional para asegurarte de que el contenido se ha cargado completamente
            cy.wait(5000);

            // Selecciona el contenedor de opciones de color específico con un tiempo de espera mayor
            cy.get('.swatch-attribute.color[data-attribute-code="color"]', { timeout: 10000 })
            .should('exist')
            .within(() => {
            // Verifica que hay opciones de color disponibles y visibles
            cy.get('.swatch-attribute-options .swatch-option.color', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .then($colors => {
            // Asegura que las opciones son visibles y selecciona una aleatoriamente
            const availableColors = $colors.filter((i, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
            if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            cy.wrap(availableColors).eq(randomIndex).click();
            } else {
            cy.log('No hay colores disponibles o visibles para seleccionar.');
            }
        });
        });

            cy.get('.swatch-attribute[data-attribute-code="size"] .swatch-attribute-options .swatch-option.text').then($options => {
                // Filtrar solo las opciones que están habilitadas
                const availableOptions = $options.filter((index, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
                if (availableOptions.length > 0) {
                  // Elige un índice aleatorio entre las opciones disponibles y habilitadas
                  const randomIndex = Math.floor(Math.random() * availableOptions.length);
                  // Realiza clic en la opción en el índice aleatorio
                  cy.wrap(availableOptions).eq(randomIndex).click({ force: true });
                } else {
                  // Manejar el caso en que no hay tallas disponibles
                  cy.log('No hay tallas disponibles para el color seleccionado.');
                }
              });  

           // Agrega el producto al carrito
           cy.get('#product-addtocart-button').click();

           cy.wait(8000)

           // Espera a que el estado del carrito cambie correctamente
           cy.get('.counter.qty.empty, .counter.qty').should(($newCartState) => {
               // Verifica si el estado del carrito cambió correctamente
               expect($newCartState.text().trim()).not.to.equal(initialCartState);
           });

           // Verifica si el número de productos en el carrito aumentó
           cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
               const finalItemCount = parseInt(text.trim()) || 0;
               // Si el carrito estaba inicialmente vacío, asegúrate de que ahora tiene al menos un producto
               // Si el carrito ya tenía productos, verifica que la cantidad haya aumentado
               if (initialItemCount === 0) {
               expect(finalItemCount).to.be.at.least(1);
               } else {
               expect(finalItemCount).to.be.greaterThan(initialItemCount);
               }
           });

           // Verifica si se muestra el mensaje de éxito
           cy.get('.message-success').should('be.visible');

           //POP UP CARRITO SE ABRE INMEDIATAMENTE CUANDO AGREGO AL CARRITO 
           //Selecciona el enlace 'Mi Carro' y haz clic en él
            //cy.get('a.action.showcart').click();

            // Selecciona el enlace 'Ver todo el carro' y haz clic en él
            cy.get('a.action.viewcart').click();

           // Verifica que la URL actual incluya el path específico
           cy.url().should('include', '/checkout/cart/');

           //Hace click en primer botón "Eliminar", es decir si hay más de un producto elimina el primero
           cy.get('a.action.action-delete[title="Eliminar"]').first().click();

            // Hacer clic en el enlace 'Explorar'
            cy.get('a.action.primary.continue').click();


           // Verifica que la URL actual incluya el path específico
           cy.url().should('include', '/cat_peru_store_view');
           
       });

        //Verificar que se puede reducir la cantidad a comprar de un producto y se realice la actualización del SUMMARY
        it('CART-004: Verify that the quantity to be purchased of a product can be reduced and the SUMMARY update is performed', () => {
            
            // Iniciar sesión utilizando el comando personalizado 'login'
            cy.login(usuarios[0].email, usuarios[0].password);
            
            // Selecciona una categoría de manera aleatoria
            cy.selectRandomCategory();

            // Espera a que los productos se carguen y selecciona uno aleatorio
            cy.get('#amasty-shopby-product-list .item.product.product-item', { timeout: 10000 }).should('be.visible').then(($products) => {
                const randomIndex = Math.floor(Math.random() * $products.length);
                cy.wrap($products).eq(randomIndex).find('.product-item-link').invoke('removeAttr', 'target').click();
            });

            // Espera adicional para asegurarte de que el contenido se ha cargado completamente
            cy.wait(5000);

            // Selecciona el contenedor de opciones de color específico con un tiempo de espera mayor
            cy.get('.swatch-attribute.color[data-attribute-code="color"]', { timeout: 10000 })
            .should('exist')
            .within(() => {
            // Verifica que hay opciones de color disponibles y visibles
            cy.get('.swatch-attribute-options .swatch-option.color', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .then($colors => {
            // Asegura que las opciones son visibles y selecciona una aleatoriamente
            const availableColors = $colors.filter((i, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
            if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            cy.wrap(availableColors).eq(randomIndex).click();
            } else {
            cy.log('No hay colores disponibles o visibles para seleccionar.');
            }
        });
        });

            cy.get('.swatch-attribute[data-attribute-code="size"] .swatch-attribute-options .swatch-option.text').then($options => {
                // Filtrar solo las opciones que están habilitadas
                const availableOptions = $options.filter((index, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
                if (availableOptions.length > 0) {
                  // Elige un índice aleatorio entre las opciones disponibles y habilitadas
                  const randomIndex = Math.floor(Math.random() * availableOptions.length);
                  // Realiza clic en la opción en el índice aleatorio
                  cy.wrap(availableOptions).eq(randomIndex).click({ force: true });
                } else {
                  // Manejar el caso en que no hay tallas disponibles
                  cy.log('No hay tallas disponibles para el color seleccionado.');
                }
              }); ;

            // Agrega el producto al carrito
            cy.get('#product-addtocart-button').click();

            cy.wait(8000)

            // Espera a que el estado del carrito cambie correctamente
            cy.get('.counter.qty.empty, .counter.qty').should(($newCartState) => {
                // Verifica si el estado del carrito cambió correctamente
                expect($newCartState.text().trim()).not.to.equal(initialCartState);
            });

            // Verifica si el número de productos en el carrito aumentó
            cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
                const finalItemCount = parseInt(text.trim()) || 0;
                // Si el carrito estaba inicialmente vacío, asegúrate de que ahora tiene al menos un producto
                // Si el carrito ya tenía productos, verifica que la cantidad haya aumentado
                if (initialItemCount === 0) {
                expect(finalItemCount).to.be.at.least(1);
                } else {
                expect(finalItemCount).to.be.greaterThan(initialItemCount);
                }
            });

            // Verifica si se muestra el mensaje de éxito
            cy.get('.message-success').should('be.visible');

            //POP UP CARRITO SE ABRE INMEDIATAMENTE CUANDO AGREGO AL CARRITO 
            // Selecciona el enlace 'Mi Carro' y haz clic en él
            //cy.get('a.action.showcart').click();

            // Selecciona el enlace 'Ver todo el carro' y haz clic en él
            cy.get('a.action.viewcart').click();

            // Verifica que la URL actual incluya el path específico
            cy.url().should('include', '/checkout/cart/');

            // Hacer clic en el botón para reducir la cantidad
            cy.get('button[title="Reduce the quantity"]').should('be.visible').and('not.be.disabled').first().click({ force: true });

        });

        //Verificar que se puede aumentar la cantidad a comprar de un producto y se realice la actualización del SUMMARY
        it('CART-005: Verify that the quantity of a product to be purchased can be increased and that the SUMMARY is updated.', () => {
           
            // Selecciona una categoría de manera aleatoria
            cy.selectRandomCategory();

            // Espera a que los productos se carguen y selecciona uno aleatorio
            cy.get('#amasty-shopby-product-list .item.product.product-item', { timeout: 10000 }).should('be.visible').then(($products) => {
                const randomIndex = Math.floor(Math.random() * $products.length);
                cy.wrap($products).eq(randomIndex).find('.product-item-link').invoke('removeAttr', 'target').click();
            });

            // Espera adicional para asegurarte de que el contenido se ha cargado completamente
            cy.wait(5000);

            // Selecciona el contenedor de opciones de color específico con un tiempo de espera mayor
            cy.get('.swatch-attribute.color[data-attribute-code="color"]', { timeout: 10000 })
            .should('exist')
            .within(() => {
            // Verifica que hay opciones de color disponibles y visibles
            cy.get('.swatch-attribute-options .swatch-option.color', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .then($colors => {
            // Asegura que las opciones son visibles y selecciona una aleatoriamente
            const availableColors = $colors.filter((i, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
            if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            cy.wrap(availableColors).eq(randomIndex).click();
            } else {
            cy.log('No hay colores disponibles o visibles para seleccionar.');
            }
        });
        });

            cy.get('.swatch-attribute[data-attribute-code="size"] .swatch-attribute-options .swatch-option.text').then($options => {
                // Filtrar solo las opciones que están habilitadas
                const availableOptions = $options.filter((index, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
                if (availableOptions.length > 0) {
                  // Elige un índice aleatorio entre las opciones disponibles y habilitadas
                  const randomIndex = Math.floor(Math.random() * availableOptions.length);
                  // Realiza clic en la opción en el índice aleatorio
                  cy.wrap(availableOptions).eq(randomIndex).click({ force: true });
                } else {
                  // Manejar el caso en que no hay tallas disponibles
                  cy.log('No hay tallas disponibles para el color seleccionado.');
                }
              }); ;

            // Agrega el producto al carrito
            cy.get('#product-addtocart-button').click();

            cy.wait(8000)

            // Espera a que el estado del carrito cambie correctamente
            cy.get('.counter.qty.empty, .counter.qty').should(($newCartState) => {
                // Verifica si el estado del carrito cambió correctamente
                expect($newCartState.text().trim()).not.to.equal(initialCartState);
            });

            // Verifica si el número de productos en el carrito aumentó
            cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
                const finalItemCount = parseInt(text.trim()) || 0;
                // Si el carrito estaba inicialmente vacío, asegúrate de que ahora tiene al menos un producto
                // Si el carrito ya tenía productos, verifica que la cantidad haya aumentado
                if (initialItemCount === 0) {
                expect(finalItemCount).to.be.at.least(1);
                } else {
                expect(finalItemCount).to.be.greaterThan(initialItemCount);
                }
            });

            // Verifica si se muestra el mensaje de éxito
            cy.get('.message-success').should('be.visible');

            //POP UP CARRITO SE ABRE INMEDIATAMENTE CUANDO AGREGO AL CARRITO 
            // Selecciona el enlace 'Mi Carro' y haz clic en él
            //cy.get('a.action.showcart').click();

            // Selecciona el enlace 'Ver todo el carro' y haz clic en él
            cy.get('a.action.viewcart').click();

            // Verifica que la URL actual incluya el path específico
            cy.url().should('include', '/checkout/cart/');

            cy.wait(5000)

            // Hacer clic en el botón para reducir la cantidad
            cy.get('button[title="Increase the quantity"]').should('be.visible').and('not.be.disabled').first().click({ force: true });

        });

        //Verificar que se pueda actualizar las opciones (atributos) de un producto en el CART
        it('CART-009: Verify that the options (attributes) of a product can be updated in the CART.', () => {
           
            // Iniciar sesión utilizando el comando personalizado 'login'
            cy.login(usuarios[0].email, usuarios[0].password);            
            
            // Selecciona una categoría de manera aleatoria
            cy.selectRandomCategory();

            // Espera a que los productos se carguen y selecciona uno aleatorio
            cy.get('#amasty-shopby-product-list .item.product.product-item', { timeout: 10000 }).should('be.visible').then(($products) => {
                const randomIndex = Math.floor(Math.random() * $products.length);
                cy.wrap($products).eq(randomIndex).find('.product-item-link').invoke('removeAttr', 'target').click();
            });

            // Espera adicional para asegurarte de que el contenido se ha cargado completamente
            cy.wait(5000);

            // Selecciona el contenedor de opciones de color específico con un tiempo de espera mayor
            cy.get('.swatch-attribute.color[data-attribute-code="color"]', { timeout: 10000 })
            .should('exist')
            .within(() => {
            // Verifica que hay opciones de color disponibles y visibles
            cy.get('.swatch-attribute-options .swatch-option.color', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .then($colors => {
            // Asegura que las opciones son visibles y selecciona una aleatoriamente
            const availableColors = $colors.filter((i, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
            if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            cy.wrap(availableColors).eq(randomIndex).click();
            } else {
            cy.log('No hay colores disponibles o visibles para seleccionar.');
            }
        });
        });

            cy.get('.swatch-attribute[data-attribute-code="size"] .swatch-attribute-options .swatch-option.text').then($options => {
                // Filtrar solo las opciones que están habilitadas
                const availableOptions = $options.filter((index, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
                if (availableOptions.length > 0) {
                  // Elige un índice aleatorio entre las opciones disponibles y habilitadas
                  const randomIndex = Math.floor(Math.random() * availableOptions.length);
                  // Realiza clic en la opción en el índice aleatorio
                  cy.wrap(availableOptions).eq(randomIndex).click({ force: true });
                } else {
                  // Manejar el caso en que no hay tallas disponibles
                  cy.log('No hay tallas disponibles para el color seleccionado.');
                }
              }); ; 

           // Agrega el producto al carrito
           cy.get('#product-addtocart-button').click();

            cy.wait(8000)

            // Espera a que el estado del carrito cambie correctamente
            cy.get('.counter.qty.empty, .counter.qty').should(($newCartState) => {
                // Verifica si el estado del carrito cambió correctamente
                expect($newCartState.text().trim()).not.to.equal(initialCartState);
            });

            // Verifica si el número de productos en el carrito aumentó
            cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
                const finalItemCount = parseInt(text.trim()) || 0;
                // Si el carrito estaba inicialmente vacío, asegúrate de que ahora tiene al menos un producto
                // Si el carrito ya tenía productos, verifica que la cantidad haya aumentado
                if (initialItemCount === 0) {
                expect(finalItemCount).to.be.at.least(1);
                } else {
                expect(finalItemCount).to.be.greaterThan(initialItemCount);
                }
            });

            // Verifica si se muestra el mensaje de éxito
            cy.get('.message-success').should('be.visible');

            //POP UP CARRITO SE ABRE INMEDIATAMENTE CUANDO AGREGO AL CARRITO 
            // Selecciona el enlace 'Mi Carro' y haz clic en él
            //cy.get('a.action.showcart').click();

            // Selecciona el enlace 'Ver todo el carro' y haz clic en él
            cy.get('a.action.viewcart').click();

            // Verifica que la URL actual incluya el path específico
            cy.url().should('include', '/checkout/cart/');

            //Hacer click en el primer botón "Editar" que en cuentre en el carrito, es decir en el primer producto de la lista
            cy.get('a.action.action-edit[title="Editar los parámetros del artículo"]').first().click();

            //Actualizar la cantidad de prodcuto añadido en carrito
            cy.get('#qty').clear().type('2')

            //Click en botón "Actualizar Carrito"
            cy.get('#product-updatecart-button').click()

            //Verificar mensaje de exito indicando que el producto fue actualizado
            cy.get('.message-success').should('contain.text','fueron actualizados en su Carro de la compra')

        });

        //Verificar que se pueda acceder a las product page de los productos existentes en el CART
        it('CART-011: Verify that the PDP of the products existing in the CART can be accessed.', () => {       
            
            // Selecciona una categoría de manera aleatoria
            cy.selectRandomCategory();

            // Espera a que los productos se carguen y selecciona uno aleatorio
            cy.get('#amasty-shopby-product-list .item.product.product-item', { timeout: 10000 }).should('be.visible').then(($products) => {
                const randomIndex = Math.floor(Math.random() * $products.length);
                cy.wrap($products).eq(randomIndex).find('.product-item-link').invoke('removeAttr', 'target').click();
            });

            // Espera adicional para asegurarte de que el contenido se ha cargado completamente
            cy.wait(5000);

            // Selecciona el contenedor de opciones de color específico con un tiempo de espera mayor
            cy.get('.swatch-attribute.color[data-attribute-code="color"]', { timeout: 10000 })
            .should('exist')
            .within(() => {
            // Verifica que hay opciones de color disponibles y visibles
            cy.get('.swatch-attribute-options .swatch-option.color', { timeout: 10000 })
            .should('have.length.greaterThan', 0)
            .then($colors => {
            // Asegura que las opciones son visibles y selecciona una aleatoriamente
            const availableColors = $colors.filter((i, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
            if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            cy.wrap(availableColors).eq(randomIndex).click();
            } else {
            cy.log('No hay colores disponibles o visibles para seleccionar.');
            }
        });
        });

            cy.get('.swatch-attribute[data-attribute-code="size"] .swatch-attribute-options .swatch-option.text').then($options => {
                // Filtrar solo las opciones que están habilitadas
                const availableOptions = $options.filter((index, el) => Cypress.$(el).is(':visible') && !Cypress.$(el).hasClass('disabled'));
                if (availableOptions.length > 0) {
                  // Elige un índice aleatorio entre las opciones disponibles y habilitadas
                  const randomIndex = Math.floor(Math.random() * availableOptions.length);
                  // Realiza clic en la opción en el índice aleatorio
                  cy.wrap(availableOptions).eq(randomIndex).click({ force: true });
                } else {
                  // Manejar el caso en que no hay tallas disponibles
                  cy.log('No hay tallas disponibles para el color seleccionado.');
                }
              }); ; 

           // Agrega el producto al carrito
           cy.get('#product-addtocart-button').click();

            cy.wait(8000)

            // Espera a que el estado del carrito cambie correctamente
            cy.get('.counter.qty.empty, .counter.qty').should(($newCartState) => {
                // Verifica si el estado del carrito cambió correctamente
                expect($newCartState.text().trim()).not.to.equal(initialCartState);
            });

            // Verifica si el número de productos en el carrito aumentó
            cy.get('.counter.qty .counter-number').invoke('text').then((text) => {
                const finalItemCount = parseInt(text.trim()) || 0;
                // Si el carrito estaba inicialmente vacío, asegúrate de que ahora tiene al menos un producto
                // Si el carrito ya tenía productos, verifica que la cantidad haya aumentado
                if (initialItemCount === 0) {
                expect(finalItemCount).to.be.at.least(1);
                } else {
                expect(finalItemCount).to.be.greaterThan(initialItemCount);
                }
            });

            // Verifica si se muestra el mensaje de éxito
            cy.get('.message-success').should('be.visible');

            //POP UP CARRITO SE ABRE INMEDIATAMENTE CUANDO AGREGO AL CARRITO 
            // Selecciona el enlace 'Mi Carro' y haz clic en él
            //cy.get('a.action.showcart').click();

            // Selecciona el enlace 'Ver todo el carro' y haz clic en él
            cy.get('a.action.viewcart').click();

            // Verifica que la URL actual incluya el path específico
            cy.url().should('include', '/checkout/cart/');

        // Agrupar ambos selectores y seleccionar aleatoriamente uno de los elementos encontrados
        cy.get('img.product-image-photo, strong.product-item-name').then($elements => {
            const randomIndex = Math.floor(Math.random() * $elements.length);
            cy.wrap($elements[randomIndex]).first().click();
            });
        });
    });
});
