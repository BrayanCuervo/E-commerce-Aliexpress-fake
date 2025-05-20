const API_URL = 'https://fakestoreapi.com/products'
const productosContainer = document.getElementById('productos')
const categoriaSelect = document.getElementById('categoria')
const modalDetalle = document.getElementById('modal-detalle')
const modalCarrito = document.getElementById('modal-carrito')
const contadorCarrito = document.getElementById('contador-carrito')

let productos = []
let carrito = []

// Cargar productos
async function cargarProductos() {
  const res = await fetch(API_URL)
  productos = await res.json()
  mostrarCategorias()
  renderProductos(productos)
}

function mostrarCategorias() {
  const categorias = [...new Set(productos.map(p => p.category))]
  categorias.forEach(cat => {
    const option = document.createElement('option')
    option.value = cat
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1)
    categoriaSelect.appendChild(option)
  })

  categoriaSelect.addEventListener('change', () => {
    const seleccion = categoriaSelect.value
    if (seleccion === 'all') {
      renderProductos(productos)
    } else {
      const filtrados = productos.filter(p => p.category === seleccion)
      renderProductos(filtrados)
    }
  })
}

function renderProductos(lista) {
  productosContainer.innerHTML = ''
  lista.forEach(p => {
    const div = document.createElement('div')
    div.className = 'producto'
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div class="info">
        <h3>${p.title}</h3>
        <p>$${p.price}</p>
        <button onclick="mostrarDetalle(${p.id})">Ver detalle</button>
      </div>
    `
    productosContainer.appendChild(div)
  })
}

function mostrarDetalle(id) {
  const prod = productos.find(p => p.id === id)
  modalDetalle.innerHTML = `
    <div class="modal-content">
      <h2>${prod.title}</h2>
      <img src="${prod.image}" style="width:100%;max-height:200px;object-fit:contain">
      <p>${prod.description}</p>
      <p><strong>Precio:</strong> $${prod.price}</p>
      <p><strong>Stock:</strong> Simulado</p>
      <button onclick="agregarAlCarrito(${prod.id})">Añadir al carrito</button>
      <button onclick="cerrarModal(modalDetalle)">Cerrar</button>
    </div>
  `
  modalDetalle.classList.remove('hidden')
}

function cerrarModal(modal) {
  modal.classList.add('hidden')
}

function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id)
  carrito.push(prod)
  contadorCarrito.textContent = carrito.length
  cerrarModal(modalDetalle)
}

function mostrarCarrito() {
  if (carrito.length === 0) {
    modalCarrito.innerHTML = `
      <div class="modal-content">
        <h2>Carrito vacío</h2>
        <button onclick="cerrarModal(modalCarrito)">Cerrar</button>
      </div>
    `
  } else {
    let total = carrito.reduce((sum, p) => sum + p.price, 0).toFixed(2)
    modalCarrito.innerHTML = `
      <div class="modal-content">
        <h2>Carrito de Compras</h2>
        <ul>
          ${carrito.map((p, i) => `<li>${p.title} - $${p.price.toFixed(2)} <button onclick="eliminarDelCarrito(${i})">Eliminar</button></li>`).join('')}
        </ul>
        <p><strong>Total:</strong> $${total}</p>
        <button onclick="cerrarModal(modalCarrito)">Cerrar</button>
      </div>
    `
  }
  modalCarrito.classList.remove('hidden')
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1)
  contadorCarrito.textContent = carrito.length
  mostrarCarrito()
}

cargarProductos()
