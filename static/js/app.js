let productos = []

function currencyFormatter({ currency, value }) {
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        minimumFractionDigits: 2,
        currency
    })
    return formatter.format(value)
}


function visualizarFoto(evento){   
    $fileFoto = document.querySelector('#fileFoto')
    $imagenPrevisualizacion = document.querySelector("#imagenProducto")
    const files = evento.files
    const archivo = files[0]    
    let filename = archivo.name
    let extension = filename.split('.').pop()
    extension = extension.toLowerCase()
    if(extension!=="jpg"){
        $fileFoto.value=""
        alert("La imagen debe ser en formato JPG")
    }else{       
        const objectURL = URL.createObjectURL(archivo) 
        $imagenPrevisualizacion.src = objectURL
    }
}

function eliminar(id){
    console.log(id)
    Swal.fire({
        title: "¿Está seguro de Eliminar el Producto?",
        showDenyButton: true,        
        confirmButtonText: "SI",
        denyButtonText: "NO"
      }).then((result) => {        
        if (result.isConfirmed) {
            location.href="/eliminar/"+id
          Swal.fire("Eliminado!", "", "success");
        
        } 
      });
}

/**
 * Petición al servidor para obtener
 * los productos registrados en la
 * base de datos y mostrarlos en una
 * tabla
 */
function obtenerProductos() {
    url = "/api/listarProductos"
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(respuesta => respuesta.json())
        .then(resultado => {
            //productos = JSON.parse(resultado.productos)
            productos = resultado
            console.log(resultado)
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
        datos += "<td>" + producto['codigo'] + "</td>"
        datos += "<td>" + producto['nombre'] + "</td>"
        const valor = parseInt(producto['precio'])
        const precio = currencyFormatter({
            currency: "COP",
            valor
        })
        datos += "<td>" + precio + "</td>"
        datos += "<td>" + producto['categoria'] + "</td>"
        datos += "<td class='text-center'>" +
            "<img src='../static/imagenes/" + producto['codigo'] + ".jpg' width='50' height='50'></td>"
        datos += '<td class="text-center" style="font-size:4vh">' +
            '<a href="/consultar/"' + producto['_id']+ '><i class="fa fa-edit text-warning" title="Editar"></i></a>' +
            '<i class="fa fa-trash text-danger" onclick="eliminarJson(' +producto['_id']+ ')" title="Eliminar"></i></td>'
        datos += '</tr>'


    });
    console.log(datos)
    datosProductos.innerHTML = datos
}

