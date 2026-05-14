const STORAGE_VENTAS = "sistema_empresarial_ventas";

let ventas = JSON.parse(localStorage.getItem(STORAGE_VENTAS)) || [];
let editandoVentaId = null;

function persistirVentas() {
  localStorage.setItem(STORAGE_VENTAS, JSON.stringify(ventas));
}

function openFormVenta(id = null) {
  editandoVentaId = id;
  const venta = ventas.find(item => item.id === id);

  document.getElementById("tituloFormVenta").textContent = venta ? "Editar Venta" : "Nueva Venta";
  document.getElementById("producto").value = venta?.producto || "";
  document.getElementById("cantidadVenta").value = venta?.cantidad || "";
  document.getElementById("cliente").value = venta?.cliente || "";
  document.getElementById("modalVenta").style.display = "flex";
}

function closeFormVenta() {
  editandoVentaId = null;
  document.getElementById("modalVenta").style.display = "none";
}

function guardarVenta() {
  const producto = document.getElementById("producto").value.trim();
  const cantidad = Number(document.getElementById("cantidadVenta").value);
  const cliente = document.getElementById("cliente").value.trim();

  if (!producto || !cliente || !Number.isFinite(cantidad) || cantidad <= 0) {
    alert("Completa producto, cantidad valida y cliente.");
    return;
  }

  if (editandoVentaId) {
    ventas = ventas.map(item => item.id === editandoVentaId ? { ...item, producto, cantidad, cliente } : item);
  } else {
    ventas.push({ id: Date.now(), producto, cantidad, cliente });
  }

  persistirVentas();
  closeFormVenta();
  renderVentas();
}

function eliminarVenta(id) {
  if (!confirm("Eliminar venta?")) return;
  ventas = ventas.filter(item => item.id !== id);
  persistirVentas();
  renderVentas();
}

function renderVentas() {
  const tbody = document.querySelector("#tablaVentas tbody");
  tbody.innerHTML = "";

  ventas.forEach(item => {
    const tr = document.createElement("tr");
    [item.id, item.producto, item.cantidad, item.cliente].forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    const acciones = document.createElement("td");
    const editar = document.createElement("button");
    editar.textContent = "Editar";
    editar.onclick = () => openFormVenta(item.id);
    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.className = "btn-delete";
    eliminar.onclick = () => eliminarVenta(item.id);
    acciones.append(editar, eliminar);
    tr.appendChild(acciones);
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", renderVentas);
