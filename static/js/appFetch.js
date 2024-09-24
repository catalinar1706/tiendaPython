let productos = []
let categorias = []
let mensajeValidarDatos = null
let base64URL = null


function currencyFormatter({ currency, value }) {
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        minimumFractionDigits: 2,
        currency
    })
    return formatter.format(value)
}

function validarDatos() {
    if (txtCodigo.value == "") {
        mensajeValidarDatos = "Debe ingresar Código del producto"
        return false
    } else if (txtNombre.value == "") {
        mensajeValidarDatos = "Debe ingresar nombre del producto"
        return false
    } else if (txtPrecio.value == "") {
        mensajeValidarDatos = "Debe ingresar precio del producto"
        return false
    } else if (cbCategoria.value == "") {
        mensajeValidarDatos = "Debe seleccionar categoria"
        return false
    } else if (fileFoto.value == "") {
        mensajeValidarDatos = "Debe seleccionar Foto"
        return false
    } else {
        return true
    }
}

/**
 * Función que obtiene el objeto
 * de tipo file cuando se selecciona la imagen
 * y la muestra en el id llamado imagenProducto
 * Adiconalmente valida la extensión
 * @param {*} evento 
 */
async function visualizarFoto(evento) {
    const files = evento.target.files
    const archivo = files[0]
    let filename = archivo.name
    let extension = filename.split('.').pop()
    extension = extension.toLowerCase()
    if (extension !== "jpg") {
        fileFoto.value = ""
        swal.fire("Seleccionar", "La imagen debe ser en formato JPG", "warning")
    } else {
        base64URL = await encodeFileAsBase64URL(archivo);
        const objectURL = URL.createObjectURL(archivo)
        imagenProducto.setAttribute("src", objectURL)
    }
}

/**
* Returns a file in Base64URL format.
* @param {File} file
* @return {Promise<string>}
*/
async function encodeFileAsBase64URL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });
        reader.readAsDataURL(file);
    });
};

/**
 * Función que realiza petición POST
 * al servidor para agregar un 
 * producto en formato JSON.
 * La imagen se envía en formato base64
 */
function agregarProducto() {
    if (validarDatos()) {
        const producto = {
            codigo: txtCodigo.value,
            nombre: txtNombre.value,
            precio: txtPrecio.value,
            categoria: cbCategoria.value
        }
        const foto = {
            foto: base64URL
        }
        const datos = {
            producto: producto,
            foto: foto
        }
        const url = "/agregarProductoJson"
        fetch(url, {
            method: "POST",
            body: JSON.stringify(datos),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(respuesta => respuesta.json())
            .then(resultado => {
                console.log(resultado)
                if (resultado.estado) {
                    frmProducto.reset()
                    Swal.fire({
                        title: resultado.mensaje,
                        confirmButtonText: "Continuar",
                        icon: "success",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.href = "/listarProductos"
                        }
                    });
                } else {
                    swal.fire("Agregar Producto", resultado.mensaje, "warning")
                }
            })
    } else {
        swal.fire("Agregar Producto", mensajeValidarDatos, "info")
    }

}

/**
 * Petición al servdor
 * para obtener laa categorias de 
 * productos
 */
function obtenerCategorias() {
    url = "/obtenerCategorias"
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            categorias = JSON.parse(resultado.categorias)
            console.log(categorias)
        })
        .catch(error => {
            console.error(error)
        })

}

/**
 * Función que muestra las categorias
 * en control de formulario identificado
 * como cbCategoria
 */
function mostrarCategorias() {
    let datos = "<option value=''>Seleccione</option>"
    categorias.forEach(categoria => {
        datos += "<option value=" + categoria["_id"]["$oid"] + ">" + categoria["nombre"] + "</option>"
    });
    cbCategoria.innerHTML = datos
}

/**
 * Petición al servidor para obtener
 * los productos registrados en la
 * base de datos y mostrarlos en una
 * tabla
 */
function obtenerProductos() {
    url = "/listarProductosJson"
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            //productos = JSON.parse(resultado.productos)
            console.log(resultado)
            productos = resultado.productos
            categorias = resultado.categorias
            console.log(resultado.productos)
            mostrarProductosTabla()
        })
        .catch(error => {
            console.error(error)
        })
}

function consultarJson(id) {
    url = "/consultar/" + id
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            productos = JSON.parse(resultado.productos)
            console.log(productos)
            mostrarProductosTabla()
        })
        .catch(error => {
            console.error(error)
        })
}

/**
 * Función que crea el html con los productos
 * y los inserta en la tabla en el id llamado
 * listaProductos
 */
function mostrarProductosTabla() {
    let datos = ""
    productos.forEach(producto => {
        datos += "<tr>"
        datos += "<td>" + producto.codigo + "</td>"
        datos += "<td>" + producto.nombre + "</td>"
        const valor = parseInt(producto['precio'])
        const precio = currencyFormatter({
            currency: "COP",
            valor
        })
        datos += "<td>" + precio + "</td>"
        datos += "<td>" + producto.categoria['nombre'] + "</td>"
        datos += "<td class='text-center'>" +
            "<img src='../static/imagenes/" + producto.id + ".jpg' width='50' height='50'></td>"
        datos += '<td class="text-center" style="font-size:4vh">' +
            '<a href="/consultar/"' + producto.codigo + '><i class="fa fa-edit text-warning" title="Editar"></i></a>' +
            '<i class="fa fa-trash text-danger" onclick="eliminarJson(' + producto.id + ')" title="Eliminar"></i></td>'
        datos += '</tr>'


    });
    console.log(datos)
    listaProductos.innerHTML = datos
}

/**
 * Función que realiza petición al 
 * servidor para validar el ingreso a
 * la aplicación
 */
function iniciarSesion() {
    const usuario = {
        usuario: txtUser.value,
        password: txtPassword.value
    }

    const url = "/iniciarSesionJson"
    fetch(url, {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            console.log(resultado)
            if (resultado.estado) {
                location.href = "/listarProductos"
            } else {
                swal.fire("Iniciar Sesión", resultado.mensaje, "warning")
            }
        })
}

/**
 * Petición al servidor para editar}
 * un producto de acuerdo a su id.
 */
function editarProducto() {
    const producto = {
        id: idProducto.value,
        codigo: txtCodigo.value,
        nombre: txtNombre.value,
        precio: txtPrecio.value,
        categoria: cbCategoria.value
    }
    const foto = {
        foto: base64URL
    }
    const datos = {
        producto: producto,
        foto: foto
    }
    const url = "/editarProductoJson"
    fetch(url, {
        method: "PUT",
        body: JSON.stringify(datos),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            console.log(resultado)
            if (resultado.estado) {
                swal.fire({
                    title: resultado.mensaje,
                    confirmButtonText: "Continuar",
                    icon: "success",
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.href = "/listarProductos"
                    }
                })
            } else {
                swal.fire("Editar Producto", resultado.mensaje, "warning")
            }
        })
}

function eliminar(id) {
    Swal.fire({
        title: "¿Está usted seguro de querer eliminar el producto",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "NO"
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            location.href = "/eliminar/" + id
        }
    });
}

/**
 * Función que realiza petición al servidor
 * para eliminar un producto de acuerdo a su id
 * @param {*} id 
 */
function eliminarJson(id) {
    Swal.fire({
        title: "¿Está usted seguro de querer eliminar el producto",
        showDenyButton: true,
        confirmButtonText: "SI",
        denyButtonText: "NO"
    }).then((result) => {       
        if (result.isConfirmed) {
            url = "/eliminarJson/" + id
            fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(respuesta => respuesta.json())
                .then(resultado => {
                    if (resultado.estado) {
                        Swal.fire({
                            title: resultado.mensaje,
                            confirmButtonText: "Continuar",
                            icon: "success",
                        }).then((result) => {                            
                            if (result.isConfirmed) {
                                location.href = "/listarProductos"
                            }
                        })
                    } else {
                        swal.fire("Eliminar Producto", resultado.mensaje, "info")
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }
    });
}