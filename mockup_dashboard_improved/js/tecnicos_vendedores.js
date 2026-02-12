document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const dropdown = document.getElementById("menu-dropdown");
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== menuBtn) dropdown.style.display = "none";
  });

  const tabla = document.querySelector("tbody");

  // 🔹 Técnico base fijo
  const tecnicoBase = {
    nombre: "Gabriel Galarza",
    email: "ggalarza@webposonline.net",
    telefono: "0988448152",
    rol: "Técnico Integrador",
  };

  // Cargar o inicializar
  let personal = JSON.parse(localStorage.getItem("personal")) || [];

  // Si aún no existe el técnico base, agregarlo automáticamente
  if (!personal.some((p) => p.email === tecnicoBase.email)) {
    personal.unshift(tecnicoBase);
    localStorage.setItem("personal", JSON.stringify(personal));
  }

  const guardarLocal = () => localStorage.setItem("personal", JSON.stringify(personal));

  const mostrarToast = (mensaje) => {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  };

  const renderizarTabla = () => {
    tabla.innerHTML = "";
    personal.forEach((p, i) => {
      const colorRol = p.rol === "Vendedor" ? "#15803d" : "#1e40af";
      const iconoRol = p.rol === "Vendedor" ? "💼" : "🔧";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <strong>${p.nombre}</strong>
            <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:13px;color:#475569;">
              <span>${p.email}</span>
              <span>${p.telefono}</span>
              <span style="color:${colorRol};font-weight:600;">${iconoRol} ${p.rol}</span>
            </div>
          </div>
        </td>
        <td class="actions">
          <button class="edit-btn" data-index="${i}" title="Editar">✏️</button>
          <button class="delete-btn" data-index="${i}" title="Eliminar">🗑️</button>
        </td>`;
      tabla.appendChild(tr);
    });
  };

  // --- MODALES ---
  const modalTec = document.getElementById("modal-tecnico");
  const modalVen = document.getElementById("modal-vendedor");
  const modalEdit = document.getElementById("modal-editar");
  const modalDel = document.getElementById("modal-eliminar");

  // Agregar Técnico
  document.getElementById("add-tecnico-btn").addEventListener("click", () => (modalTec.style.display = "flex"));
  document.getElementById("cancelar-btn").addEventListener("click", () => (modalTec.style.display = "none"));
  document.getElementById("guardar-btn").addEventListener("click", () => {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    if (!nombre || !email || !telefono) return mostrarToast("⚠️ Completa todos los campos");

    personal.push({ nombre, email, telefono, rol: "Técnico Integrador" });
    guardarLocal();
    renderizarTabla();
    modalTec.style.display = "none";
    mostrarToast("👨‍🔧 Técnico agregado ✅");
  });

  // Agregar Vendedor
  document.getElementById("add-vendedor-btn").addEventListener("click", () => (modalVen.style.display = "flex"));
  document.getElementById("cancelar-v-btn").addEventListener("click", () => (modalVen.style.display = "none"));
  document.getElementById("guardar-v-btn").addEventListener("click", () => {
    const nombre = document.getElementById("nombre-v").value.trim();
    const email = document.getElementById("email-v").value.trim();
    const telefono = document.getElementById("telefono-v").value.trim();
    if (!nombre || !email || !telefono) return mostrarToast("⚠️ Completa todos los campos");

    personal.push({ nombre, email, telefono, rol: "Vendedor" });
    guardarLocal();
    renderizarTabla();
    modalVen.style.display = "none";
    mostrarToast("🧑‍💼 Vendedor agregado ✅");
  });

  // Eliminar
  let indexEliminar = null;
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      indexEliminar = e.target.dataset.index;
      document.getElementById("nombre-eliminar").textContent = personal[indexEliminar].nombre;
      modalDel.style.display = "flex";
    }
  });
  document.getElementById("volver-btn").addEventListener("click", () => (modalDel.style.display = "none"));
  document.getElementById("eliminar-btn").addEventListener("click", () => {
    personal.splice(indexEliminar, 1);
    guardarLocal();
    renderizarTabla();
    modalDel.style.display = "none";
    mostrarToast("🗑️ Usuario eliminado ✅");
  });

  // Editar
  let indexEditar = null;
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      indexEditar = e.target.dataset.index;
      const p = personal[indexEditar];
      document.getElementById("edit-nombre").value = p.nombre;
      document.getElementById("edit-email").value = p.email;
      document.getElementById("edit-telefono").value = p.telefono;
      modalEdit.style.display = "flex";
    }
  });
  document.getElementById("guardar-edit-btn").addEventListener("click", () => {
    const nombre = document.getElementById("edit-nombre").value.trim();
    const email = document.getElementById("edit-email").value.trim();
    const telefono = document.getElementById("edit-telefono").value.trim();
    if (!nombre || !email || !telefono) return mostrarToast("⚠️ Completa todos los campos");

    personal[indexEditar].nombre = nombre;
    personal[indexEditar].email = email;
    personal[indexEditar].telefono = telefono;
    guardarLocal();
    renderizarTabla();
    modalEdit.style.display = "none";
    mostrarToast("✏️ Datos actualizados ✅");
  });
  document.getElementById("cancelar-edit-btn").addEventListener("click", () => (modalEdit.style.display = "none"));

  // Iniciar
  renderizarTabla();
});
