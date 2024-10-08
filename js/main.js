let productos = [];
let paisSeleccionado = obtenerPaisSeleccionado();
let categoriaSeleccionada = null; // Estado para la categoría seleccionada

fetch("js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargarProductos(productos); // Inicialmente cargar todos los productos
    });

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const contenedorPaginacion = document.querySelector("#paginacion");

const inputBuscar = document.querySelector("#buscar-producto");
const botonBuscar = document.querySelector("#boton-buscar");

const productosPorPagina = 8;
let paginaActual = 1;

botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}));

function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

function obtenerPaisSeleccionado() {
    return localStorage.getItem("paisSeleccionado") || "colombia";
}

window.onload = function () {
    paisSeleccionado = obtenerPaisSeleccionado();
    const filtro = obtenerParametroURL('filtro');
    tituloPrincipal.innerText = "Cargando Productos";

    if (filtro) {
        tituloPrincipal.innerText = filtro;
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        botonesCategorias.forEach(boton => {
            if (boton.id === filtro) {
                boton.classList.add("active");
                categoriaSeleccionada = filtro; // Establecer categoría seleccionada
            }
        });

        const productosFiltrados = productos.filter(producto => producto.categoria.id === categoriaSeleccionada);
        cargarProductos(productosFiltrados);
    } else {
        categoriaSeleccionada = null; // No hay filtro
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
    actualizarPaginacion(productosElegidos);
}

function actualizarPaginacion(productosElegidos) {
    contenedorPaginacion.innerHTML = "";

    const totalPaginas = obtenerTotalPaginas(productosElegidos);
    const maxNumerosPorPagina = 7;

    if (paginaActual > 1) {
        const flechaIzquierda = document.createElement("button");
        flechaIzquierda.innerText = "←";
        flechaIzquierda.classList.add("boton-pagina");
        flechaIzquierda.addEventListener("click", () => {
            paginaActual--;
            cargarProductos(categoriaSeleccionada ? productos.filter(producto => producto.categoria.id === categoriaSeleccionada) : productos);
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
            cargarProductos(categoriaSeleccionada ? productos.filter(producto => producto.categoria.id === categoriaSeleccionada) : productos);
        });

        contenedorPaginacion.append(botonPagina);
    }

    if (paginaActual < totalPaginas) {
        const flechaDerecha = document.createElement("button");
        flechaDerecha.innerText = "→";
        flechaDerecha.classList.add("boton-pagina");
        flechaDerecha.addEventListener("click", () => {
            paginaActual++;
            cargarProductos(categoriaSeleccionada ? productos.filter(producto => producto.categoria.id === categoriaSeleccionada) : productos);
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

        paginaActual = 1;

        if (e.currentTarget.id !== "todos") {
            categoriaSeleccionada = e.currentTarget.id;
            const productosBoton = productos.filter(producto => producto.categoria.id === categoriaSeleccionada);
            tituloPrincipal.innerText = productosBoton[0]?.categoria.nombre || "Categoría";
            cargarProductos(productosBoton);
        } else {
            categoriaSeleccionada = null;
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

botonBuscar.addEventListener("click", () => {
    const terminoBusqueda = inputBuscar.value.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
        producto.titulo.toLowerCase().includes(terminoBusqueda) ||
        producto.categoria.nombre.toLowerCase().includes(terminoBusqueda)
    );
    cargarProductos(productosFiltrados);
});

inputBuscar.addEventListener("input", () => {
    const terminoBusqueda = inputBuscar.value.toLowerCase();
    if (terminoBusqueda === "") {
        cargarProductos(categoriaSeleccionada ? productos.filter(producto => producto.categoria.id === categoriaSeleccionada) : productos);
    } else {
        const productosFiltrados = productos.filter(producto =>
            producto.titulo.toLowerCase().includes(terminoBusqueda) ||
            producto.categoria.nombre.toLowerCase().includes(terminoBusqueda)
        );
        cargarProductos(productosFiltrados);
    }
});
