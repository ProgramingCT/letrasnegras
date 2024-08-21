let productos = [];

fetch("js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargarProductos(productos);
    })

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
}))

function cargarProductos(productosElegidos) {

    contenedorProductos.innerHTML = "";

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosElegidos.slice(inicio, fin);

    productosPagina.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
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

    const totalPaginas = obtenerTotalPaginas();
    const maxNumerosPorPagina = 7;

    // Flecha para retroceder
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

    // Páginas numeradas
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

    // Flecha para avanzar
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

function obtenerTotalPaginas() {
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

    })
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
        onClick: function(){} 
      }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if(productosEnCarrito.some(producto => producto.id === idBoton)) {
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
