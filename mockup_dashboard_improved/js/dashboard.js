// =============================
// Control de vistas y tareas
// =============================
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav.sidebar .menu button").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      showView(view);
      if (view === "tickets") renderTareas();
    });
  });

  const initial = location.hash ? location.hash.replace("#", "") : "dashboard";
  showView(initial);
  renderTareas();

  const form = document.getElementById("ticketForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nuevaTarea = {
        id: "TAR-" + Math.floor(Math.random() * 900 + 100),
        titulo: document.getElementById("asunto").value || "Sin título",
        descripcion: document.getElementById("descripcion").value || "",
        prioridad: document.getElementById("prioridad").value,
        estado: "Abierto",
      };
      tareas.unshift(nuevaTarea);
      localStorage.setItem("tareas", JSON.stringify(tareas));
      alert("Tarea creada ✅ " + nuevaTarea.id);
      form.reset();
      showView("tickets");
      renderTareas();
    });
  }
});

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(name)?.classList.add("active");
  document.querySelectorAll("nav.sidebar .menu button").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === name);
  });
}

function renderTareas() {
  const tbody = document.querySelector("#ticketsTable tbody");
  if (!tbody) return;
  const q = document.getElementById("q")?.value?.toLowerCase() || "";
  const estado = document.getElementById("fEstado")?.value || "";

  const filtradas = tareas.filter(t => {
    if (estado && t.estado !== estado) return false;
    if (!q) return true;
    return (
      t.id.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      (t.descripcion || "").toLowerCase().includes(q)
    );
  });

  tbody.innerHTML = filtradas.length
    ? filtradas.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.titulo}</td>
        <td>${t.descripcion || "—"}</td>
        <td>${t.prioridad}</td>
        <td><span class="status ${t.estado.toLowerCase()}">${t.estado}</span></td>
        <td>
          <button class="btn secondary" onclick="verTarea('${t.id}')">Ver</button>
          <button class="btn logout" style="padding:6px 10px;" onclick="eliminarTarea('${t.id}')">🗑</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center;padding:20px;">No hay tareas aún.</td></tr>`;
}

// =============================
// Modal Ver Tarea
// =============================
function verTarea(id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return alert("No se encontró la tarea.");
  document.getElementById("modal-titulo").textContent = tarea.titulo;
  document.getElementById("modal-id").textContent = tarea.id;
  document.getElementById("modal-descripcion").textContent = tarea.descripcion || "—";
  document.getElementById("modal-prioridad").textContent = tarea.prioridad;
  document.getElementById("modal-estado").textContent = tarea.estado;
  document.getElementById("modal-ver-tarea").dataset.id = id;
  document.getElementById("modal-ver-tarea").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-ver-tarea").classList.remove("active");
}

document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);
document.getElementById("modal-ver-tarea").addEventListener("click", e => {
  if (e.target.id === "modal-ver-tarea") cerrarModal();
});

document.getElementById("btn-cerrar-tarea").addEventListener("click", () => {
  const id = document.getElementById("modal-ver-tarea").dataset.id;
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;
  tarea.estado = "Cerrado";
  localStorage.setItem("tareas", JSON.stringify(tareas));
  renderTareas();
  cerrarModal();
});

document.getElementById("btn-eliminar-tarea").addEventListener("click", () => {
  const id = document.getElementById("modal-ver-tarea").dataset.id;
  if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;
  tareas = tareas.filter(t => t.id !== id);
  localStorage.setItem("tareas", JSON.stringify(tareas));
  renderTareas();
  cerrarModal();
});

function exportCSV() {
  if (tareas.length === 0) return alert("No hay tareas.");
  const header = "ID,Título,Descripción,Prioridad,Estado\n";
  const rows = tareas.map(
    t => `${t.id},"${t.titulo}","${t.descripcion}",${t.prioridad},${t.estado}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tareas.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function exportPDF() { alert("Exportar PDF — demo visual"); }
function saveDraft() { alert("Borrador guardado correctamente (demo)."); }

const ctx2 = document.getElementById("graficaBarras").getContext("2d");
new Chart(ctx2, {
  type: "bar",
  data: {
    labels: ["Vendedor 1", "Vendedor 2", "Vendedor 3", "Vendedor 4", "Vendedor 5", "Vendedor 6"],
    datasets: [{
      label: "Tareas realizadas",
      data: [15, 30, 5, 20, 25, 10], // número de tareas realizadas
      backgroundColor: [
        "#3b82f6", "#10b981", "#f59e0b",
        "#8b5cf6", "#ec4899", "#06b6d4"
      ],
      borderRadius: 10,
      borderSkipped: false
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e3a8a",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const tareas = context.raw;
            return `Tareas realizadas: ${tareas}`;
          },
          title: function(context) {
            return context[0].label; // muestra "Vendedor X"
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#1e3a8a", font: { size: 13, weight: "600" } }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#1e3a8a", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" }
      }
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce"
    }
  }
});
// === GRÁFICA DE BARRAS - VENDEDORES ===
const barrasCanvasV = document.getElementById("graficaBarrasVendedores");
if (barrasCanvasV) {
  const ctx2 = barrasCanvasV.getContext("2d");
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Vendedor 1", "Vendedor 2", "Vendedor 3", "Vendedor 4", "Vendedor 5", "Vendedor 6"],
      datasets: [{
        label: "Tareas realizadas",
        data: [15, 30, 5, 20, 25, 10],
        backgroundColor: ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4"],
        hoverBackgroundColor: ["#2563eb","#059669","#d97706","#7c3aed","#db2777","#0891b2"],
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e3a8a",
          titleColor: "#fff",
          bodyColor: "#fff",
          cornerRadius: 8,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#1e3a8a", font: { size: 13, weight: "600" } }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Tareas realizadas",
            color: "#1e3a8a",
            font: { size: 14, weight: "600" }
          },
          ticks: { color: "#1e3a8a", font: { size: 12 } },
          grid: { color: "rgba(0,0,0,0.05)" }
        }
      }
    }
  });
}

// === GRÁFICA DE BARRAS - TÉCNICOS ===
const barrasCanvasT = document.getElementById("graficaBarrasTecnicos");
if (barrasCanvasT) {
  const ctx3 = barrasCanvasT.getContext("2d");
  new Chart(ctx3, {
    type: "bar",
    data: {
      labels: ["Técnico 1", "Técnico 2", "Técnico 3", "Técnico 4"],
      datasets: [{
        label: "Tareas completadas",
        data: [22, 18, 12, 30],
        backgroundColor: ["#22c55e","#3b82f6","#f59e0b","#8b5cf6"],
        hoverBackgroundColor: ["#16a34a","#2563eb","#d97706","#7c3aed"],
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e3a8a",
          titleColor: "#fff",
          bodyColor: "#fff",
          cornerRadius: 8,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#1e3a8a", font: { size: 13, weight: "600" } }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Tareas completadas",
            color: "#1e3a8a",
            font: { size: 14, weight: "600" }
          },
          ticks: { color: "#1e3a8a", font: { size: 12 } },
          grid: { color: "rgba(0,0,0,0.05)" }
        }
      }
    }
  });
}


