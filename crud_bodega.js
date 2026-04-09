const API_BODEGA = "http://localhost:3000/api";

let editingCodigo = null;

/* =========================
   NOTIFICACIÓN VISUAL
========================= */
function mostrarMensaje(texto, tipo = "exito") {
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 20px; border-radius: 6px; font-weight: bold;
    background: ${tipo === "exito" ? "#4caf50" : "#f44336"}; color: white;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

/* =========================
   CARGAR DATOS DESDE EL BACKEND
========================= */
async function cargarDatos() {
  try {
    const res = await fetch(`${API_BODEGA}/reportes-stock`);
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const datos = await res.json();
    renderTablaInventario(datos);
  } catch (err) {
    mostrarMensaje("No se pudo conectar con el servidor", "error");
    console.error(err);
  }
}

/* =========================
   RENDER TABLA
========================= */
function renderTablaInventario(datos) {
  const tbody = document.querySelector("#tablaInventario tbody");
  tbody.innerHTML = "";

  datos.forEach(item => {
    const tr = document.createElement("tr");

    // Usar textContent para evitar XSS
    const celdas = [item.codigo_producto, item.nombre, item.stock, estado(item.stock)];
    celdas.forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    // Celda acciones
    const tdAcciones = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.onclick = () => abrirEditar(item);

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-delete";
    btnEliminar.onclick = () => eliminar(item.codigo_producto);

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnEliminar);
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);
  });
}

/* =========================
   ESTADO DE STOCK
========================= */
function estado(cantidad) {
  if (cantidad > 50) return "OK";
  if (cantidad >= 10) return "Bajo";
  return "Crítico";
}

/* =========================
   ABRIR FORMULARIO
========================= */
function openForm() {
  editingCodigo = null;
  document.getElementById("tituloForm").innerText = "Nuevo Producto";
  document.getElementById("codigo").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("codigo").disabled = false;
  document.getElementById("modal").style.display = "flex";
}

function abrirEditar(item) {
  editingCodigo = item.codigo_producto;
  document.getElementById("tituloForm").innerText = "Actualizar Stock";
  document.getElementById("codigo").value = item.codigo_producto;
  document.getElementById("nombre").value = item.nombre;
  document.getElementById("cantidad").value = "";
  document.getElementById("proveedor").value = item.proveedor || "";
  // No permitir cambiar el código al editar
  document.getElementById("codigo").disabled = true;
  document.getElementById("modal").style.display = "flex";
}

function closeForm() {
  editingCodigo = null;
  document.getElementById("modal").style.display = "none";
}

/* =========================
   GUARDAR PRODUCTO / ACTUALIZAR STOCK
========================= */
async function guardar() {
  const codigo = document.getElementById("codigo").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const proveedor = document.getElementById("proveedor")?.value.trim() || "";
  const fecha_entrada = new Date().toISOString().split("T")[0];

  if (!codigo || !nombre || isNaN(cantidad)) {
    mostrarMensaje("Todos los campos son obligatorios", "error");
    return;
  }

  try {
    if (editingCodigo) {
      // Actualizar stock existente
      const res = await fetch(`${API_BODEGA}/actualizar-stock/${editingCodigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      mostrarMensaje("Stock actualizado correctamente");
    } else {
      // Registrar nueva entrada de mercancía
      const res = await fetch(`${API_BODEGA}/entrada-mercancias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_producto: codigo, nombre, cantidad, proveedor, fecha_entrada })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      mostrarMensaje("Producto registrado correctamente");
    }

    closeForm();
    cargarDatos();
  } catch (err) {
    mostrarMensaje("Error al guardar el producto", "error");
    console.error(err);
  }
}

/* =========================
   ELIMINAR PRODUCTO
========================= */
async function eliminar(codigo) {
  if (!confirm("¿Eliminar producto?")) return;

  try {
    // Ajustar stock a 0 como eliminación lógica
    const res = await fetch(`${API_BODEGA}/actualizar-stock/${codigo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: -9999 }) // El backend lo limita a 0
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);

    mostrarMensaje("Producto eliminado del inventario");
    cargarDatos();
  } catch (err) {
    mostrarMensaje("Error al eliminar el producto", "error");
    console.error(err);
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", cargarDatos);