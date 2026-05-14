const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("validacion estatica de entrega", () => {
  it("declara las dependencias usadas por el servidor", () => {
    const pkg = JSON.parse(read("package.json"));
    assert.equal(pkg.scripts.test, "node --test");
    assert.ok(pkg.dependencies.express);
    assert.ok(pkg.dependencies.cors);
    assert.ok(pkg.dependencies.bcrypt);
    assert.ok(pkg.dependencies.jsonwebtoken);
  });

  it("mantiene openapi.json como JSON valido", () => {
    const spec = JSON.parse(read("openapi.json"));
    assert.equal(spec.openapi, "3.0.0");
    assert.ok(spec.paths["/api/auth/login"]);
    assert.ok(spec.paths["/api/usuarios"]);
    assert.ok(spec.paths["/api/reportes-stock"]);
  });

  it("no referencia scripts locales inexistentes desde HTML", () => {
    const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith(".html"));
    const missing = [];

    for (const file of htmlFiles) {
      const html = read(file);
      const scripts = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)];
      for (const [, src] of scripts) {
        if (/^https?:\/\//i.test(src)) continue;
        const scriptPath = path.join(root, src);
        if (!fs.existsSync(scriptPath)) missing.push(`${file} -> ${src}`);
      }
    }

    assert.deepEqual(missing, []);
  });

  it("mantiene el flujo de administracion conectado al login y al CRUD", () => {
    const admin = read("administracion.html");
    const app = read("app.js");
    const crud = read("crud_usuarios.js");

    assert.match(admin, /id="loginForm"/);
    assert.match(admin, /<script src="crud_usuarios\.js"><\/script>/);
    assert.match(admin, /<script src="app\.js"><\/script>/);
    assert.match(app, /api\/auth\/login/);
    assert.match(crud, /api\/usuarios/);
  });
});
