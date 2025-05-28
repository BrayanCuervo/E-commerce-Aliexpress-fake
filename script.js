const API_URL = 'https://fakestoreapi.com/products';
        let productos = [];
        let carrito = [];
        let currentSlide = 0;
        let selectedPaymentMethod = '';
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.nav-dot');
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        function initScrollAnimations() {
            const animatedElements = document.querySelectorAll('.fade-in-left, .fade-in-right, .fade-in-up, .fade-in-scale');
            animatedElements.forEach(el => observer.observe(el));
        }

        function goToSlide(slideIndex) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = slideIndex;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            goToSlide(nextIndex);
        }

        setInterval(nextSlide, 5000);

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        async function cargarProductos() {
            try {
                const res = await fetch(API_URL);
                productos = await res.json();
                mostrarCategorias();
                renderProductos(productos);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        }

        function mostrarCategorias() {
            const categoriesContainer = document.getElementById('categories');
            const categorias = [...new Set(productos.map(p => p.category))];
            
            categorias.forEach(cat => {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                div.onclick = () => filterByCategory(cat);
                categoriesContainer.appendChild(div);
            });
        }

        function filterByCategory(category) {
            const categoryItems = document.querySelectorAll('.category-item');
            categoryItems.forEach(item => item.classList.remove('active'));
            
            event.target.classList.add('active');
            
            if (category === 'all') {
                renderProductos(productos);
            } else {
                const filtrados = productos.filter(p => p.category === category);
                renderProductos(filtrados);
            }
            
            toggleSidebar();
        }

        function renderProductos(lista) {
            const productosContainer = document.getElementById('productos');
            productosContainer.innerHTML = '';
            
            lista.forEach((p, index) => {
                const div = document.createElement('div');
                div.className = `product-card ${index % 2 === 0 ? 'fade-in-left' : 'fade-in-right'}`;
                div.innerHTML = `
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${p.title}</h3>
                        <div class="product-price">${p.price.toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="btn btn-secondary" onclick="mostrarDetalle(${p.id})">Ver detalle</button>
                            <button class="btn btn-primary" onclick="agregarAlCarrito(${p.id})">Agregar</button>
                        </div>
                    </div>
                `;
                productosContainer.appendChild(div);
                
                setTimeout(() => {
                    observer.observe(div);
                }, index * 100);
            });
        }

        function mostrarDetalle(id) {
            const prod = productos.find(p => p.id === id);
            const modalBody = document.getElementById('modal-body');
            
            modalBody.innerHTML = `
                <img src="${prod.image}" alt="${prod.title}" class="modal-image">
                <h3>${prod.title}</h3>
                <p class="modal-description">${prod.description}</p>
                <div class="modal-price">$${prod.price.toFixed(2)}</div>
                <p><strong>Categoría:</strong> ${prod.category}</p>
                <p><strong>Calificación:</strong> ${prod.rating.rate} ⭐ (${prod.rating.count} reseñas)</p>
                <br>
                <button class="btn btn-primary" onclick="agregarAlCarrito(${prod.id}); cerrarModal('modal-detalle');" style="width: 100%;">
                    Agregar al carrito
                </button>
            `;
            
            document.getElementById('modal-detalle').classList.add('active');
        }

        function cerrarModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function agregarAlCarrito(id) {
            const prod = productos.find(p => p.id === id);
            const existingItem = carrito.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                carrito.push({...prod, quantity: 1});
            }
            
            actualizarContadorCarrito();
        }

        function actualizarContadorCarrito() {
            const total = carrito.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('contador-carrito').textContent = total;
        }

        function mostrarCarrito() {
            const cartBody = document.getElementById('cart-body');
            
            if (carrito.length === 0) {
                cartBody.innerHTML = '<p>Tu carrito está vacío</p>';
            } else {
                const total = carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                cartBody.innerHTML = `
                    ${carrito.map((item, index) => `
                        <div class="cart-item">
                            <div>
                                <h4>${item.title}</h4>
                                <p>Cantidad: ${item.quantity} | Precio: ${item.price.toFixed(2)}</p>
                            </div>
                            <button class="btn btn-secondary" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                        </div>
                    `).join('')}
                    <div class="cart-total">
                        Total: ${total.toFixed(2)}
                    </div>
                    <br>
                    <button class="btn btn-primary" onclick="mostrarPago()" style="width: 100%;">Proceder al pago</button>
                `;
            }
            
            document.getElementById('modal-carrito').classList.add('active');
        }

        function mostrarPago() {
            const total = carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const paymentBody = document.getElementById('payment-body');
            
            paymentBody.innerHTML = `
                <div class="cart-summary" style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h3>Resumen del pedido</h3>
                    <p><strong>Total a pagar: ${total.toFixed(2)}</strong></p>
                    <p>${carrito.length} producto(s) en tu carrito</p>
                </div>
                
                <div class="payment-section">
                    <div id="payment-form">

                        <h3>Método de Pago</h3>
                        <div class="form-group">
                                <label>Diga como va a pagar</label>
                                <input type="text"  placeholder="Tarjeta 💳, efectivo💵,">
                            </div>
                    
                        <div class="form-row">
                            <div class="form-group">
                                <label>Número de Tarjeta</label>
                                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" id="cvv" placeholder="123" maxlength="3">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Mes de expiracion</label>
                                <input type="text" placeholder="02" maxlength="2"></input>
                            </div>
                            <div class="form-group">
                                <label>Año de Expiración</label>
                                <input type="text" placeholder="12" maxlength="2"></input>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nombre en la Tarjeta</label>
                            <input type="text" id="card-name" placeholder="Fyodor Dostoievsky">
                        </div>
                    </div>
                    
                    <h3 style="margin-top: 30px;">Dirección de Envío</h3>
                    <div class="form-group">
                        <label>Dirección Completa</label>
                        <input type="text" id="address" placeholder="Calle 123, Apartamento 4B">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Ciudad</label>
                            <input type="text" id="city" placeholder="Bogotá">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" id="phone" placeholder="+57 300 123 4567">
                    </div>
                    
                    <button class="btn btn-primary" id="btn__pay" onclick="procesarPago()" style="width: 100%; margin-top: 20px; lpadding: 15px;">
                        Confirmar Pago - ${total.toFixed(2)}
                    </button>
                </div>
            `;
            
            cerrarModal('modal-carrito');
            document.getElementById('modal-pago').classList.add('active');
        }
     

        function procesarPago() {
              cerrarModal('modal-pago');
              alert('Pago procesado exitosamente');

          }

        

        function finalizarCompra() {
            carrito = [];
            actualizarContadorCarrito();
            cerrarModal('modal-pago');
        }

        function eliminarDelCarrito(index) {
            carrito.splice(index, 1);
            actualizarContadorCarrito();
            mostrarCarrito();
        }

        function searchProducts() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const filtered = productos.filter(p => 
                p.title.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
            renderProductos(filtered);
        }

        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        cargarProductos();
        initScrollAnimations();

        document.addEventListener('input', function(e) {
            if (e.target.id === 'card-number') {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            }
        });