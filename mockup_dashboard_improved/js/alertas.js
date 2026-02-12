// --- MENÚ DESPLEGABLE ---
const menuBtn = document.getElementById("menu-btn");
const dropdown = document.getElementById("menu-dropdown");

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

window.addEventListener("click", (e) => {
  if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// --- FUNCIONALIDAD DE ALERTAS ---
const ALERTS_DEF = [
  { id: 'A1', title: 'Alerta de Certificación', enabled: true, recipients: ['gerencia', 'vendedor'] },
  { id: 'A2', title: 'Inactividad prolongada', enabled: true, recipients: ['tecnico'] },
  { id: 'A3', title: 'Alerta Gerencial', enabled: true, recipients: ['gerencia'] }
];

const alertsCountEl = document.getElementById('alertsCount');
const alertsListEl = document.getElementById('alertsList');
const logEl = document.getElementById('log');

function renderAlerts() {
  const count = parseInt(alertsCountEl.value, 10);
  alertsListEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const def = ALERTS_DEF[i] || { id: `AX${i + 1}`, title: `Alerta adicional ${i + 1}`, enabled: false, recipients: [] };
    const div = document.createElement('div');
    div.className = 'p-4 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 hover:shadow-md transition';
    div.innerHTML = `
      <div class='flex justify-between items-center'> 
        <div>
          <div class='font-semibold text-blue-800'>${def.title}</div>
          <div class='text-xs text-blue-600'>ID: ${def.id}</div>
        </div>
        <div class='flex items-center gap-2'>
          <label class='text-xs font-medium text-blue-700'>Habilitar</label>
          <input type='checkbox' data-alert-id='${def.id}' ${def.enabled ? 'checked' : ''} class='toggle-enable accent-blue-700' />
        </div>
      </div>
      <div class='mt-3 text-xs font-medium text-blue-700'>Destinatarios:</div>
      <div class='mt-2 flex flex-wrap gap-3 text-xs text-blue-700'>
        <label class='flex items-center gap-1'><input type='checkbox' data-recipient='tecnico' data-alert-id='${def.id}' ${def.recipients.includes('tecnico') ? 'checked' : ''} class='accent-blue-700'/> Técnico</label>
        <label class='flex items-center gap-1'><input type='checkbox' data-recipient='vendedor' data-alert-id='${def.id}' ${def.recipients.includes('vendedor') ? 'checked' : ''} class='accent-blue-700'/> Vendedor</label>
        <label class='flex items-center gap-1'><input type='checkbox' data-recipient='gerencia' data-alert-id='${def.id}' ${def.recipients.includes('gerencia') ? 'checked' : ''} class='accent-blue-700'/> Gerencia</label>
      </div>
    `;
    alertsListEl.appendChild(div);
  }
}

renderAlerts();
alertsCountEl.addEventListener('change', renderAlerts);

function log(text) {
  const p = document.createElement('div');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logEl.prepend(p);
}

document.getElementById('saveConfig').addEventListener('click', () => {
  log('Configuración guardada exitosamente ✅');
});

document.getElementById('previewEmail').addEventListener('click', () => {
  log('Previsualizando plantillas de correo ✉️');
});

document.getElementById('sendTestEmails').addEventListener('click', () => {
  log('Se enviaron correos de prueba a los destinatarios configurados 📤');
});

log('Dashboard cargado correctamente 🚀');
