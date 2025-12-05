let editingIndex = -1;

document.addEventListener("DOMContentLoaded", cargarDatos);

function cargarDatos() {
    const datos = JSON.parse(localStorage.getItem("inventario")) || [];
    const tbody = document.querySelector("#tablaInventario tbody");
    tbody.innerHTML = "";

    datos.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${estado(item.cantidad)}</td>
                <td>
                    <button onclick="editar(${index})">Editar</button>
                    <button class="btn-delete" onclick="eliminar(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function estado(cantidad) {
    if (cantidad > 50) return "OK";
    if (cantidad >= 10) return "Bajo";
    return "Crítico";
}

function openForm() {
    editingIndex = -1;
    document.getElementById("tituloForm").innerText = "Nuevo Producto";
    document.getElementById("modal").style.display = "flex";
}

function closeForm() {
    document.getElementById("modal").style.display = "none";
}

function guardar() {
    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombre").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);

    if (!codigo || !nombre || isNaN(cantidad)) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let datos = JSON.parse(localStorage.getItem("inventario")) || [];
    const producto = { codigo, nombre, cantidad };

    if (editingIndex === -1) datos.push(producto);
    else datos[editingIndex] = producto;

    localStorage.setItem("inventario", JSON.stringify(datos));
    closeForm();
    cargarDatos();
}

function editar(index) {
    const datos = JSON.parse(localStorage.getItem("inventario")) || [];
    const item = datos[index];

    editingIndex = index;

    document.getElementById("tituloForm").innerText = "Editar Producto";
    document.getElementById("codigo").value = item.codigo;
    document.getElementById("nombre").value = item.nombre;
    document.getElementById("cantidad").value = item.cantidad;

    document.getElementById("modal").style.display = "flex";
}

function eliminar(index) {
    if (!confirm("¿Eliminar producto?")) return;

    let datos = JSON.parse(localStorage.getItem("inventario"));
    datos.splice(index, 1);

    localStorage.setItem("inventario", JSON.stringify(datos));
    cargarDatos();
}
