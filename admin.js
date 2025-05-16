const API_BASE_URL = 'https://lgzyrf78oa.execute-api.us-east-1.amazonaws.com/Tienda/Productos';
let productos = [];

// Cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key':''
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        debugger
        const data = await response.json();
        productos = data.productos || [];
        renderizarProductos();
    } catch (error) {
        console.error("Error cargando productos:", error);
        alert("Error al cargar productos: " + error.message);
    }
}

// Renderizar lista de productos
function renderizarProductos() {
    const container = document.getElementById('product-list');
    container.innerHTML = productos.map(producto => `
        <div class="product-card" data-id="${producto.id}">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <p>Stock: ${producto.descripcion || 0}</p>
            <p>Stock: ${producto.stock || 0}</p>
            <button onclick="editarProducto('${producto.id}')">Editar</button>
            <button onclick="eliminarProducto('${producto.id}')">Eliminar</button>
        </div>
    `).join('');
}

// Editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    document.getElementById('product-id').value = producto.id;
    document.getElementById('product-name').value = producto.nombre;
    document.getElementById('product-price').value = producto.precio;
    document.getElementById('product-description').value = producto.descripcion
    document.getElementById('product-stock').value = producto.stock
}

// Eliminar producto (usando API)
async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key':''
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }
        
        // Actualizar lista local
        productos = productos.filter(p => p.id !== id);
        renderizarProductos();
        alert("Producto eliminado correctamente");
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar producto: " + error.message);
    }
}

// Guardar cambios (usando API)
async function guardarCambios(producto) {
    debugger
    try {
        const method = producto.id ? 'PUT' : 'POST';
        const url = producto.id ? `${API_BASE_URL}?id=${producto.id}` : API_BASE_URL;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key':''
            },
            body: JSON.stringify(producto)
        });
        
        if (!response.ok) {
            throw new Error(`Error al ${method === 'POST' ? 'crear' : 'actualizar'} producto`);
        }
        
        const result = await response.json();
        
        // Actualizar lista local
        if (method === 'POST') {
            productos.push(result.producto);
        } else {
            const index = productos.findIndex(p => p.id === producto.id);
            if (index >= 0) {
                productos[index] = result.producto;
            }
        }
        
        renderizarProductos();
        return result;
    } catch (error) {
        console.error("Error guardando producto:", error);
        throw error;
    }
}


document.getElementById('form-producto').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const id = document.getElementById('product-id').value || null;
        const producto = {
            id: id,
            nombre: document.getElementById('product-name').value,
            precio: Number(document.getElementById('product-price').value),
            stock: document.getElementById('product-stock').value,
            descripcion: document.getElementById('product-description').value
        };
        
        await guardarCambios(producto);
        alert(`Producto ${id ? 'actualizado' : 'creado'} correctamente`);
        this.reset();
    } catch (error) {
        alert("Error al guardar producto: " + error.message);
    }
});

// Iniciar
document.addEventListener('DOMContentLoaded', cargarProductos);