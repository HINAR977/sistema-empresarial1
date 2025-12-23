const API_URL = "http://localhost:3000/api/bodega";

async function cargarBodega() {
  const res = await fetch(API_URL);
  const data = await res.json();
  console.log(data);
}

async function agregarProducto() {
  const producto = {
    nombre: "Pan dulce",
    stock: 50,
    precio: 0.30
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto)
  });

  cargarBodega();
}
