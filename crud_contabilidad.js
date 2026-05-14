const STORAGE_CONTABILIDAD = "sistema_empresarial_contabilidad";

let registrosContables = JSON.parse(localStorage.getItem(STORAGE_CONTABILIDAD)) || [];
let editandoCuentaId = null;

function persistirContabilidad() {
  localStorage.setItem(STORAGE_CONTABILIDAD, JSON.stringify(registrosContables));
}

function openFormCuenta(id = null) {
  editandoCuentaId = id;
  const registro = registrosContables.find(item => item.id === id);

  document.getElementById("tituloFormContabilidad").textContent = registro ? "Editar Registro" : "Nuevo Registro";
  document.getElementById("cuenta").value = registro?.cuenta || "";
  document.getElementById("monto").value = registro?.monto || "";
  document.getElementById("tipo").value = registro?.tipo || "";
  document.getElementById("modalContabilidad").style.display = "flex";
}

function closeFormCuenta() {
  editandoCuentaId = null;
  document.getElementById("modalContabilidad").style.display = "none";
}

function guardarCuenta() {
  const cuenta = document.getElementById("cuenta").value.trim();
  const monto = Number(document.getElementById("monto").value);
  const tipo = document.getElementById("tipo").value.trim();

  if (!cuenta || !Number.isFinite(monto) || monto <= 0 || !tipo) {
    alert("Completa cuenta, monto valido y tipo.");
    return;
  }

  if (editandoCuentaId) {
    registrosContables = registrosContables.map(item => (
      item.id === editandoCuentaId ? { ...item, cuenta, monto, tipo } : item
    ));
  } else {
    registrosContables.push({ id: Date.now(), cuenta, monto, tipo });
  }

  persistirContabilidad();
  closeFormCuenta();
  renderContabilidad();
}

function eliminarCuenta(id) {
  if (!confirm("Eliminar registro?")) return;
  registrosContables = registrosContables.filter(item => item.id !== id);
  persistirContabilidad();
  renderContabilidad();
}

function renderContabilidad() {
  const tbody = document.querySelector("#tablaContabilidad tbody");
  tbody.innerHTML = "";

  registrosContables.forEach(item => {
    const tr = document.createElement("tr");
    [item.id, item.cuenta, item.monto, item.tipo].forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    const acciones = document.createElement("td");
    const editar = document.createElement("button");
    editar.textContent = "Editar";
    editar.onclick = () => openFormCuenta(item.id);
    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.className = "btn-delete";
    eliminar.onclick = () => eliminarCuenta(item.id);
    acciones.append(editar, eliminar);
    tr.appendChild(acciones);
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", renderContabilidad);
