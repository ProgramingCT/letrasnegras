let productos = [];
let paisSeleccionado = obtenerPaisSeleccionado(); // Función para obtener el país seleccionado

fetch("js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargarProductos(productos);
    });

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const contenedorPaginacion = document.querySelector("#paginacion");

const productosPorPagina = 8; // Número de productos por página
let paginaActual = 1; // Página actual

botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}));

function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

function obtenerPaisSeleccionado() {
    // Implementa esta función para retornar el país seleccionado
    // Por ejemplo, podrías leerlo de un valor en localStorage, una cookie, o un elemento en el DOM.
    return localStorage.getItem("paisSeleccionado") || "colombia";
}

window.onload = function () {
    paisSeleccionado = obtenerPaisSeleccionado(); // Asegúrate de obtener el país seleccionado al cargar la página
    const filtro = obtenerParametroURL('filtro');
    tituloPrincipal.innerText = "Cargando Productos";

    if (filtro) {
        tituloPrincipal.innerText = filtro;
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        botonesCategorias.forEach(boton => {
            if (boton.id == filtro) {
                boton.classList.add("active");
            }
        });

        const productosBoton = productos.filter(producto => producto.categoria.id == filtro);
        cargarProductos(productosBoton);
    } else {
        tituloPrincipal.innerText = "Todos los productos";
        cargarProductos(productos);
    }
}

function cargarProductos(productosElegidos) {
    const codigosMoneda = {
        colombia: "COP",
        mexico: "MXN",
        peru: "PEN",
        españa: "EUR",
        chile: "CLP",
        ecuador: "USD",
        uruguay: "UYU"
    };

    const codigoMoneda = codigosMoneda[paisSeleccionado] || "USD";

    contenedorProductos.innerHTML = "";

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosElegidos.slice(inicio, fin);

    productosPagina.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");

        // Obtener el precio para el país seleccionado
        const precioPais = producto.precios[paisSeleccionado];

        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${precioPais} ${codigoMoneda}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });

    actualizarBotonesAgregar();
    actualizarPaginacion();

}

function actualizarPaginacion() {
    contenedorPaginacion.innerHTML = "";

    const totalPaginas = obtenerTotalPaginas(productos);
    const maxNumerosPorPagina = 7;

    if (paginaActual > 1) {
        const flechaIzquierda = document.createElement("button");
        flechaIzquierda.innerText = "←";
        flechaIzquierda.classList.add("boton-pagina");
        flechaIzquierda.addEventListener("click", () => {
            paginaActual--;
            cargarProductos(productos);
        });
        contenedorPaginacion.append(flechaIzquierda);
    }

    let inicio = Math.max(1, paginaActual - Math.floor(maxNumerosPorPagina / 2));
    let fin = Math.min(totalPaginas, inicio + maxNumerosPorPagina - 1);

    if (fin - inicio < maxNumerosPorPagina) {
        inicio = Math.max(1, fin - maxNumerosPorPagina + 1);
    }

    for (let i = inicio; i <= fin; i++) {
        const botonPagina = document.createElement("button");
        botonPagina.innerText = i;
        botonPagina.classList.add("boton-pagina");
        if (i === paginaActual) botonPagina.classList.add("active");

        botonPagina.addEventListener("click", () => {
            paginaActual = i;
            cargarProductos(productos);
        });

        contenedorPaginacion.append(botonPagina);
    }

    if (paginaActual < totalPaginas) {
        const flechaDerecha = document.createElement("button");
        flechaDerecha.innerText = "→";
        flechaDerecha.classList.add("boton-pagina");
        flechaDerecha.addEventListener("click", () => {
            paginaActual++;
            cargarProductos(productos);
        });
        contenedorPaginacion.append(flechaDerecha);
    }
}

function obtenerTotalPaginas(productos) {
    return Math.ceil(productos.length / productosPorPagina);
}

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        paginaActual = 1; // Resetear a la primera página

        if (e.currentTarget.id != "todos") {
            const productoCategoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoria.nombre;
            const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        }
    });
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

function agregarAlCarrito(e) {
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #000000, #ee8a50)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        },
        onClick: function () { }
    }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if (productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    actualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}



 // buscador 
// Función para buscar y filtrar productos
document.getElementById('boton-buscar').addEventListener('click', function() {
    const terminoBusqueda = document.getElementById('buscar-producto').value.toLowerCase();

    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            const resultados = data.filter(producto => 
                producto.titulo.toLowerCase().includes(terminoBusqueda)
            );

            mostrarResultados(resultados);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
});

function mostrarResultados(resultados) {
    const contenedorResultados = document.getElementById('resultado-busqueda');
    contenedorResultados.innerHTML = '';

    if (resultados.length === 0) {
        contenedorResultados.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    resultados.forEach(producto => {
        const productoElemento = document.createElement('div');
        productoElemento.classList.add('producto');

        productoElemento.innerHTML = `
            <h3>${producto.titulo}</h3>
            <img src="${producto.imagen}" alt="${producto.titulo}">
            <p>Precio: ${producto.precio}</p>
        `;

        contenedorResultados.appendChild(productoElemento);
    });
}


