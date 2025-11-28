// /FRONTEND/JS/pago.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const cardNumberInput = document.getElementById('cardNumber');
    const cvvInput = document.getElementById('cvv');
    const expMonthInput = document.getElementById('expMonth');
    const expYearInput = document.getElementById('expYear');
    const cardHolderInput = document.getElementById('cardHolder');
    const passwordInput = document.getElementById('password');
    
    // Elementos de preview de la tarjeta
    const previewCardNumber = document.getElementById('previewCardNumber');
    const previewExpiry = document.getElementById('previewExpiry');
    const previewName = document.getElementById('previewName');
    const previewCvv = document.getElementById('previewCvv');
    const cardBrandLogo = document.getElementById('cardBrandLogo');
    const cardContainer = document.querySelector('.credit-card-container');
    
    // Logos de las tarjetas
    const cardLogos = {
        'visa': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
        'mastercard': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png',
        'amex': 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
        'default': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png'
    };

    // Inicializar valores por defecto
    previewName.textContent = 'Jonathan Michael';
    previewExpiry.textContent = '09/22';
    previewCvv.textContent = '***';
    previewCardNumber.textContent = '**** **** **** ****';
  


    // Función para detectar la marca de la tarjeta
    function detectCardBrand(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        
        if (/^4/.test(cleaned)) {
            return 'visa';
        } else if (/^5[1-5]/.test(cleaned)) {
            return 'mastercard';
        } else if (/^3[47]/.test(cleaned)) {
            return 'amex';
        } else {
            return 'default';
        }
    }

    // Función para actualizar el logo de la tarjeta
    function updateCardLogo(cardNumber) {
        if (cardNumber.replace(/\s/g, '').length >= 1) {
            const brand = detectCardBrand(cardNumber);
            const logos = document.querySelectorAll('.card-logo img, .back-logo img');
            logos.forEach(logo => {
                logo.src = cardLogos[brand];
                logo.alt = `${brand} logo`;
            });
        } else {
            const logos = document.querySelectorAll('.card-logo img, .back-logo img');
            logos.forEach(logo => {
                logo.src = cardLogos['default'];
                logo.alt = 'card logo';
            });
        }
    }

    // Formatear número de tarjeta y actualizar preview
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
        
        // Actualizar preview de la tarjeta
        if (formattedValue) {
            const cleaned = formattedValue.replace(/\s/g, '');
            let displayValue = cleaned;

            // Si tiene menos de 16, rellenar con *
            if (cleaned.length < 16) {
                let remaining = 16 - cleaned.length;
                let stars = '*'.repeat(remaining);

                displayValue += stars;
            }

            // Reagrupar siempre en bloques de 4
            displayValue = displayValue
                .match(/.{1,4}/g)
                .join(' ');

            previewCardNumber.textContent = displayValue;

        } else {
            previewCardNumber.textContent = '**** **** **** ****';
        }

        
        // Actualizar logo de la tarjeta
        updateCardLogo(formattedValue);
    });

    // Actualizar CVV en el reverso de la tarjeta
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        if (e.target.value) {
            // Mostrar CVV real en el reverso
            previewCvv.textContent = e.target.value;
        } else {
            previewCvv.textContent = ' ***';
        }
    });

    // Efecto visual cuando el CVV está enfocado 
    cvvInput.addEventListener('focus', function() {
        if (window.innerWidth > 768) {
            cardContainer.classList.add('flipped');
        }
    });

    cvvInput.addEventListener('blur', function() {
        cardContainer.classList.remove('flipped');
    });

    // Actualizar nombre del titular
    cardHolderInput.addEventListener('input', function(e) {
        previewName.textContent = e.target.value || 'Jonathan Michael';
    });

    // Actualizar fecha de expiración
    expMonthInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value > 12) e.target.value = '12';
        updateExpiry();
    });

    expYearInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        updateExpiry();
    });

    function updateExpiry() {
        let month = expMonthInput.value;
        let year = expYearInput.value;

        // Si el input está vacío, usar valores por defecto
        month = month === '' ? '09' : month.padStart(2, '0');
        year = year === '' ? '22' : year.padStart(2, '0');

        previewExpiry.textContent = `${month}/${year}`;
    }


    // Manejar el botón de pago
    document.querySelector('.pay-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validaciones básicas
        if (!cardNumberInput.value || cardNumberInput.value.replace(/\s/g, '').length !== 16) {
            alert('Por favor ingrese un número de tarjeta válido (16 dígitos)');
            cardNumberInput.focus();
            return;
        }
        
        if (!cvvInput.value || cvvInput.value.length < 3) {
            alert('Por favor ingrese un CVV válido');
            cvvInput.focus();
            return;
        }
        
        if (!expMonthInput.value || !expYearInput.value) {
            alert('Por favor ingrese una fecha de expiración válida');
            expMonthInput.focus();
            return;
        }
        
        if (!cardHolderInput.value) {
            alert('Por favor ingrese el nombre del titular de la tarjeta');
            cardHolderInput.focus();
            return;
        }
        
        if (!passwordInput.value) {
            alert('Por favor ingrese su contraseña');
            passwordInput.focus();
            return;
        }

        // Simular procesamiento de pago
        const payButton = this;
        const originalText = payButton.textContent;
        
        payButton.textContent = 'Procesando...';
        payButton.disabled = true;
        payButton.style.background = '#9ca3af';

        setTimeout(() => {
            alert('¡Pago procesado exitosamente!');
            
            // Restaurar botón visualmente
            payButton.textContent = originalText;
            payButton.disabled = false;
            payButton.style.background = '';
        }, 2000);
    });

    // Inicializar logo de tarjeta
    updateCardLogo('');
});