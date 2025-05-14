// Base de datos de productos (simulada)
const productos = [
    {
        id: 1,
        nombre: "Collar de Plata",
        precio: 299,
        imagenes: ["productos/prod1.jpg", "productos/prod2.png"]
    },
    {
        id: 2,
        nombre: "Aretes de Oro 2",
        precio: 499,
        imagenes: ["productos/prod1.jpg","productos/prod2.png"]
        
    },{
        id: 3,
        nombre: "Collar de Plata 2",
        precio: 299,
        imagenes: ["productos/prod2.png", "productos/prod1.jpg"]
    },
    {
        id: 4,
        nombre: "Aretes de Oro 3",
        precio: 499,
        imagenes: ["productos/prod1.jpg","productos/prod2.png"]
        
    },{
        id: 5,
        nombre: "Collar de Plata 3",
        precio: 299,
        imagenes: ["productos/prod2.png", "productos/prod1.jpg"]
    },
    {
        id: 6,
        nombre: "Aretes de Oro 4",
        precio: 499,
        imagenes: ["productos/prod1.jpg","productos/prod2.png"]
        
    },{
        id: 7,
        nombre: "Collar de Plata 4",
        precio: 299,
        imagenes: ["productos/prod1.jpg", "productos/prod1.jpg"]
    },
    {
        id: 8,
        nombre: "Aretes de Oro 5",
        precio: 499,
        imagenes: ["productos/prod1.jpg","productos/prod2.png"]
        
    },{
        id: 9,
        nombre: "Aretes de Oro 6",
        precio: 499,
        imagenes: ["productos/prod1.jpg","productos/prod2.png"]
    }
];
// Base de datos de videos (puedes ampliarla)
const videosRedes = [
    {
        idVideo:7503224825788337414
    },
    {
        idVideo:7503256741954505989
    },
    {
        idVideo:7503039528018398469
    },
    {
        idVideo:7502806180385983749
    },{
        idVideo:7502677383619677445
    },{
         idVideo:7502667485682879750
    },{
         idVideo:7502425021659434295
    }
    // Agrega más videos según necesites
];
// Variable global para guardar el ID del producto abierto
let currentProductId = null;
let carrito = [];
const contadorCarrito = document.querySelector('.contador-carrito');
const gridProductos = document.getElementById('grid-productos');
const modalCarrito = document.getElementById('modal-carrito');
const itemsCarrito = document.getElementById('items-carrito');
const totalCarrito = document.getElementById('total');
const btnPagar = document.querySelector('.btn-pagar');

// Cargar productos en la página
// Modificar la función cargarProductos() para incluir el modal
function cargarProductos() {
    gridProductos.innerHTML = productos.map(producto => `
        <div class="producto" data-id="${producto.id}" onclick="abrirModalProducto(${producto.id})">
            <div class="contenedor-imagen">
                <img src="${producto.imagenes[0]}" class="imagen-principal" alt="${producto.nombre}">
                ${producto.imagenes[1] ? 
                    `<img src="${producto.imagenes[1]}" class="imagen-hover" alt="${producto.nombre} - Vista alternativa">` : 
                    `<img src="${producto.imagenes[0]}" class="imagen-hover" alt="${producto.nombre}">`
                }
                <div class="accion-rapida">
                    <button class="btn-compra-rapida" title="Compra rápida">
                        <i class="fas fa-cart-plus"></i> Comprar ahora
                    </button>
                </div>
            </div>
            <div class="producto-info">
                <h3 class="producto-titulo">${producto.nombre}</h3>
                <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
                <p class="producto-calificacion">★★★★★ (193)</p>
            </div>
        </div>
    `).join('');
    
    configurarEventosCompraRapida();
}
// Función para abrir el modal del producto
function abrirModalProducto(id) {
    const producto = productos.find(p => p.id === id);
    const modal = document.getElementById("modal-producto");
    const visorPrincipal = document.getElementById("visor-principal");
    const selectorVistas = document.getElementById("selector-vistas");

    // Resetear el modal
    visorPrincipal.innerHTML = "";
    selectorVistas.innerHTML = "";

    // ---- Caso 1: Tiene 3D + imágenes ----
    if (producto.tiene3D && producto.imagenes.length > 0) {
        // 1. Mostrar 3D como vista principal
        visorPrincipal.innerHTML = producto.iframe3D;

        // 2. Crear selector de vistas (3D + imágenes)
        selectorVistas.innerHTML = `
            <button class="btn-vista" onclick="cambiarVista('3d')">Ver en 3D</button>
            ${producto.imagenes.map((img, index) => `
                <img 
                    src="${img}" 
                    alt="Vista ${index + 1}" 
                    onclick="cambiarVista('imagen', '${img}')"
                >
            `).join("")}
        `;

    // ---- Caso 2: Solo imágenes ----
    } else if (producto.imagenes.length > 0) {
        // 1. Mostrar primera imagen como vista principal
        visorPrincipal.innerHTML = `<img src="${producto.imagenes[0]}" class="imagen-activa">`;

        // 2. Crear selector de imágenes (miniaturas)
        selectorVistas.innerHTML = producto.imagenes.map((img, index) => `
            <img 
                src="${img}" 
                alt="Miniatura ${index + 1}" 
                onclick="cambiarImagen('${img}')"
                class="${index === 0 ? 'miniatura-activa' : ''}"
            >
        `).join("");
        abrirModal('modal-producto');
    }

    // Actualizar info del producto
    document.getElementById("modal-nombre").textContent = producto.nombre;
    document.getElementById("modal-precio").textContent = `$${producto.precio.toFixed(2)}`;
    document.getElementById("btn-agregar-carrito").onclick = () => agregarAlCarrito(id);

    // Mostrar modal
    modal.style.display = "block";
}
// Cambiar entre 3D e imágenes
function cambiarVista(tipo, srcImagen = "") {
    const visorPrincipal = document.getElementById("visor-principal");
    const producto = productos.find(p => p.id === currentProductId); // Necesitarás guardar el ID del producto abierto

    if (tipo === "3d") {
        visorPrincipal.innerHTML = producto.iframe3D;
    } else {
        visorPrincipal.innerHTML = `<img src="${srcImagen}" class="imagen-activa">`;
    }
}

// Cambiar imagen en productos sin 3D
function cambiarImagen(srcImagen) {
    document.querySelector(".visor-principal img").src = srcImagen;
    
    // Resaltar miniatura activa
    document.querySelectorAll(".selector-vistas img").forEach(img => {
        img.classList.remove("miniatura-activa");
        if (img.src === srcImagen) img.classList.add("miniatura-activa");
    });
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    // Buscar si el producto ya está en el carrito
    const productoEnCarrito = carrito.find(item => item.id === id);

    if (productoEnCarrito) {
        // Si ya existe, incrementar la cantidad
        productoEnCarrito.cantidad += 1;
    } else {
        // Si no existe, agregarlo al carrito con cantidad 1
        producto.cantidad = 1; // Asegurarse de que el producto tenga la propiedad cantidad
        carrito.push(producto);
    }

    actualizarCarrito();
}

// Actualizar carrito
function actualizarCarrito() {
    debugger
    contadorCarrito.textContent = carrito.length;
    itemsCarrito.innerHTML = carrito.map(item => `
        <div class="item-carrito">
            <img src="${item.imagenes[1]}" alt="${item.nombre}">
            <div>
                <h3 class="producto-titulo">${item.nombre}</h3>
                <p class="producto-precio">$${item.precio.toFixed(2)}</p>
                <p>${item.cantidad}</p>
            </div>
            <i class="fas fa-trash" onclick="eliminarDelCarrito(${item.id})"></i>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.precio*item.cantidad, 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

// Abrir/cerrar modal del carrito
// Función para cerrar modales
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Función para abrir modales
function abrirModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Event listeners para cerrar modales
document.querySelector('.cerrar-modal-producto').addEventListener('click', () => {
    cerrarModal('modal-producto');
});
document.querySelector('.cerrar-modal').addEventListener('click', () => {
    cerrarModal('modal-formulario');
});

document.querySelector('.cerrar-modal-carrito').addEventListener('click', () => {
    cerrarModal('modal-carrito');
});

// Cerrar al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-producto')) {
        cerrarModal('modal-producto');
    }
    if (e.target === document.getElementById('modal-carrito')) {
        cerrarModal('modal-carrito');
    }
    if (e.target === document.getElementById('modal-formulario')) {
        cerrarModal('modal-formulario');
    }
});

// Abrir modal del carrito
document.querySelector('.carrito-icono').addEventListener('click', () => {
    abrirModal('modal-carrito');
});
// Botón de pago (simulación)
btnPagar.addEventListener('click', () => {
    // Verificar si hay productos en el carrito
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Mostrar formulario modal
    abrirModal('modal-formulario');
});
// Manejar envío del formulario
document.getElementById('formulario-cliente').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar campos obligatorios
    const nombre = document.getElementById('nombre-cliente').value.trim();
    const telefono = document.getElementById('telefono-cliente').value.trim();
    let valido = true;
    
    // Validar nombre
    if (nombre === '') {
        document.getElementById('error-nombre').style.display = 'block';
        valido = false;
    } else {
        document.getElementById('error-nombre').style.display = 'none';
    }
    
    // Validar teléfono (mínimo 8 dígitos)
    if (telefono === '' || telefono.replace(/\D/g, '').length < 8) {
        document.getElementById('error-telefono').style.display = 'block';
        document.getElementById('error-telefono').textContent = 
            telefono === '' ? 'Este campo es obligatorio' : 'Teléfono no válido';
        valido = false;
    } else {
        document.getElementById('error-telefono').style.display = 'none';
    }
    
    if (!valido) return;
    
    // Obtener todos los datos
    const email = document.getElementById('email-cliente').value.trim();
    const direccion = document.getElementById('direccion-cliente').value.trim();
    const notas = document.getElementById('notas-cliente').value.trim();
    
    // Enviar pedido a WhatsApp
    enviarPedidoWhatsApp(nombre, telefono, email, direccion, notas);
    
    // Cerrar modal y limpiar formulario
    cerrarModal('modal-formulario');
    this.reset();
});

// Función mejorada para enviar a WhatsApp
function enviarPedidoWhatsApp(nombre, telefono, email = '', direccion = '', notas = '') {
    // Agrupar productos por ID con sus cantidades
    const productosAgrupados = {};
    carrito.forEach(item => {
        if (!productosAgrupados[item.id]) {
            productosAgrupados[item.id] = {
                ...item,
                cantidad: item.cantidad || 1
            };
        } else {
            productosAgrupados[item.id].cantidad += item.cantidad || 1;
        }
    });
    
    // Crear mensaje estructurado
    let mensaje = `*Nuevo Pedido - ${new Date().toLocaleDateString()}*\n\n`;
    mensaje += `*Cliente:* ${nombre}\n`;
    mensaje += `*Teléfono:* ${telefono}\n`;
    if (email) mensaje += `*Email:* ${email}\n`;
    if (direccion) mensaje += `*Dirección:* ${direccion}\n`;
    if (notas) mensaje += `*Notas:* ${notas}\n\n`;
    
    mensaje += `*Detalle del Pedido:*\n`;
    
    // Añadir productos al mensaje
    Object.values(productosAgrupados).forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `➡ *${item.nombre}*\n`;
        mensaje += `   - Cantidad: ${item.cantidad}\n`;
        mensaje += `   - Precio unitario: $${item.precio.toFixed(2)}\n`;
        mensaje += `   - Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });
    
    // Calcular totales
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const iva = subtotal * 0.16; // Ajusta según tu país
    const total = subtotal + iva;
    
    mensaje += `*Resumen de Pago:*\n`;
    mensaje += `   - Subtotal: $${subtotal.toFixed(2)}\n`;
    mensaje += `   - *TOTAL: $${total.toFixed(2)}*\n\n`;
    mensaje += `*!Hola!, me puedes ayudar con estos productos?*`;
    
    // Codificar y enviar
    const numeroWhatsApp = '573115659523'; // Reemplaza con tu número
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    cerrarModal('modal-carrito');
}
// Configuración de eventos para compra rápida
document.querySelectorAll('.producto').forEach(producto => {
    const productId = producto.dataset.id;
    const btnCompraRapida = producto.querySelector('.btn-compra-rapida');
    
    // Evento para compra rápida
    btnCompraRapida.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se active el click del producto
        agregarAlCarrito(parseInt(productId));
        
        // Efecto visual de confirmación
        btnCompraRapida.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
        btnCompraRapida.style.background = '#4CAF50';
        
        setTimeout(() => {
            btnCompraRapida.innerHTML = '<i class="fas fa-cart-plus"></i> Comprar ahora';
            btnCompraRapida.style.background = 'rgba(255, 107, 107, 0.9)';
        }, 2000);
    });
    
    // Asegurar que vuelve a la imagen original al salir del hover
    producto.addEventListener('mouseleave', () => {
        producto.querySelector('.imagen-principal').style.opacity = 1;
        producto.querySelector('.imagen-hover').style.opacity = 0;
    });
});

// Función para configurar los eventos de compra rápida
function configurarEventosCompraRapida() {
    debugger
    document.querySelectorAll('.btn-compra-rapida').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.closest('.producto').dataset.id);
            const producto = productos.find(p => p.id === productId);
            
            // Agregar al carrito
            debugger
            agregarAlCarrito(producto.id);
            
            // Abrir el carrito
            abrirModal('modal-formulario');
            
            // Restaurar el botón después de 2 segundos
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> Comprar ahora';
                this.style.backgroundColor = 'rgba(255, 107, 107, 0.9)';
            }, 2000);
        });
    });
}
let productoSeleccionado = null;

function cargarVideosSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    
    // Duplicamos los videos para efecto continuo infinito
    //const videosDuplicados = [...videosRedes];
    
    sliderTrack.innerHTML =`
        <blockquote class="tiktok-embed"
                cite="https://www.tiktok.com"
                data-embed-type="curated"
                data-video-id-list="7503224825788337414,7503256741954505989,7503179273289731383,7503039528018398469,7502806180385983749,7502677383619677445,7502667485682879750,7502425021659434295"
                data-embed-from="embed_page"
            <section>
                <a target="_blank" href="https://www.tiktok.com/@artesanaoficial?refer=embed">@artessanaoficial</a>
            </section>
        </blockquote>`
}

// Llamar la función al cargar la página
window.addEventListener('DOMContentLoaded', cargarVideosSlider);
// Inicializar la página
cargarProductos();