/// <reference types='Cypress' />
import faker from 'faker'; // Importar faker

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

    context('Checkout flow', () => {

        //Verificar que usuario Guest puede avanzar al pago seleccionando "Despacho a dirección de domicilio/empresa" - Guest
        it('CO-001: Verify that Guest user can proceed to payment by selecting "Dispatch to home/business address" - Guest', () => {

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
        });;

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

           cy.wait(5000)

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

            // Selecciona el enlace 'Mi Carro' y haz clic en él
            cy.get('a.action.showcart').click();

            // Hacer clic en el botón 'Proceder al pago'
            cy.get('#top-cart-btn-checkout').click();

           cy.wait(5000)

           const emailAleatorio = faker.internet.email(null, null, "yopmail.com");
           cy.get('#customer-email').type(emailAleatorio)

           //Seleccionar tipo de despacho "Despacho a dirección de domicilio/empresa" 
           //cy.get('#tablerate').check();

            //Generar un nombre aleatorio usando faker si ya lo tienes incluido
            const randomFirstName = faker.name.firstName();
            const randomLastName = faker.name.lastName();
            const streetName = faker.address.streetName(); // Genera un nombre de calle aleatorio

            // Llenar el campo de texto usando su atributo 'name'
            cy.get('input[name="firstname"]').type(randomFirstName);        
            cy.get('input[name="lastname"]').type(randomLastName);



            // Selecciona un tipo de documento de forma aleatoria
            cy.selectDocumentTypeCO().then(typeSelected => {
            // Genera un número de identificación basado en el tipo seleccionado
            cy.generateIdentification(typeSelected).then(identificationNumber => {
            // Encuentra y completa el campo de identificación
            cy.get('input.input-text[name="custom_attributes[document]"]').type(identificationNumber);
            });
            });
    
            cy.get('select[name="region_id"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="region_id"]').select(randomValue);
              });

            cy.get('select[name="custom_attributes[province_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[province_id]"]').select(randomValue);
              });

              cy.get('select[name="custom_attributes[district_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[district_id]"]').select(randomValue);
              });
            
              cy.get('input[name="street[0]"]').type(streetName);

                // Genera un número aleatorio y lo convierte a cadena de texto.
                // Utiliza métodos de faker para asegurarse de que el número cumpla con la longitud máxima.
                const randomNumber = faker.datatype.number({ 'min': 10000, 'max': 9999999999 }).toString();

                // Genera una cadena aleatoria que podría ser utilizada como complemento de dirección.
                // Esta utiliza faker para generar un identificador hexadecimal (o cualquier otra cosa que prefieras)
                // y luego lo recorta a 25 caracteres para cumplir con la restricción.
                const complement = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[number]"]').type(complement);

                const deparment = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[department]"]').type(deparment);            

                cy.generateRandomPhoneNumber().then(phoneNumber => {
                  cy.get('input.input-text[name="telephone"]').type(phoneNumber);
                }); 

                //Seleccinar método de envío aleatoriamente
                cy.selectRandomShippingMethod();

                // Seleccionar el botón y hacer clic en él
                cy.get('button[data-role="opc-continue"]').click();
        });

        //Verificar que se realiza la validación de cuenta existente para un usuario Guest en el Checkout - GUEST
        it.skip('CO-004: Verify that existing account validation is performed for a Guest user in Checkout - GUEST', () => {
            
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
        });;
 
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
 
            cy.wait(5000)
 
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
 
             //Hacer click en botón para cerrar modal AÑADISTE A TU CARRO DE COMPRAS           
            cy.get('button.action-close').last().click();
            
            //Abrir pop up carrito
            cy.get('button.opencart').click();
 
            //Click en botón "Pagar" de pop up carrito
            cy.get('#top-cart-btn-checkout').click();
 
            cy.wait(5000)
 
            cy.fixture('usuariosRegistrados').then(usuario => {
                cy.get('#customer-email').clear().type(usuario[0].email)
            });
 
            //Seleccionar tipo de despacho "Despacho a dirección de domicilio/empresa" 
            //cy.get('#tablerate').check();
 
             //Generar un nombre aleatorio usando faker si ya lo tienes incluido
             const randomFirstName = faker.name.firstName();
             const randomLastName = faker.name.lastName();
             const streetName = faker.address.streetName(); // Genera un nombre de calle aleatorio
 
             // Llenar el campo de texto usando su atributo 'name'
             cy.get('input[name="firstname"]').type(randomFirstName);        
             cy.get('input[name="lastname"]').type(randomLastName);

             cy.fixture('usuariosRegistrados').then(usuario => {
                cy.get('select[name="custom_attributes[type_identification]"]').select(usuario[0].identificationType)
                cy.get('input[name="custom_attributes[identification_number]"]').type(usuario[0].identificationNumber)
            });

            // Asegura que el valor seleccionado del desplegable no sea vacío
            cy.get('select[name="custom_attributes[parent_type_identification]"]').should($select => {
                const value = $select.val();
                expect(value).to.not.be.empty;
                }); 
        
                cy.get('select[name="region_id"]').then($select => {
                    // Obtiene todas las opciones menos la primera que es el placeholder
                    const $options = $select.find('option').not(':eq(0)');
                    // Elige un índice aleatorio entre las opciones disponibles
                    const randomIndex = Math.floor(Math.random() * $options.length);
                    // Obtiene el valor de la opción en el índice aleatorio
                    const randomValue = $options.eq(randomIndex).val();
                    // Selecciona la opción en el dropdown
                    cy.get('select[name="region_id"]').select(randomValue);
                  });
    
                cy.get('select[name="custom_attributes[province_id]"]').then($select => {
                    // Obtiene todas las opciones menos la primera que es el placeholder
                    const $options = $select.find('option').not(':eq(0)');
                    // Elige un índice aleatorio entre las opciones disponibles
                    const randomIndex = Math.floor(Math.random() * $options.length);
                    // Obtiene el valor de la opción en el índice aleatorio
                    const randomValue = $options.eq(randomIndex).val();
                    // Selecciona la opción en el dropdown
                    cy.get('select[name="custom_attributes[province_id]"]').select(randomValue);
                  });
    
                  cy.get('select[name="custom_attributes[district_id]"]').then($select => {
                    // Obtiene todas las opciones menos la primera que es el placeholder
                    const $options = $select.find('option').not(':eq(0)');
                    // Elige un índice aleatorio entre las opciones disponibles
                    const randomIndex = Math.floor(Math.random() * $options.length);
                    // Obtiene el valor de la opción en el índice aleatorio
                    const randomValue = $options.eq(randomIndex).val();
                    // Selecciona la opción en el dropdown
                    cy.get('select[name="custom_attributes[district_id]"]').select(randomValue);
                  });
                
                  cy.get('input[name="street[0]"]').type(streetName);
    
                    // Genera un número aleatorio y lo convierte a cadena de texto.
                    // Utiliza métodos de faker para asegurarse de que el número cumpla con la longitud máxima.
                    const randomNumber = faker.datatype.number({ 'min': 10000, 'max': 9999999999 }).toString();
    
                    // Genera una cadena aleatoria que podría ser utilizada como complemento de dirección.
                    // Esta utiliza faker para generar un identificador hexadecimal (o cualquier otra cosa que prefieras)
                    // y luego lo recorta a 25 caracteres para cumplir con la restricción.
                    const complement = faker.random.alphaNumeric(25);
                    cy.get('input[name="custom_attributes[complement]"]').type(complement);
    
                    cy.generateRandomPhoneNumber().then(phoneNumber => {
                        cy.get('input.telephone_custom[name="telephone"]').type(phoneNumber);
                    }); 
    
                    //Seleccinar método de envío aleatoriamente
                    cy.selectRandomShippingMethod();
    
                    cy.get('.button').click()

                 cy.get('#payu').check();

                 cy.get('button.action.primary.checkout[title="Pagar"]').first().click();

         });

        //Verificar que los valores del Summary correspondan de acuerdo a los productos agregados en el CART y la aplicación de un CÓDIGO DE DESCUENTO, Checkout Paso #2 - GUEST
        it('CO-005: Verify that the values of the Summary correspond according to the products added in the CART and the application of a DISCOUNT CODE, Checkout Step #2 - GUEST', () => {

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
        });;
 
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
 
            cy.wait(5000)
 
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
 
            // Selecciona el enlace 'Mi Carro' y haz clic en él
            cy.get('a.action.showcart').click();

            // Hacer clic en el botón 'Proceder al pago'
            cy.get('#top-cart-btn-checkout').click();

           cy.wait(5000)

           const emailAleatorio = faker.internet.email(null, null, "yopmail.com");
           cy.get('#customer-email').type(emailAleatorio)

           //Seleccionar tipo de despacho "Despacho a dirección de domicilio/empresa" 
           //cy.get('#tablerate').check();

            //Generar un nombre aleatorio usando faker si ya lo tienes incluido
            const randomFirstName = faker.name.firstName();
            const randomLastName = faker.name.lastName();
            const streetName = faker.address.streetName(); // Genera un nombre de calle aleatorio

            // Llenar el campo de texto usando su atributo 'name'
            cy.get('input[name="firstname"]').type(randomFirstName);        
            cy.get('input[name="lastname"]').type(randomLastName);

            // Selecciona un tipo de documento de forma aleatoria
            cy.selectDocumentTypeCO().then(typeSelected => {
            // Genera un número de identificación basado en el tipo seleccionado
            cy.generateIdentification(typeSelected).then(identificationNumber => {
            // Encuentra y completa el campo de identificación
            cy.get('input.input-text[name="custom_attributes[document]"]').type(identificationNumber);
            });
            });
    
            cy.get('select[name="region_id"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="region_id"]').select(randomValue);
              });

            cy.get('select[name="custom_attributes[province_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[province_id]"]').select(randomValue);
              });

              cy.get('select[name="custom_attributes[district_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[district_id]"]').select(randomValue);
              });
            
              cy.get('input[name="street[0]"]').type(streetName);

                // Genera un número aleatorio y lo convierte a cadena de texto.
                // Utiliza métodos de faker para asegurarse de que el número cumpla con la longitud máxima.
                const randomNumber = faker.datatype.number({ 'min': 10000, 'max': 9999999999 }).toString();

                // Genera una cadena aleatoria que podría ser utilizada como complemento de dirección.
                // Esta utiliza faker para generar un identificador hexadecimal (o cualquier otra cosa que prefieras)
                // y luego lo recorta a 25 caracteres para cumplir con la restricción.
                const complement = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[number]"]').type(complement);

                const deparment = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[department]"]').type(deparment);            

                cy.generateRandomPhoneNumber().then(phoneNumber => {
                  cy.get('input.input-text[name="telephone"]').type(phoneNumber);
                }); 

                //Seleccinar método de envío aleatoriamente
                cy.selectRandomShippingMethod();

                // Seleccionar el botón y hacer clic en él
                cy.get('button[data-role="opc-continue"]').click();

                 cy.contains('span', 'Aplicar descuento').click();

                 cy.get('input[name="discount_code"]').type('QATEST');

                 cy.get('button.action.action-apply').click();

                 cy.get('div.message-success.success').should('exist');

                  // Seleccionar el input de método de pago y hacer clic en él
                  cy.get('input[name="payment[method]"][value="checkmo"]').click({ force: true });

                  // Seleccionar el botón y hacer clic en él
                  cy.get('button.action.primary.checkout[title="Realizar pago"]').first().click({ force: true });

         });

        //Verificar que usuario logueado puede avanzar al pago seleccionando "Retiro en tienda (Envío Gratis)" - Login
        it('CO-007: Verify that Logged in user can proceed to checkout by selecting "Pick up in store (Free Shipping)" - Login', () => {

            // Crear usuario
            cy.createAccount();

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
        });;
 
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
 
            cy.wait(5000)
 
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
 
                         // Selecciona el enlace 'Mi Carro' y haz clic en él
            cy.get('a.action.showcart').click();

            // Hacer clic en el botón 'Proceder al pago'
            cy.get('#top-cart-btn-checkout').click();

           cy.wait(5000)

           //Seleccionar tipo de despacho "Despacho a dirección de domicilio/empresa" 
           //cy.get('#tablerate').check();

            const streetName = faker.address.streetName(); // Genera un nombre de calle aleatorio
    
            cy.get('select[name="region_id"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="region_id"]').select(randomValue);
              });

            cy.get('select[name="custom_attributes[province_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[province_id]"]').select(randomValue);
              });

              cy.get('select[name="custom_attributes[district_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[district_id]"]').select(randomValue);
              });
            
              cy.get('input[name="street[0]"]').type(streetName);

                // Genera un número aleatorio y lo convierte a cadena de texto.
                // Utiliza métodos de faker para asegurarse de que el número cumpla con la longitud máxima.
                const randomNumber = faker.datatype.number({ 'min': 10000, 'max': 9999999999 }).toString();

                // Genera una cadena aleatoria que podría ser utilizada como complemento de dirección.
                // Esta utiliza faker para generar un identificador hexadecimal (o cualquier otra cosa que prefieras)
                // y luego lo recorta a 25 caracteres para cumplir con la restricción.
                const complement = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[number]"]').type(complement);

                const deparment = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[department]"]').type(deparment); 
                
                            // Selecciona un tipo de documento de forma aleatoria
            cy.selectDocumentTypeCO().then(typeSelected => {
              // Genera un número de identificación basado en el tipo seleccionado
              cy.generateIdentification(typeSelected).then(identificationNumber => {
              // Encuentra y completa el campo de identificación
              cy.get('input.input-text[name="custom_attributes[document]"]').type(identificationNumber);
              });
              });

                cy.generateRandomPhoneNumber().then(phoneNumber => {
                  cy.get('input.input-text[name="telephone"]').type(phoneNumber);
                }); 

                //Seleccinar método de envío aleatoriamente
                cy.selectRandomShippingMethod();

                // Seleccionar el botón y hacer clic en él
                cy.get('button[data-role="opc-continue"]').click();
         });
 
         //Verificar que los valores del Summary correspondan de acuerdo a los productos agregados en el CART y la aplicación de un CÓDIGO DE DESCUENTO, Checkout Paso #2 - Login
         it('CO-009: Verify that the values of the Summary correspond according to the products added in the CART and the application of a DISCOUNT CODE, Checkout Step #2 - Login', () => {
 
            // Crear usuario
            cy.createAccount();

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
        });;
 
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
  
             cy.wait(5000)
  
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
  
                                       // Selecciona el enlace 'Mi Carro' y haz clic en él
            cy.get('a.action.showcart').click();

            // Hacer clic en el botón 'Proceder al pago'
            cy.get('#top-cart-btn-checkout').click();

           cy.wait(5000)

           //Seleccionar tipo de despacho "Despacho a dirección de domicilio/empresa" 
           //cy.get('#tablerate').check();

            const streetName = faker.address.streetName(); // Genera un nombre de calle aleatorio
    
            cy.get('select[name="region_id"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="region_id"]').select(randomValue);
              });

            cy.get('select[name="custom_attributes[province_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[province_id]"]').select(randomValue);
              });

              cy.get('select[name="custom_attributes[district_id]"]').then($select => {
                // Obtiene todas las opciones menos la primera que es el placeholder
                const $options = $select.find('option').not(':eq(0)');
                // Elige un índice aleatorio entre las opciones disponibles
                const randomIndex = Math.floor(Math.random() * $options.length);
                // Obtiene el valor de la opción en el índice aleatorio
                const randomValue = $options.eq(randomIndex).val();
                // Selecciona la opción en el dropdown
                cy.get('select[name="custom_attributes[district_id]"]').select(randomValue);
              });
            
              cy.get('input[name="street[0]"]').type(streetName);

                // Genera un número aleatorio y lo convierte a cadena de texto.
                // Utiliza métodos de faker para asegurarse de que el número cumpla con la longitud máxima.
                const randomNumber = faker.datatype.number({ 'min': 10000, 'max': 9999999999 }).toString();

                // Genera una cadena aleatoria que podría ser utilizada como complemento de dirección.
                // Esta utiliza faker para generar un identificador hexadecimal (o cualquier otra cosa que prefieras)
                // y luego lo recorta a 25 caracteres para cumplir con la restricción.
                const complement = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[number]"]').type(complement);

                const deparment = faker.random.alphaNumeric(25);
                cy.get('input.input-text[name="custom_attributes[department]"]').type(deparment); 
                
                            // Selecciona un tipo de documento de forma aleatoria
            cy.selectDocumentTypeCO().then(typeSelected => {
              // Genera un número de identificación basado en el tipo seleccionado
              cy.generateIdentification(typeSelected).then(identificationNumber => {
              // Encuentra y completa el campo de identificación
              cy.get('input.input-text[name="custom_attributes[document]"]').type(identificationNumber);
              });
              });

                cy.generateRandomPhoneNumber().then(phoneNumber => {
                  cy.get('input.input-text[name="telephone"]').type(phoneNumber);
                }); 

                //Seleccinar método de envío aleatoriamente
                cy.selectRandomShippingMethod();

                // Seleccionar el botón y hacer clic en él
                cy.get('button[data-role="opc-continue"]').click();

                cy.contains('span', 'Aplicar descuento').click();

                cy.get('input[name="discount_code"]').type('QATEST');

                cy.get('button.action.action-apply').click();

                cy.get('div.message-success.success').should('exist');

                 // Seleccionar el input de método de pago y hacer clic en él
                 cy.get('input[name="payment[method]"][value="checkmo"]').click({ force: true });

                 // Seleccionar el botón y hacer clic en él
                 cy.get('button.action.primary.checkout[title="Realizar pago"]').first().click({ force: true });
 
          });
    })          
})
