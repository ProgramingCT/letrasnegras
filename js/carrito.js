let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito"));
let paisSeleccionado = localStorage.getItem("paisSeleccionado") || "colombia";

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    
        contenedorCarritoProductos.innerHTML = "";
    
        productosEnCarrito.forEach(producto => {
            const precioPais = producto.precios[paisSeleccionado];

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${precioPais}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${precioPais * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
    
            contenedorCarritoProductos.append(div);
        });

        actualizarBotonesEliminar();
        actualizarTotal();
        
        if (paisSeleccionado === "colombia") {
            // Renderizar botón de PayU
            renderizarPayU();
        } else {
            // Cargar y renderizar PayPal
            cargarSDKPayPal();
        }

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.removeEventListener("click", eliminarDelCarrito);
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top", 
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #4b33a8, #785ce9)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem', 
            y: '1.5rem' 
        },
        onClick: function(){} 
    }).showToast();

    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    
    productosEnCarrito.splice(index, 1);

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    e.currentTarget.parentElement.remove();

    actualizarTotal();

    if (productosEnCarrito.length === 0) {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {

    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
}

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => {
        const precioPais = producto.precios[paisSeleccionado];
        return acc + (precioPais * producto.cantidad);
    }, 0);
    contenedorTotal.innerText = `$${totalCalculado}`;
}

botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");
}

// Función que carga el SDK de PayPal y renderiza el botón
function cargarSDKPayPal() {
    const clientID = "AVZiUP8rYnw_-4tMFmRjf23Vb1iLh4Exb5_44HhbXol-7HA1RwJklEo3be4UegCwf2WDZK19QVgAZL1m"; 
    const monedasPorPais = {
        mexico: "MXN",
        peru: "PEN",
        españa: "EUR",
        chile: "CLP",
        ecuador: "USD",
        uruguay: "UYU"
    };
    const monedaSeleccionada = monedasPorPais[paisSeleccionado] || "USD";

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientID}&currency=${monedaSeleccionada}`;
    script.onload = function() {
        renderizarPaypal();
    };
    script.onerror = function() {
        console.error("No se pudo cargar el SDK de PayPal");
    };
    document.head.appendChild(script);
}

// Función que renderiza el botón de PayPal
function renderizarPaypal() {
    paypal.Buttons({
        style: {
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: contenedorTotal.innerText.replace('$', '')
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Compra completada por ' + details.payer.name.given_name);
                comprarCarrito();
            });
        }
    }).render('#paypal-button-container');
}

// Función para renderizar el botón de PayU para Colombia
function renderizarPayU() {
    // Asegúrate de tener un contenedor para el botón de PayU en tu HTML con id="payu-button-container"
    const payuButtonContainer = document.getElementById('payu-button-container');
    payuButtonContainer.innerHTML = `
        <button id="payu-button" class="btn btn-primary">Pagar Nequi</button>
    `;
    document.getElementById('payu-button').addEventListener('click', function() {
        iniciarPagoConPayU();
    });
}

function iniciarPagoConPayU() {
    const totalPagar = contenedorTotal.innerText.replace('$', '');
    // Aquí debes implementar la integración con PayU
    // Normalmente, esto implica redirigir al usuario a una página de pago de PayU
    // o abrir un formulario modal para completar el pago

    // Por razones de seguridad, la integración con PayU debe realizarse en el servidor
    // Aquí puedes enviar una solicitud al servidor para generar la transacción

    // Ejemplo:
    /*
    fetch('/crear-transaccion-payu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: totalPagar,
            productos: productosEnCarrito
        })
    })
    .then(response => response.json())
    .then(data => {
        // Redirige al usuario a la URL de PayU para completar el pago
        window.location.href = data.paymentUrl;
    })
    .catch(error => {
        console.error('Error al iniciar el pago con PayU:', error);
    });
    */

    // Como ejemplo, simplemente mostraremos un mensaje
    alert('Iniciar proceso de pago con PayU por un total de $' + totalPagar);
}
