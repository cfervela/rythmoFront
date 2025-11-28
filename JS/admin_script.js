// ===== CONFIGURACIÓN Y ESTADO GLOBAL =====
// Guarda el estado de la página actual y configuración
const AppState = {
    currentPage: 'dashboard',
    pages: {
        dashboard: {
            title: 'Dashboard',
            desc: 'Bienvenido al panel de administración'
        },
        agregar: {
            title: 'Agregar Producto',
            desc: 'Añade nuevos productos al catálogo'
        },
        actualizar: {
            title: 'Actualizar Producto',
            desc: 'Modifica información de productos existentes'
        },
        eliminar: {
            title: 'Eliminar Producto',
            desc: 'Gestiona la eliminación de productos'
        },
        clientes: {
            title: 'Gestión de Clientes',
            desc: 'Administra la información de clientes'
        },
        pedidos: {
            title: 'Gestión de Pedidos',
            desc: 'Revisa y gestiona los pedidos'
        }
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDashboardData();
    setupImageUpload();
});

// ===== FUNCIONES PRINCIPALES =====
function initializeApp() {
    // Mostrar la página actual
    showPage('dashboard');
    
    // Configurar formularios
    setupForms();
}

function setupEventListeners() {
    // Navegación del sidebar
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Formulario de agregar producto
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }

    // Búsqueda de productos
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearchProduct);
    }
}

function setupImageUpload() {
    const imageInput = document.getElementById('product-image');
    const uploadBox = document.getElementById('image-upload-box');
    const previewImg = document.getElementById('image-preview');

    // Abrir selector al hacer clic en la caja
    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            imageInput.click();
        });
    }

    // Cambiar vista previa cuando seleccionan imagen
    if (imageInput) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (!file) return;

            // Validar que sea una imagen
            if (!file.type.match('image.*')) {
                showNotification('Por favor selecciona un archivo de imagen válido', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                previewImg.src = reader.result;
                previewImg.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });
    }
}

// Nueva función para enviar imagen al servidor
function uploadProductImage(imageFile) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('File[0]', imageFile);

        console.log("Enviando imagen al servidor...");
        console.log("Archivo:", imageFile.name, "Tamaño:", imageFile.size);

        fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/images/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log("Respuesta recibida:", response.status);
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || response.statusText);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("✓ Respuesta del servidor:", data);
            resolve(data);
        })
        .catch(error => {
            console.error('Error al subir imagen:', error);
            reject(error);
        });
    });
}

function handleNavigation(event) {
    const menuItem = event.currentTarget;
    const page = menuItem.dataset.page;
    
    if (page === 'logout') {
        handleLogout();
        return;
    }
    
    showPage(page);
    updateActiveMenu(menuItem);
}

// ===== NAVEGACIÓN DE PÁGINAS =====
function showPage(page) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${page}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Actualiza el encabezado
    updateHeader(page);
    
    // Cargar datos de la página en la que se está
    loadPageData(page);
    
    // Actualizar estado
    AppState.currentPage = page;
}

// ===== ACTUALIZACIÓN DE INTERFAZ =====
function updateActiveMenu(activeItem) {
    // Remover clase active de todos los items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Agregar clase active al item seleccionado
    activeItem.classList.add('active');
}

// Actualiza el título y descripción del encabezado
function updateHeader(page) {
    const pageInfo = AppState.pages[page];
    if (pageInfo) {
        document.getElementById('page-title').textContent = pageInfo.title;
        document.getElementById('page-desc').textContent = pageInfo.desc;
    }
}

// ===== FUNCIONES DE DATOS =====
function loadDashboardData() {
    // Cargar productos para actualizar contador
    fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products')
        .then(response => response.json())
        .then(products => {
            const totalProducts = document.getElementById('total-products');
            if (totalProducts) {
                totalProducts.textContent = products.length;
            }
        })
        .catch(error => console.error('Error al cargar productos:', error));
    
    // Cargar clientes para actualizar contador
    fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/usuarios')
        .then(response => response.json())
        .then(clients => {
            const totalCustomers = document.getElementById('total-customers');
            if (totalCustomers) {
                totalCustomers.textContent = clients.length;
            }
        })
        .catch(error => console.error('Error al cargar clientes:', error));
}

function updateDashboardStats(data) {
    // Actualizar estadísticas en el dashboard (con datos del back)
}

// Cargar datos específicos para cada página
function loadPageData(page) {
    switch(page) {
        case 'agregar':
            const addForm = document.getElementById('add-product-form');
            if (addForm) addForm.reset();
            const previewImg = document.getElementById('image-preview');
            if (previewImg) {
                previewImg.classList.add('hidden');
                previewImg.src = '';
            }
            break;
        case 'actualizar':
            const searchInput = document.getElementById('search-product');
            if (searchInput) searchInput.value = '';
            break;
        case 'eliminar':
            loadProductsForDeletion();
            break;
        case 'clientes':
            loadClients();
            break;
    }
}

async function loadClients() {
    const container = document.getElementById('clients-list');
    
    // Mostrar loading
    container.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando clientes...</div>';
    
    try {
        const response = await fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/usuarios');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const clients = await response.json();
        
        // Actualizar contador en el dashboard
        const totalCustomers = document.getElementById('total-customers');
        if (totalCustomers) {
            totalCustomers.textContent = clients.length;
        }
        
        displayClients(clients);
        
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fa-solid fa-exclamation-circle"></i>
                <p>Error al cargar los clientes: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadClients()">Reintentar</button>
            </div>
        `;
        showNotification('Error al cargar clientes', 'error');
    }
}

function displayClients(clients) {
    const container = document.getElementById('clients-list');
    
    // Si no hay clientes
    if (!clients || clients.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fa-solid fa-user-slash"></i>
                <p>No hay clientes registrados</p>
            </div>
        `;
        return;
    }
    
    // Crear tabla con los clientes
    container.innerHTML = `
        <div class="table-wrapper">
            <table class="clients-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${clients.map(client => `
                        <tr>
                            <td>${client.id || 'N/A'}</td>
                            <td>
                                <div class="client-name">
                                    <div class="client-avatar">
                                        ${getInitials(client.nombre || client.name || 'Usuario')}
                                    </div>
                                    <span>${client.nombre || client.name || 'Sin nombre'}</span>
                                </div>
                            </td>
                            <td>${client.email || 'N/A'}</td>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="table-footer">
            <p>Total de clientes: <strong>${clients.length}</strong></p>
        </div>
    `;
}

// ===== FUNCIONES AUXILIARES PARA CLIENTES =====

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-MX', options);
}

// ===== MANEJO DE FORMULARIOS =====
function setupForms() {
    // Validación en tiempo real para formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Remover el listener de submit genérico para el formulario de agregar producto
        if (form.id === 'add-product-form') {
            return; // Ya tiene su propio handler en setupEventListeners
        }
        
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showInputError(input, 'Este campo es obligatorio');
            isValid = false;
        } else {
            clearInputError(input);
        }
    });
    
    return isValid;
}

function showInputError(input, message) {
    clearInputError(input);
    input.style.borderColor = 'var(--accent)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.style.color = 'var(--accent)';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

function clearInputError(input) {
    input.style.borderColor = '';
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
}

// ===== MANEJO DE PRODUCTOS =====
async function handleAddProduct(event) {
    console.log("=== Iniciando proceso de agregar producto ===");
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const productData = Object.fromEntries(formData);
    
    // Validar campos requeridos (nombre, precio, categoria)
    if (!productData.nombre?.trim() || !productData.precio || !productData.categoria) {
        showNotification('Por favor completa todos los campos requeridos (Nombre, Precio, Categoría)', 'error');
        return;
    }
    
    // Validar que el precio sea un número válido
    const precio = parseFloat(productData.precio);
    if (isNaN(precio) || precio <= 0) {
        showNotification('El precio debe ser un número mayor a 0', 'error');
        return;
    }
    
    // Mostrar indicador de carga
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    submitBtn.disabled = true;
    
    try {
        // 1. Subir imagen si existe
        const imageInput = document.getElementById('product-image');
        if (imageInput && imageInput.files.length > 0) {
            console.log(" Subiendo imagen...");
            try {
                const imageData = await uploadProductImage(imageInput.files[0]);
                console.log("✓ Imagen subida:", imageData);
                productData.imagePath = imageData.files[0].filename;
                showNotification('Imagen subida correctamente', 'success');
            } catch (error) {
                console.error(" Error al subir imagen:", error);
                showNotification('No se pudo subir la imagen: ' + error.message, 'warning');
                // Continuar sin imagen
                productData.imagePath = null;
            }
        } else {
            console.log(" No se seleccionó imagen");
            productData.imagePath = null;
        }
        
        // 2. Enviar producto al backend
        console.log(" Guardando producto en la base de datos...");
        console.log("Datos a enviar:", productData);
        
        const response = await fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || `Error ${response.status}`);
        }
        
        const result = await response.json();
        console.log(" Producto guardado:", result);
        
        // 3. Mostrar éxito
        showNotification('¡Producto agregado correctamente!', 'success');
        
        // 4. Resetear formulario
        form.reset();
        
        // 5. Limpiar vista previa de imagen
        const previewImg = document.getElementById('image-preview');
        if (previewImg) {
            previewImg.classList.add('hidden');
            previewImg.src = '';
        }
        
        // 6. Actualizar contador del dashboard
        loadDashboardData();
        
        console.log("=== Producto agregado exitosamente ===");
        
    } catch (error) {
        console.error(" Error al agregar producto:", error);
        showNotification('Error al agregar producto: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// ===== FUNCIONES PARA ACTUALIZAR PRODUCTOS =====

// Buscar productos
async function handleSearchProduct() {
    const searchTerm = document.getElementById('search-product').value.trim();
    
    if (!searchTerm) {
        showNotification('Ingresa un término de búsqueda', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products/search?nombre=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const products = await response.json();
        
        if (products.length === 0) {
            showNotification('No se encontraron productos con ese nombre', 'info');
            document.getElementById('update-product-form').classList.add('hidden');
            return;
        }
        
        // Mostrar resultados para seleccionar
        displaySearchResults(products);
        
    } catch (error) {
        console.error('Error al buscar productos:', error);
        showNotification('Error al buscar productos', 'error');
    }
}

// Mostrar resultados de búsqueda
function displaySearchResults(products) {
    const formContainer = document.getElementById('update-product-form');
    
    if (products.length === 1) {
        // Si hay solo un resultado, mostrar directamente el formulario
        loadProductForUpdate(products[0].id);
    } else {
        // Si hay múltiples resultados, mostrar lista para seleccionar
        formContainer.innerHTML = `
            <div class="search-results">
                <h3>Selecciona un producto:</h3>
                <div class="products-list">
                    ${products.map(product => `
                        <div class="product-search-item" onclick="loadProductForUpdate(${product.id})">
                            <div class="product-image-small">
                                ${product.imagen ? 
                                    `<img src="${product.imagen}" alt="${product.nombre}">` : 
                                    `<i class="fa-solid fa-image"></i>`
                                }
                            </div>
                            <div class="product-info">
                                <h4>${product.nombre}</h4>
                                <p class="product-category">${product.categoria}</p>
                                <p class="product-price">$${parseFloat(product.precio).toFixed(2)}</p>
                            </div>
                            <i class="fa-solid fa-chevron-right"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        formContainer.classList.remove('hidden');
    }
}

async function loadProductForUpdate(productId) {
    try {
        const response = await fetch(`https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const product = await response.json();
        displayUpdateForm(product);
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showNotification('Error al cargar el producto', 'error');
    }
}

// Mostrar formulario de actualización
function displayUpdateForm(product) {
    const formContainer = document.getElementById('update-product-form');
    
    // Extraer solo el nombre del archivo de la imagen si existe
    let imagePath = '';
    if (product.imagen) {
        const urlParts = product.imagen.split('/');
        imagePath = urlParts[urlParts.length - 1];
    }
    
    formContainer.innerHTML = `
        <div class="update-form-container">
            <div class="form-header">
                <h3>Actualizando: ${product.nombre}</h3>
                <button class="btn btn-secondary btn-sm" onclick="clearUpdateForm()">
                    <i class="fa-solid fa-times"></i> Cancelar
                </button>
            </div>
            
            <form id="update-form" onsubmit="handleUpdateProduct(event, ${product.id})">
                <div class="form-row">
                    <label for="update-product-name">Nombre</label>
                    <input type="text" id="update-product-name" name="nombre" value="${product.nombre}" required>
                </div>

                <div class="form-row">
                    <label for="update-product-price">Precio</label>
                    <input type="number" id="update-product-price" name="precio" step="0.01" value="${product.precio}" required>
                </div>

                <div class="form-row">
                    <label for="update-product-description">Descripción</label>
                    <textarea id="update-product-description" name="descripcion">${product.descripcion || ''}</textarea>
                </div>

                <div class="form-row">
                    <label for="update-product-category">Categoría</label>
                    <select id="update-product-category" name="categoria" required>
                        <option value="Discos" ${product.categoria === 'Discos' ? 'selected' : ''}>Discos</option>
                        <option value="Albumes" ${product.categoria === 'Albumes' ? 'selected' : ''}>Álbumes</option>
                        <option value="Instrumentos" ${product.categoria === 'Instrumentos' ? 'selected' : ''}>Instrumentos</option>
                    </select>
                </div>

                <div class="form-row">
                    <label for="update-product-stock">Stock</label>
                    <input type="number" id="update-product-stock" name="stock" value="${product.stock}" required>
                </div>

                <div class="form-row">
                    <label for="update-product-image">Imagen del Producto</label>
                    <input type="file" id="update-product-image" accept="image/*" class="hidden-input">
                    
                    <div class="image-upload-box" id="update-image-upload-box">
                        ${product.imagen ? 
                            `<img id="update-image-preview" class="image-preview" src="${product.imagen}" alt="Vista previa">
                             <p style="margin-top: 10px;">Haz clic para cambiar la imagen</p>` : 
                            `<i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
                             <p>Haz clic para subir una imagen</p>
                             <img id="update-image-preview" class="image-preview hidden" alt="Vista previa">`
                        }
                    </div>
                    <input type="hidden" id="current-image-path" value="${imagePath}">
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-save"></i> Actualizar Producto
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="clearUpdateForm()">
                        <i class="fa-solid fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    
    formContainer.classList.remove('hidden');
    
    // Configurar la carga de imagen para el formulario de actualización
    setupUpdateImageUpload();
}

// Configurar carga de imagen para actualización
function setupUpdateImageUpload() {
    const imageInput = document.getElementById('update-product-image');
    const uploadBox = document.getElementById('update-image-upload-box');
    const previewImg = document.getElementById('update-image-preview');

    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            imageInput.click();
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                showNotification('Por favor selecciona un archivo de imagen válido', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                previewImg.src = reader.result;
                previewImg.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });
    }
}

// Manejar actualización de producto
async function handleUpdateProduct(event, productId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const productData = Object.fromEntries(formData);
    
    // Validar campos
    if (!productData.nombre?.trim() || !productData.precio || !productData.categoria) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...';
    submitBtn.disabled = true;
    
    try {
        // Verificar si hay nueva imagen
        const imageInput = document.getElementById('update-product-image');
        if (imageInput && imageInput.files.length > 0) {
            console.log("📸 Subiendo nueva imagen...");
            try {
                const imageData = await uploadProductImage(imageInput.files[0]);
                productData.imagePath = imageData.files[0].filename;
                showNotification('Nueva imagen subida', 'success');
            } catch (error) {
                console.error("Error al subir nueva imagen:", error);
                showNotification('No se pudo subir la nueva imagen', 'warning');
                // Mantener imagen actual
                const currentImagePath = document.getElementById('current-image-path').value;
                if (currentImagePath) {
                    productData.imagePath = currentImagePath;
                }
            }
        } else {
            // Mantener imagen actual
            const currentImagePath = document.getElementById('current-image-path').value;
            if (currentImagePath) {
                productData.imagePath = currentImagePath;
            }
        }
        
        // Enviar actualización
        const response = await fetch(`https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || `Error ${response.status}`);
        }
        
        const result = await response.json();
        showNotification('¡Producto actualizado correctamente!', 'success');
        
        // Limpiar formulario
        clearUpdateForm();
        
        // Actualizar contador del dashboard
        loadDashboardData();
        
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showNotification('Error al actualizar producto: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Limpiar formulario de actualización
function clearUpdateForm() {
    const formContainer = document.getElementById('update-product-form');
    formContainer.innerHTML = '';
    formContainer.classList.add('hidden');
    
    const searchInput = document.getElementById('search-product');
    if (searchInput) {
        searchInput.value = '';
    }
}

// seccion para actualizar productos (con base de datos y back)


async function loadProductsForDeletion() {
    const container = document.getElementById('delete-products-list');
    
    // Mostrar loading
    container.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando productos...</div>';
    
    try {
        const response = await fetch('https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        // Actualizar contador en el dashboard
        const totalProducts = document.getElementById('total-products');
        if (totalProducts) {
            totalProducts.textContent = products.length;
        }
        
        displayProductsForDeletion(products);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fa-solid fa-exclamation-circle"></i>
                <p>Error al cargar los productos: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadProductsForDeletion()">Reintentar</button>
            </div>
        `;
        showNotification('Error al cargar productos', 'error');
    }
}

function displayProductsForDeletion(products) {
    const container = document.getElementById('delete-products-list');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fa-solid fa-box-open"></i>
                <p>No hay productos para mostrar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="products-grid">
            ${products.map(product => `
                <div class="product-delete-card">
                    <div class="product-image">
                        ${product.imagen ? 
                            `<img src="${product.imagen}" alt="${product.nombre}">` : 
                            `<i class="fa-solid fa-image"></i>`
                        }
                    </div>
                    <div class="product-details">
                        <h3 class="product-name">${product.nombre}</h3>
                        <p class="product-category">${product.categoria || 'Sin categoría'}</p>
                        <p class="product-price">$${parseFloat(product.precio).toFixed(2)}</p>
                        <p class="product-stock">Stock: ${product.stock}</p>
                    </div>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id}, '${product.nombre}')">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="table-footer">
            <p>Total de productos: <strong>${products.length}</strong></p>
        </div>
    `;
}

async function deleteProduct(productId, productName) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        const response = await fetch(`https://web-ei5n0hqmbu0c.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        showNotification('Producto eliminado correctamente', 'success');
        
        // Recargar la lista
        loadProductsForDeletion();
        
        // Actualizar contador del dashboard
        loadDashboardData();
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showNotification('Error al eliminar el producto: ' + error.message, 'error');
    }
}

function updateProductCount(change) {
    const currentCount = parseInt(document.getElementById('total-products').textContent);
    document.getElementById('total-products').textContent = Math.max(0, currentCount + change);
}

// ===== UTILIDADES =====
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Simular logout
        showNotification('Sesión cerrada correctamente', 'info');
        
        // Redireccionar (simulado)
        setTimeout(() => {
            window.location.href = '/FRONTEND/PAGES/login.html';
        }, 1000);
    }
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Estilos básicos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        boxShadow: 'var(--shadow)'
    });
    
    // Colores según el tipo
    const colors = {
        success: 'var(--primary)',
        error: 'var(--accent)',
        warning: 'var(--vibrant-3)',
        info: 'var(--primary-light)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // quitar después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== ESTILOS ADICIONALES DINÁMICOS =====
const dynamicStyles = `
    .product-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: var(--bg-light);
        border-radius: 10px;
        margin-bottom: 10px;
    }
    
    .btn-sm {
        padding: 8px 16px;
        font-size: 12px;
    }
    
    .no-data {
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
        padding: 20px;
    }
    
    .input-error {
        color: var(--accent) !important;
        font-size: 12px !important;
        margin-top: 5px !important;
    }
`;

// Injectar estilos dinámicos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);