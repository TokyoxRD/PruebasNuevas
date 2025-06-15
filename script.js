let productos = [];

// Función para obtener el carrito del localStorage
function obtenerCarrito() {
    const carritoJSON = localStorage.getItem('carrito');
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

// Función para guardar el carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Función para actualizar el contador del carrito en el header
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const carritoCountElement = document.getElementById('carrito-count');
    if (carritoCountElement) {
        carritoCountElement.textContent = carrito.length;
    }
}

// Función para cargar y mostrar productos en productos.html
async function cargarProductos() {
    try {
        const response = await fetch('productos.json'); // Aquí se hace la petición al archivo JSON
        productos = await response.json(); // Asigna los productos a la variable global
        // Las páginas que usen esta función (como productos.html) llamarán a mostrarProductos o cargarProductoDetalle después
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        const productosGrid = document.getElementById('productos-grid');
        if (productosGrid) {
            productosGrid.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
        }
    }
}

// Función para mostrar los productos en el DOM (usada en productos.html)
function mostrarProductos(productosAMostrar) {
    const productosGrid = document.getElementById('productos-grid');
    if (!productosGrid) return; // Salir si no estamos en la página de productos

    productosGrid.innerHTML = ''; // Limpiar la cuadrícula antes de añadir nuevos productos

    if (productosAMostrar.length === 0) {
        productosGrid.innerHTML = '<p>No se encontraron productos para esta categoría o búsqueda.</p>';
        return;
    }

    productosAMostrar.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.classList.add('producto-card');

        // Corrected template literal syntax and structure
        productoCard.innerHTML = `
            <div class="producto-img">${producto.imagen}</div>
            <div class="producto-info">
                <div class="producto-categoria">${producto.categoria.toUpperCase()}</div>
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
                <div class="producto-actions">
                    <a href="producto-detalle.html?id=${producto.id}" class="btn-ver-detalle">Ver Detalle</a>
                    <button class="btn-add-to-cart" onclick="agregarAlCarrito(${producto.id})">🛒 Añadir</button>
                </div>
            </div>
        `;
        productosGrid.appendChild(productoCard);
    });
}

// Función para filtrar productos por categoría (usada en productos.html)
function filtrarPor(categoria) {
    const botonesFiltro = document.querySelectorAll('.filtro-btn');
    botonesFiltro.forEach(btn => btn.classList.remove('active'));

    const botonActivo = document.querySelector(`.filtro-btn[onclick="filtrarPor('${categoria}')"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    let productosFiltrados = [];
    if (categoria === 'todos') {
        productosFiltrados = productos;
    } else {
        productosFiltrados = productos.filter(producto => producto.categoria === categoria);
    }
    mostrarProductos(productosFiltrados);
}

// Función para buscar productos (se puede añadir un input de búsqueda en el HTML)
function buscarProductos() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const productosEncontrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm) ||
        producto.descripcion.toLowerCase().includes(searchTerm) ||
        producto.categoria.toLowerCase().includes(searchTerm)
    );
    mostrarProductos(productosEncontrados);
}

// Funciones del carrito
function agregarAlCarrito(productoId) {
    const carrito = obtenerCarrito();
    carrito.push(productoId);
    guardarCarrito(carrito);

    // Pequeño feedback visual
    const btn = document.querySelector(`.btn-add-to-cart[onclick="agregarAlCarrito(${productoId})"]`);
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Agregado ✅';
        btn.style.backgroundColor = '#48bb78';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '#667eea';
        }, 1500);
    }
}

function eliminarDelCarrito(index) {
    const carrito = obtenerCarrito();
    carrito.splice(index, 1); // Elimina 1 elemento en la posición 'index'
    guardarCarrito(carrito);
    cargarCarritoPage(); // Recarga la página del carrito para reflejar el cambio
}

// Funciones específicas para la página carrito.html
async function cargarCarritoPage() {
    // Asegurarse de que los productos estén cargados
    if (productos.length === 0) {
        await cargarProductos(); // Espera a que los productos se carguen
    }

    const carrito = obtenerCarrito();
    const carritoItemsContainer = document.getElementById('carrito-items');
    const carritoTotalElement = document.getElementById('carrito-total');
    
    if (!carritoItemsContainer || !carritoTotalElement) return; // Salir si no estamos en la página del carrito

    carritoItemsContainer.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        carritoItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío. ¡Añade algunas plantas!</p>';
        carritoTotalElement.textContent = '$0.00';
        return;
    }

    // Contar la cantidad de cada producto en el carrito
    const productosEnCarritoConCantidad = {};
    carrito.forEach(productoId => {
        if (productosEnCarritoConCantidad[productoId]) {
            productosEnCarritoConCantidad[productoId].cantidad++;
        } else {
            const producto = productos.find(p => p.id === productoId);
            if (producto) {
                productosEnCarritoConCantidad[productoId] = { ...producto, cantidad: 1 };
            }
        }
    });

    Object.values(productosEnCarritoConCantidad).forEach((item, index) => {
        const productoOriginal = productos.find(p => p.id === item.id);
        if (productoOriginal) {
            const itemTotal = productoOriginal.precio * item.cantidad;
            total += itemTotal;

            const carritoItem = document.createElement('div');
            carritoItem.classList.add('carrito-item');
            // Corrected template literal syntax and structure
            carritoItem.innerHTML = `
                <div class="carrito-item-img">${productoOriginal.imagen}</div>
                <div class="carrito-item-info">
                    <span class="carrito-item-nombre">${productoOriginal.nombre}</span>
                    <span class="carrito-item-precio">$${productoOriginal.precio.toFixed(2)}</span>
                    <span class="carrito-item-cantidad">Cantidad: ${item.cantidad}</span>
                    <span class="carrito-item-subtotal">Total: $${itemTotal.toFixed(2)}</span>
                </div>
                <button class="btn-eliminar" onclick="eliminarProductoCompletoDelCarrito(${item.id})">Remover</button>
            `;
            carritoItemsContainer.appendChild(carritoItem);
        }
    });

    carritoTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Función para eliminar todas las instancias de un producto del carrito
function eliminarProductoCompletoDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(id => id !== productoId); // Filtra todos los IDs que no sean el del producto a eliminar
    guardarCarrito(carrito);
    cargarCarritoPage(); // Recarga la página del carrito para reflejar el cambio
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        cargarCarritoPage();
        actualizarContadorCarrito();
    }
}

function procederAlCheckout() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Añade productos antes de proceder.');
        return;
    }

    const numeroWhatsApp = '8496576009'; 
    let mensaje = 'Hola! Me gustaría hacer un pedido de las siguientes plantas:\n\n';
    let totalPedido = 0;

    // Agrupar productos por cantidad para el mensaje de WhatsApp
    const productosAgrupados = {};
    carrito.forEach(id => {
        if (productosAgrupados[id]) {
            productosAgrupados[id].cantidad++;
        } else {
            const producto = productos.find(p => p.id === id);
            if (producto) {
                productosAgrupados[id] = { ...producto, cantidad: 1 };
            }
        }
    });

    Object.values(productosAgrupados).forEach(item => {
        // Corrected template literal syntax for item.nombre
        mensaje += `- ${item.cantidad}x ${item.nombre} ($${item.precio.toFixed(2)} c/u) - Total: $${(item.cantidad * item.precio).toFixed(2)}\n`;
        totalPedido += (item.cantidad * item.precio);
    });

    mensaje += `\nTotal del pedido: $${totalPedido.toFixed(2)}\n\n`;
    mensaje += '¡Espero tu confirmación!';

    // Corrected template literal syntax for whatsappUrl
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');

    // Opcional: vaciar carrito después de enviar el pedido
    vaciarCarrito();
}


// Event listeners para cargar el carrito o los productos al cargar la página
document.addEventListener('DOMContentLoaded', async () => { // Hice este listener async para poder await cargarProductos()
    actualizarContadorCarrito();

    // Cargar productos si estamos en la página de productos o detalle de producto
    if (document.getElementById('productos-grid') || document.querySelector('.producto-detalle')) {
        await cargarProductos(); // Asegúrate de esperar a que los productos se carguen
    }

    // Cargar carrito si estamos en la página del carrito
    if (document.getElementById('carrito-items')) {
        cargarCarritoPage();
    }
    
});