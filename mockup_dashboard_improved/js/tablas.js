const categories = ['A','B','C'];
const startData = new Date();
startData.setMonth(startData.getMonth() - 5);
startData.setDate(1);

function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const rawData = [];
let cur = new Date(startData);
const days = 180;
for(let i=0;i<days;i++){
  const date = addDays(startData, i);
  // 1-3 registros por día
  for(let k=0;k<1;k++){
    const cat = categories[Math.floor(Math.random()*categories.length)];
    rawData.push({
      date: date.toISOString().slice(0,10),
      category: cat,
      value: Math.floor(20 + Math.random()*300)
    });
  }
}

// === Elementos DOM ===
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const categorySelect = document.getElementById('categorySelect');
const applyBtn = document.getElementById('applyFilters');
const resetBtn = document.getElementById('resetFilters');

// Rellenar selector de categorias
(function populateCategories(){
  const set = new Set(rawData.map(r=>r.category));
  const cats = Array.from(set).sort();
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = `Categoría ${c}`;
    categorySelect.appendChild(opt);
  });
})();

// Inicializar fechas inputs
(function initDates(){
  const dates = rawData.map(r=>r.date).sort();
  const min = dates[0];
  const max = dates[dates.length-1];
  startDateInput.value = min;
  endDateInput.value = max;
})();

// === Utilidades para agregación por mes y por categoria ===
function formatMonthLabel(isoDate){
  const d = new Date(isoDate);
  return d.toLocaleString('es-EC',{month:'short',year:'numeric'});
}

function aggregateMonthly(data){
  // devuelve {labels: [...], totals: [...]}
  const map = new Map();
  data.forEach(r=>{
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    map.set(key,(map.get(key)||0)+r.value);
  });
  const keys = Array.from(map.keys()).sort();
  return {
    labels: keys.map(k=>{
      const parts = k.split('-');
      return new Date(parts[0], parseInt(parts[1],10)-1,1).toLocaleString('es-EC',{month:'short'});
    }),
    totals: keys.map(k=>map.get(k))
  };
}

function aggregateCategory(data){
  const map = new Map();
  data.forEach(r=> map.set(r.category,(map.get(r.category)||0)+r.value));
  const keys = Array.from(map.keys()).sort();
  return {labels:keys, totals:keys.map(k=>map.get(k))};
}

function aggregateByDay(data){
  // para sparkline: labels day numbers relative
  const map = new Map();
  data.forEach(r=>{
    map.set(r.date,(map.get(r.date)||0)+r.value);
  });
  const keys = Array.from(map.keys()).sort();
  return {labels:keys, totals:keys.map(k=>map.get(k))};
}

// === Filtrado segun inputs ===
function filterData(){
  const sd = startDateInput.value;
  const ed = endDateInput.value;
  const cat = categorySelect.value;

  return rawData.filter(r=>{
    if(sd && r.date < sd) return false;
    if(ed && r.date > ed) return false;
    if(cat !== 'all' && r.category !== cat) return false;
    return true;
  });
}

// === Crear gráficos con Chart.js ===
let chartBar, chartHBar, chartLine, chartArea, chartD1, chartD2, chartSpark, chartCombo;

function createCharts(initialData){
  const monthAgg = aggregateMonthly(initialData);
  const catAgg = aggregateCategory(initialData);
  const dayAgg = aggregateByDay(initialData);

  // Bar (Título 1)
  chartBar = new Chart(document.getElementById('chartBar'), {
    type:'bar',
    data:{
      labels: monthAgg.labels,
      datasets:[{label:'Ventas', data: monthAgg.totals, borderRadius:4}]
    },
    options:{responsive:true, plugins:{legend:{display:false}}}
  });

  // Horizontal Bar (Título 2)
  chartHBar = new Chart(document.getElementById('chartHBar'), {
    type:'bar',
    data:{
      labels: catAgg.labels,
      datasets:[{label:'Por cat', data:catAgg.totals, barThickness:18}]
    },
    options:{
      indexAxis:'y',
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{x:{ticks:{callback: v => v}}}
    }
  });

  // Line (Título 3)
  chartLine = new Chart(document.getElementById('chartLine'), {
    type:'line',
    data:{
      labels: monthAgg.labels,
      datasets:[{label:'Tendencia', data: monthAgg.totals, fill:false, tension:0.3}]
    },
    options:{responsive:true, plugins:{legend:{display:false}}}
  });

  // Area (Título 4)
  chartArea = new Chart(document.getElementById('chartArea'), {
    type:'line',
    data:{
      labels: monthAgg.labels,
      datasets:[{label:'Acumulado', data: monthAgg.totals, fill:true, tension:0.35}]
    },
    options:{responsive:true, plugins:{legend:{display:false}}}
  });

  // Doughnut 1 (Título 5)
  chartD1 = new Chart(document.getElementById('chartDoughnut1'), {
    type:'doughnut',
    data:{
      labels: catAgg.labels,
      datasets:[{data:catAgg.totals}]
    },
    options:{responsive:true}
  });

  // Doughnut 2 (Título 7) - muestra los mismos datos con distinta apariencia
  chartD2 = new Chart(document.getElementById('chartDoughnut2'), {
    type:'doughnut',
    data:{
      labels: catAgg.labels,
      datasets:[{data:catAgg.totals}]
    },
    options:{responsive:true}
  });

  // Sparkline (Título 9)
  chartSpark = new Chart(document.getElementById('chartSpark'), {
    type:'line',
    data:{
      labels: dayAgg.labels,
      datasets:[{label:'Diario', data: dayAgg.totals, fill:true, tension:0.3}]
    },
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{display:true}}}
  });

  // Combo (Título 10) bar + line
  chartCombo = new Chart(document.getElementById('chartCombo'), {
    data:{
      labels: monthAgg.labels,
      datasets:[
        {type:'bar', label:'Ventas', data:monthAgg.totals},
        {type:'line', label:'Promedio', data: computeMovingAverage(monthAgg.totals,3), tension:0.3, fill:false}
      ]
    },
    options:{responsive:true}
  });
}

function computeMovingAverage(arr, windowSize){
  if(!arr || arr.length===0) return [];
  const res = [];
  for(let i=0;i<arr.length;i++){
    const start = Math.max(0,i-windowSize+1);
    const slice = arr.slice(start,i+1);
    const avg = Math.round(slice.reduce((a,b)=>a+b,0)/slice.length);
    res.push(avg);
  }
  return res;
}

// Actualizar datos de todos los charts
function updateCharts(){
  const filtered = filterData();
  const m = aggregateMonthly(filtered);
  const c = aggregateCategory(filtered);
  const d = aggregateByDay(filtered);

  // Helper para actualizar una chart de tipo line/bar/doughnut
  function update(chart, newLabels, newData){
    if(!chart) return;
    chart.data.labels = newLabels;
    chart.data.datasets.forEach((ds,i)=>{
      // si coincidencias de datasets, asignar data si existe
      if(newData instanceof Array){
        // si hay un dataset único: usar newData (array)
        chart.data.datasets[i].data = newData;
      }
    });
    chart.update();
  }

  // actualizar varios según corresponda:
  if(chartBar){
    chartBar.data.labels = m.labels;
    chartBar.data.datasets[0].data = m.totals;
    chartBar.update();
  }
  if(chartHBar){
    chartHBar.data.labels = c.labels;
    chartHBar.data.datasets[0].data = c.totals;
    chartHBar.update();
  }
  if(chartLine){
    chartLine.data.labels = m.labels;
    chartLine.data.datasets[0].data = m.totals;
    chartLine.update();
  }
  if(chartArea){
    chartArea.data.labels = m.labels;
    chartArea.data.datasets[0].data = m.totals;
    chartArea.update();
  }
  if(chartD1){
    chartD1.data.labels = c.labels;
    chartD1.data.datasets[0].data = c.totals;
    chartD1.update();
  }
  if(chartD2){
    chartD2.data.labels = c.labels;
    chartD2.data.datasets[0].data = c.totals;
    chartD2.update();
  }
  if(chartSpark){
    chartSpark.data.labels = d.labels;
    chartSpark.data.datasets[0].data = d.totals;
    chartSpark.update();
  }
  if(chartCombo){
    chartCombo.data.labels = m.labels;
    chartCombo.data.datasets[0].data = m.totals;
    chartCombo.data.datasets[1].data = computeMovingAverage(m.totals,3);
    chartCombo.update();
  }
}

// Eventos botones
applyBtn.addEventListener('click', ()=> {
  updateCharts();
});
resetBtn.addEventListener('click', ()=> {
  startDateInput.value = rawData.map(r=>r.date).sort()[0];
  endDateInput.value = rawData.map(r=>r.date).sort().slice(-1)[0];
  categorySelect.value = 'all';
  updateCharts();
});

// Inicializar todo al cargar
document.addEventListener('DOMContentLoaded', ()=>{
  createCharts(rawData);
  // primera actualización para asegurar datos correctos segun inputs iniciales
  updateCharts();
});
