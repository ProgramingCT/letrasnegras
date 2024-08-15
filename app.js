// Productos disponibles en la tienda
const products = [
    { id: 1, name: 'Producto 1', price: 10 },
    { id: 2, name: 'Producto 2', price: 20 },
    { id: 3, name: 'Producto 3', price: 30 }
];

// Carrito de compras
let cart = [];

// Función para mostrar los productos en la tienda
function displayProducts() {
    const productsDiv = document.getElementById('products');
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'col-md-4';
        productDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">$${product.price}</p>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Añadir al Carrito</button>
                </div>
            </div>
        `;
        productsDiv.appendChild(productDiv);
    });
}

// Función para añadir productos al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const item = cart.find(p => p.id === productId);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    displayCart();
}

// Función para mostrar los productos en el carrito
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${item.name} x${item.quantity} 
            <span>$${item.price * item.quantity}</span>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">X</button>
        `;
        cartItems.appendChild(li);
    });

    updateTotal();
}

// Función para eliminar productos del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    displayCart();
}

// Función para actualizar el total del carrito
function updateTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('total-price').innerText = total.toFixed(2);
}

// Integración de PayPal
paypal.Buttons({
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: getTotalPrice() // Obtén el total desde el carrito
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('Pago completado por ' + details.payer.name.given_name);
            // Aquí puedes manejar el éxito del pago, como limpiar el carrito, redirigir, etc.
            cart = []; // Limpiar el carrito después del pago
            displayCart();
        });
    }
}).render('#paypal-button-container'); // Renderiza el botón de PayPal en el contenedor

// Función para obtener el total del carrito
function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}

// Mostrar los productos al cargar la página
displayProducts();
