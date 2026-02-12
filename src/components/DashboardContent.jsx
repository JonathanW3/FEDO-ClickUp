import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChartJS from 'chart.js/auto';

import { obtenerImplementaciones } from '../utils/apiUtils';

/**
 * PieChartEstados: componente para mostrar gráfico doughnut de estados
 */
function PieChartEstados({ estados }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!estados || Object.keys(estados).length === 0) return;

    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#6B7280', '#A3A3A3', '#F472B6',
    ];

    const chartInstance = new ChartJS(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(estados),
        datasets: [
          {
            data: Object.values(estados),
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 20, font: { size: 12, weight: '500' }, color: '#374151' },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
      },
    });

    return () => chartInstance.destroy();
  }, [estados]);

  return (
    <div style={{ width: 340, height: 340 }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

function DashboardContent() {
  // UI: panel flotante de filtros globales
  const [mostrarFiltrosGlobales, setMostrarFiltrosGlobales] = useState(false);
  const [fechaDesdeGlobal, setFechaDesdeGlobal] = useState('');
  const [fechaHastaGlobal, setFechaHastaGlobal] = useState('');

  // Estados principales del dashboard
  const [datosImplementaciones, setDatosImplementaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTecnico: {},
    porVendedor: {},
    porCertificacion: {},
    porEstado: {},
    añosDisponibles: [],
  });
  const [error, setError] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Filtros de fecha para Empresas Incorporadas (gráfico de línea)
  const [fechaDesdeEmpresas, setFechaDesdeEmpresas] = useState('');
  const [fechaHastaEmpresas, setFechaHastaEmpresas] = useState('');

  // Filtros para gráficos de montos/abonos
  const [filtroMontos, setFiltroMontos] = useState('todos');
  const [filtroAbonos, setFiltroAbonos] = useState('todos');

  // Modal principal (técnico/vendedor/certificación/estado)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosModal, setDatosModal] = useState({});
  const [filtrosModal, setFiltrosModal] = useState({ busqueda: '', estado: 'todos', certificacion: 'todos' });

  // Filtros de fecha para el modal de técnico
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modal Empresas Incorporadas (click en gráfico de línea)
  const [modalEmpresasAbierto, setModalEmpresasAbierto] = useState(false);
  const [datosModalEmpresas, setDatosModalEmpresas] = useState({ nombre: '', empresas: [] });

  // Referencias para los gráficos
  const pieRef = useRef(null);
  const pieEstadoRef = useRef(null);
  const vendRef = useRef(null);
  const tecRef = useRef(null);
  const lineRef = useRef(null);
  const barMontoRef = useRef(null);
  const barAbonosRef = useRef(null);

  // Mantener instancias para destruirlas en cada render de charts
  const chartInstancesRef = useRef({
    pie: null,
    pieEstado: null,
    vend: null,
    tec: null,
    line: null,
    barMonto: null,
    barAbonos: null,
  });

  const cargarDatosImplementaciones = async () => {
    try {
      setCargandoDatos(true);
      setError(null);

      const data = await obtenerImplementaciones();
      setDatosImplementaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error al cargar datos: ${err?.message ?? 'desconocido'}`);
    } finally {
      setCargandoDatos(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosImplementaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useMemo globales para evitar violar reglas de hooks
  const empresasFiltradasMemo = useMemo(() => {
    if (!modalAbierto || datosModal.tipo !== 'tecnico-pie' || !Array.isArray(datosModal.empresas)) return [];
    return datosModal.empresas.filter((e) => {
      if (!e.fecha || e.fecha === 'N/A') return false;
      const fecha = new Date(e.fecha);
      if (fechaDesde && new Date(fechaDesde) > fecha) return false;
      if (fechaHasta && new Date(fechaHasta) < fecha) return false;
      return true;
    });
  }, [modalAbierto, datosModal.tipo, datosModal.empresas, fechaDesde, fechaHasta]);

  const estadosFiltradosMemo = useMemo(() => {
    if (!modalAbierto || datosModal.tipo !== 'tecnico-pie') return {};
    const conteo = {};
    empresasFiltradasMemo.forEach((e) => {
      const key = e.estado || 'Sin especificar';
      conteo[key] = (conteo[key] || 0) + 1;
    });
    return conteo;
  }, [modalAbierto, datosModal.tipo, empresasFiltradasMemo]);

  useEffect(() => {
    // Solo crear gráficos cuando los datos estén cargados
    if (cargandoDatos || error || datosImplementaciones.length === 0) return;

    // Destruir instancias previas (si existen)
    Object.values(chartInstancesRef.current).forEach((inst) => {
      if (inst && typeof inst.destroy === 'function') inst.destroy();
    });
    chartInstancesRef.current = { pie: null, pieEstado: null, vend: null, tec: null, line: null, barMonto: null, barAbonos: null };

    const colors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      purple: '#8B5CF6',
      pink: '#EC4899',
      cyan: '#06B6D4',
      gray: '#6B7280',
    };

    // Calcular estadísticas reales de los datos
    const estadisticasTemp = {
      total: 0,
      porTecnico: {},
      porVendedor: {},
      porCertificacion: {
        'Sin empezar Certificación': 0,
        'Paso 4 Envío de Pruebas': 0,
        'Paso 6 Validación RI': 0,
        'Paso 13 Declaración Jurada': 0,
        'Paso 15 Finalización': 0,
        'Sin Iniciar': 0,
      },
      porEstado: {},
      añosDisponibles: [],
    };

    let totalEmpresas = 0;

    const coincideCertificacion = (certificacionSeleccionada, certRaw) => {
      const cert = (certRaw || '').trim();
      const certLower = cert.toLowerCase();
      if (certificacionSeleccionada === 'Sin Iniciar') return cert === '';
      if (certificacionSeleccionada === 'Paso 15 Finalización') return certLower.includes('paso 15') || certLower.includes('finalización') || certLower.includes('finalizacion');
      if (certificacionSeleccionada === 'Paso 13 Declaración Jurada') return certLower.includes('paso 13') || certLower.includes('declaración jurada') || certLower.includes('declaracion jurada');
      if (certificacionSeleccionada === 'Paso 6 Validación RI') return certLower.includes('paso 6') || certLower.includes('validación ri') || certLower.includes('validacion ri');
      if (certificacionSeleccionada === 'Paso 4 Envío de Pruebas') return certLower.includes('paso 4') || certLower.includes('envío de pruebas') || certLower.includes('envio de pruebas');
      if (certificacionSeleccionada === 'Sin empezar Certificación') return certLower.includes('sin empezar');
      return false;
    };

    datosImplementaciones.forEach((item) => {
      const procesarEmpresa = (empresa, esPadre = true) => {
        totalEmpresas += 1;

        const tecnico =
          item.tecniconombre || item.nombretecnico || item.tecnico || item['técnico'] || item['nombretécnico'] || 'Sin asignar';
        estadisticasTemp.porTecnico[tecnico] = (estadisticasTemp.porTecnico[tecnico] || 0) + 1;

        const vendedor = item.vendedornombre || item.nombrevendedor || item.vendedor || 'Sin asignar';
        estadisticasTemp.porVendedor[vendedor] = (estadisticasTemp.porVendedor[vendedor] || 0) + 1;

        const cert = esPadre ? (item.certificacionempresapadre || '').trim() : (empresa.estado_hija || '').trim();
        const certLower = cert.toLowerCase();

        if (cert === '') estadisticasTemp.porCertificacion['Sin Iniciar'] += 1;
        else if (certLower.includes('paso 15') || certLower.includes('finalización') || certLower.includes('finalizacion'))
          estadisticasTemp.porCertificacion['Paso 15 Finalización'] += 1;
        else if (certLower.includes('paso 13') || certLower.includes('declaración jurada') || certLower.includes('declaracion jurada'))
          estadisticasTemp.porCertificacion['Paso 13 Declaración Jurada'] += 1;
        else if (certLower.includes('paso 6') || certLower.includes('validación ri') || certLower.includes('validacion ri'))
          estadisticasTemp.porCertificacion['Paso 6 Validación RI'] += 1;
        else if (certLower.includes('paso 4') || certLower.includes('envío de pruebas') || certLower.includes('envio de pruebas'))
          estadisticasTemp.porCertificacion['Paso 4 Envío de Pruebas'] += 1;
        else if (certLower.includes('sin empezar')) estadisticasTemp.porCertificacion['Sin empezar Certificación'] += 1;
        else estadisticasTemp.porCertificacion['Sin Iniciar'] += 1;

        const estado = esPadre ? (item.estadoempresapadre || 'Sin especificar').trim() : (empresa.estado_hija || 'Sin especificar').trim();
        estadisticasTemp.porEstado[estado] = (estadisticasTemp.porEstado[estado] || 0) + 1;
      };

      procesarEmpresa(item, true);

      if (Array.isArray(item.empresas_hijas_json) && item.empresas_hijas_json.length > 0) {
        item.empresas_hijas_json.forEach((hija) => procesarEmpresa(hija, false));
      }
    });

    estadisticasTemp.total = totalEmpresas;

    // Años disponibles
    const añosDisponibles = [...new Set(
      datosImplementaciones
        .map((item) => {
          if (!item.fecha_contratacion) return null;
          const fecha = new Date(item.fecha_contratacion);
          return isNaN(fecha.getTime()) ? null : fecha.getFullYear();
        })
        .filter((a) => a !== null)
    )].sort((a, b) => a - b);

    estadisticasTemp.añosDisponibles = añosDisponibles;
    setEstadisticas(estadisticasTemp);

    // PIE Certificaciones (con onClick + modal)
    if (pieRef.current) {
      chartInstancesRef.current.pie = new ChartJS(pieRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(estadisticasTemp.porCertificacion),
          datasets: [
            {
              data: Object.values(estadisticasTemp.porCertificacion),
              backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'],
              borderWidth: 0,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          onClick: (_event, elements) => {
            if (!elements?.length) return;
            const index = elements[0].index;
            const labels = Object.keys(estadisticasTemp.porCertificacion);
            const certificacionSeleccionada = labels[index];

            const empresasCertificacion = [];
            datosImplementaciones.forEach((item) => {
              const certPadre = (item.certificacionempresapadre || '').trim();
              if (coincideCertificacion(certificacionSeleccionada, certPadre)) {
                empresasCertificacion.push({
                  nombre: item.nombreempresapadre || 'Sin nombre',
                  rnc: item.rncempresapadre || 'N/A',
                  estado: item.estadoempresapadre || 'N/A',
                  certificacion: item.certificacionempresapadre || 'Sin iniciar',
                  fecha: item.fecha_contratacion || 'N/A',
                  tipo: 'Principal',
                });
              }
              if (Array.isArray(item.empresas_hijas_json)) {
                item.empresas_hijas_json.forEach((hija) => {
                  const certHija = (hija.estado_hija || '').trim();
                  if (coincideCertificacion(certificacionSeleccionada, certHija)) {
                    empresasCertificacion.push({
                      nombre: hija.empresa_nombre_hija || 'Subsidiaria sin nombre',
                      rnc: hija.RNC_hija || 'N/A',
                      estado: hija.estado_hija || 'N/A',
                      certificacion: hija.estado_hija || 'Sin iniciar',
                      fecha: item.fecha_contratacion || 'N/A',
                      tipo: 'Subsidiaria',
                      empresaPadre: item.nombreempresapadre || 'Sin nombre',
                    });
                  }
                });
              }
            });

            setDatosModal({
              titulo: 'Empresas por Certificación',
              tipo: 'certificacion',
              nombre: certificacionSeleccionada,
              empresas: empresasCertificacion,
            });
            setModalAbierto(true);
          },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', cornerRadius: 8 },
          },
        },
      });
    }

    // PIE Estado Empresas (con onClick + modal)
    if (pieEstadoRef.current) {
      chartInstancesRef.current.pieEstado = new ChartJS(pieEstadoRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(estadisticasTemp.porEstado),
          datasets: [
            {
              data: Object.values(estadisticasTemp.porEstado),
              backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280'],
              borderWidth: 0,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          onClick: (_event, elements) => {
            if (!elements?.length) return;
            const index = elements[0].index;
            const labels = Object.keys(estadisticasTemp.porEstado);
            const estadoSeleccionado = labels[index];

            const empresasEstado = [];
            datosImplementaciones.forEach((item) => {
              const estadoPadre = (item.estadoempresapadre || 'Sin especificar').trim();
              if (estadoPadre === estadoSeleccionado) {
                empresasEstado.push({
                  nombre: item.nombreempresapadre || 'Sin nombre',
                  rnc: item.rncempresapadre || 'N/A',
                  estado: item.estadoempresapadre || 'N/A',
                  certificacion: item.certificacionempresapadre || 'Sin iniciar',
                  fecha: item.fecha_contratacion || 'N/A',
                  tipo: 'Principal',
                });
              }
              if (Array.isArray(item.empresas_hijas_json)) {
                item.empresas_hijas_json.forEach((hija) => {
                  const estadoHija = (hija.estado_hija || 'Sin especificar').trim();
                  if (estadoHija === estadoSeleccionado) {
                    empresasEstado.push({
                      nombre: hija.empresa_nombre_hija || 'Subsidiaria sin nombre',
                      rnc: hija.RNC_hija || 'N/A',
                      estado: hija.estado_hija || 'N/A',
                      certificacion: hija.estado_hija || 'Sin iniciar',
                      fecha: item.fecha_contratacion || 'N/A',
                      tipo: 'Subsidiaria',
                      empresaPadre: item.nombreempresapadre || 'Sin nombre',
                    });
                  }
                });
              }
            });

            setDatosModal({
              titulo: 'Empresas por Estado',
              tipo: 'estado',
              nombre: estadoSeleccionado,
              empresas: empresasEstado,
            });
            setModalAbierto(true);
          },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', cornerRadius: 8 },
          },
        },
      });
    }

    // BAR Vendedores (top 15) con onClick + modal
    const topVendedores = Object.entries(estadisticasTemp.porVendedor).sort(([, a], [, b]) => b - a).slice(0, 15);
    if (vendRef.current) {
      chartInstancesRef.current.vend = new ChartJS(vendRef.current, {
        type: 'bar',
        data: {
          labels: topVendedores.map(([nombre]) => nombre),
          datasets: [
            {
              label: 'Empresas Asignadas',
              data: topVendedores.map(([, cantidad]) => cantidad),
              backgroundColor: topVendedores.map((_, i) => (i % 2 === 0 ? colors.primary + '33' : colors.secondary + '33')),
              borderColor: topVendedores.map((_, i) => (i % 2 === 0 ? colors.primary : colors.secondary)),
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_event, elements) => {
            if (!elements?.length) return;
            const index = elements[0].index;
            const nombreVendedor = topVendedores[index][0];

            const empresasRelacionadas = [];
            datosImplementaciones.forEach((item) => {
              const vendedor = item.vendedornombre || item.nombrevendedor || item.vendedor || 'Sin asignar';
              if (vendedor === nombreVendedor) {
                empresasRelacionadas.push({
                  nombre: item.nombreempresapadre || 'Sin nombre',
                  rnc: item.rncempresapadre || 'N/A',
                  estado: item.estadoempresapadre || 'N/A',
                  certificacion: item.certificacionempresapadre || 'Sin iniciar',
                  fecha: item.fecha_contratacion || 'N/A',
                  tipo: 'Principal',
                });
                if (Array.isArray(item.empresas_hijas_json)) {
                  item.empresas_hijas_json.forEach((hija) => {
                    empresasRelacionadas.push({
                      nombre: hija.empresa_nombre_hija || 'Subsidiaria sin nombre',
                      rnc: hija.RNC_hija || 'N/A',
                      estado: hija.estado_hija || 'N/A',
                      certificacion: hija.estado_hija || 'Sin iniciar',
                      fecha: item.fecha_contratacion || 'N/A',
                      tipo: 'Subsidiaria',
                      empresaPadre: item.nombreempresapadre || 'Sin nombre',
                    });
                  });
                }
              }
            });

            setDatosModal({
              titulo: `Empresas de ${nombreVendedor}`,
              tipo: 'vendedor-bar',
              nombre: nombreVendedor,
              empresas: empresasRelacionadas,
            });
            setModalAbierto(true);
          },
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
        },
      });
    }

    // BAR Técnicos (top 15) con onClick + modal (pie de estados)
    const topTecnicos = Object.entries(estadisticasTemp.porTecnico).sort(([, a], [, b]) => b - a).slice(0, 15);
    if (tecRef.current) {
      chartInstancesRef.current.tec = new ChartJS(tecRef.current, {
        type: 'bar',
        data: {
          labels: topTecnicos.map(([nombre]) => nombre),
          datasets: [
            {
              label: 'Empresas Asignadas',
              data: topTecnicos.map(([, cantidad]) => cantidad),
              backgroundColor: topTecnicos.map((_, i) => (i % 2 === 0 ? colors.cyan + '33' : colors.purple + '33')),
              borderColor: topTecnicos.map((_, i) => (i % 2 === 0 ? colors.cyan : colors.purple)),
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_event, elements) => {
            if (!elements?.length) return;
            const index = elements[0].index;
            const nombreTecnico = topTecnicos[index][0];

            const estadosConteo = {};
            let total = 0;
            const empresasTecnico = [];

            datosImplementaciones.forEach((item) => {
              const tecnico = item.tecniconombre || item.nombretecnico || item.tecnico || 'Sin asignar';
              if (tecnico === nombreTecnico) {
                const estadoPadre = item.estadoempresapadre || 'Sin especificar';
                estadosConteo[estadoPadre] = (estadosConteo[estadoPadre] || 0) + 1;
                total += 1;

                empresasTecnico.push({
                  nombre: item.nombreempresapadre || 'Sin nombre',
                  rnc: item.rncempresapadre || 'N/A',
                  estado: item.estadoempresapadre || 'N/A',
                  certificacion: item.certificacionempresapadre || 'Sin iniciar',
                  fecha: item.fecha_contratacion || 'N/A',
                  tipo: 'Principal',
                });

                if (Array.isArray(item.empresas_hijas_json)) {
                  item.empresas_hijas_json.forEach((hija) => {
                    const estadoHija = hija.estado_hija || 'Sin especificar';
                    estadosConteo[estadoHija] = (estadosConteo[estadoHija] || 0) + 1;
                    total += 1;

                    empresasTecnico.push({
                      nombre: hija.empresa_nombre_hija || 'Subsidiaria sin nombre',
                      rnc: hija.RNC_hija || 'N/A',
                      estado: hija.estado_hija || 'N/A',
                      certificacion: hija.estado_hija || 'Sin iniciar',
                      fecha: item.fecha_contratacion || 'N/A',
                      tipo: 'Subsidiaria',
                      empresaPadre: item.nombreempresapadre || 'Sin nombre',
                    });
                  });
                }
              }
            });

            setDatosModal({
              titulo: 'Estados de Empresas por Técnico',
              tipo: 'tecnico-pie',
              nombre: nombreTecnico,
              total,
              estados: estadosConteo,
              empresas: empresasTecnico,
            });
            setModalAbierto(true);
          },
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
        },
      });
    }

    // LINE Empresas incorporadas con onClick + modal de empresas del mes
    const mesesEmpresas = {};
    const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    datosImplementaciones.forEach((item) => {
      if (!item.fecha_contratacion) return;
      const fecha = new Date(item.fecha_contratacion);
      if (isNaN(fecha.getTime())) return;

      if (fechaDesdeEmpresas && fecha < new Date(fechaDesdeEmpresas)) return;
      if (fechaHastaEmpresas && fecha > new Date(fechaHastaEmpresas)) return;

      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const key = `${año}-${String(mes + 1).padStart(2, '0')}`;

      if (!mesesEmpresas[key]) mesesEmpresas[key] = { año, mes, count: 0, label: `${mesesLabels[mes]} ${año}` };

      mesesEmpresas[key].count += 1;
      if (Array.isArray(item.empresas_hijas_json)) mesesEmpresas[key].count += item.empresas_hijas_json.length;
    });

    const empresasPorMes = Object.keys(mesesEmpresas).sort().map((k) => mesesEmpresas[k]);

    if (lineRef.current) {
      chartInstancesRef.current.line = new ChartJS(lineRef.current, {
        type: 'line',
        data: {
          labels: empresasPorMes.map((m) => m.label),
          datasets: [
            {
              label: 'Empresas',
              data: empresasPorMes.map((m) => m.count),
              borderColor: colors.primary,
              backgroundColor: colors.primary + '20',
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBorderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_event, elements) => {
            if (!elements?.length) return;
            const index = elements[0].index;
            const mesSeleccionado = empresasPorMes[index];
            if (!mesSeleccionado) return;

            const empresasMes = [];
            datosImplementaciones.forEach((item) => {
              if (!item.fecha_contratacion) return;
              const fecha = new Date(item.fecha_contratacion);
              if (isNaN(fecha.getTime())) return;

              const año = fecha.getFullYear();
              const mes = fecha.getMonth();
              if (año === mesSeleccionado.año && mes === mesSeleccionado.mes) {
                empresasMes.push({
                  nombre: item.nombreempresapadre || 'Sin nombre',
                  rnc: item.rncempresapadre || 'N/A',
                  estado: item.estadoempresapadre || 'N/A',
                  certificacion: item.certificacionempresapadre || 'Sin iniciar',
                  fecha: item.fecha_contratacion || 'N/A',
                  tipo: 'Principal',
                });
                if (Array.isArray(item.empresas_hijas_json)) {
                  item.empresas_hijas_json.forEach((hija) => {
                    empresasMes.push({
                      nombre: hija.empresa_nombre_hija || 'Subsidiaria sin nombre',
                      rnc: hija.RNC_hija || 'N/A',
                      estado: hija.estado_hija || 'N/A',
                      certificacion: hija.estado_hija || 'Sin iniciar',
                      fecha: item.fecha_contratacion || 'N/A',
                      tipo: 'Subsidiaria',
                      empresaPadre: item.nombreempresapadre || 'Sin nombre',
                    });
                  });
                }
              }
            });

            setDatosModalEmpresas({ nombre: mesSeleccionado.label, empresas: empresasMes });
            setModalEmpresasAbierto(true);
          },
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
        },
      });
    }

    // BARS Montos y Abonos (sin modal; solo visual)
    const construirSerieMonetaria = (campo) => {
      const meses = {};
      datosImplementaciones.forEach((item) => {
        if (!item.fecha_contratacion) return;
        const valRaw = item[campo];
        if (valRaw === null || valRaw === undefined || valRaw === '') return;

        const fecha = new Date(item.fecha_contratacion);
        if (isNaN(fecha.getTime())) return;

        const año = fecha.getFullYear();
        const mes = fecha.getMonth();
        const key = `${año}-${String(mes + 1).padStart(2, '0')}`;
        const val = parseFloat(valRaw) || 0

        if (!meses[key]) meses[key] = { año, mes, sum: 0, label: `${mesesLabels[mes]} ${año}` };
        meses[key].sum += val;
      });

      let arr = Object.keys(meses).sort().map((k) => meses[k]);

      const filtro = campo === 'monto_implementacion' ? filtroMontos : filtroAbonos;
      if (filtro !== 'todos') {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        const maxMeses = filtro === '3meses' ? 3 : filtro === '6meses' ? 6 : null;

        arr = arr.filter((m) => {
          if (filtro === 'año') return m.año === añoActual;
          const diffMeses = (añoActual - m.año) * 12 + (mesActual - m.mes);
          return diffMeses >= 0 && diffMeses < (maxMeses ?? 9999);
        });
      }

      return arr;
    };

    const montosPorMes = construirSerieMonetaria('monto_implementacion');
    const abonosPorMes = construirSerieMonetaria('abono');

    if (barMontoRef.current) {
      chartInstancesRef.current.barMonto = new ChartJS(barMontoRef.current, {
        type: 'bar',
        data: {
          labels: montosPorMes.map((m) => m.label),
          datasets: [
            {
              label: 'Monto Total',
              data: montosPorMes.map((m) => m.sum),
              backgroundColor: colors.secondary + '80',
              borderColor: colors.secondary,
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
        },
      });
    }

    if (barAbonosRef.current) {
      chartInstancesRef.current.barAbonos = new ChartJS(barAbonosRef.current, {
        type: 'bar',
        data: {
          labels: abonosPorMes.map((m) => m.label),
          datasets: [
            {
              label: 'Abonos Total',
              data: abonosPorMes.map((m) => m.sum),
              backgroundColor: colors.warning + '80',
              borderColor: colors.warning,
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
        },
      });
    }

    return () => {
      Object.values(chartInstancesRef.current).forEach((inst) => {
        if (inst && typeof inst.destroy === 'function') inst.destroy();
      });
    };
  }, [datosImplementaciones, cargandoDatos, error, filtroMontos, filtroAbonos, fechaDesdeEmpresas, fechaHastaEmpresas]);

  const closeModal = () => {
    setModalAbierto(false);
    setFiltrosModal({ busqueda: '', estado: 'todos', certificacion: 'todos' });
    setFechaDesde('');
    setFechaHasta('');
  };

  // Empresas a mostrar en modal principal (aplica filtros solo para tecnico-pie)
  const empresasParaTabla = useMemo(() => {
    if (!modalAbierto) return [];
    if (datosModal.tipo === 'tecnico-pie') return empresasFiltradasMemo;
    return Array.isArray(datosModal.empresas) ? datosModal.empresas : [];
  }, [modalAbierto, datosModal.tipo, datosModal.empresas, empresasFiltradasMemo]);

  return (
    <div className="space-y-6">
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setMostrarFiltrosGlobales((v) => !v)}
          style={{
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '9999px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Filtros globales"
        >
          <svg style={{ width: 28, height: 28, color: '#2563eb' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
        </button>
      </div>

      {/* Panel flotante de filtros globales */}
      {mostrarFiltrosGlobales && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 9999,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            padding: '24px',
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>Filtros globales</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Desde</label>
              <input
                type="date"
                value={fechaDesdeGlobal}
                onChange={(e) => setFechaDesdeGlobal(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Hasta</label>
              <input
                type="date"
                value={fechaHastaGlobal}
                onChange={(e) => setFechaHastaGlobal(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white' }}
              />
            </div>
          </div>
          <button
            onClick={() => setMostrarFiltrosGlobales(false)}
            style={{ marginTop: '8px', padding: '8px 16px', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Loading */}
      {cargandoDatos && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-800 font-medium">Error al cargar datos</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={cargarDatosImplementaciones} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Reintentar
          </button>
        </div>
      )}

      {/* Dashboard */}
      {!cargandoDatos && !error && datosImplementaciones.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <p className="text-blue-100 text-sm font-medium">Total Implementaciones</p>
              <p className="text-3xl font-bold">{estadisticas.total}</p>
              <p className="text-blue-100 text-sm">Empresas en el sistema</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <p className="text-green-100 text-sm font-medium">Certificadas</p>
              <p className="text-3xl font-bold">{estadisticas.porCertificacion['Paso 15 Finalización'] || 0}</p>
              <p className="text-green-100 text-sm">Empresas certificadas</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
              <p className="text-yellow-100 text-sm font-medium">En Proceso</p>
              <p className="text-3xl font-bold">{estadisticas.total - (estadisticas.porCertificacion['Paso 15 Finalización'] || 0)}</p>
              <p className="text-yellow-100 text-sm">En certificación</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <p className="text-purple-100 text-sm font-medium">Técnicos Activos</p>
              <p className="text-3xl font-bold">
                {
                  new Set(
                    datosImplementaciones
                      .map((item) => item.tecniconombre || item.nombretecnico)
                      .filter((t) => t && t.trim() !== '' && t !== 'Sin asignar')
                  ).size
                }
              </p>
              <p className="text-purple-100 text-sm">Técnicos asignados</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Estado de Certificación</h3>
              <div className="h-64">
                <canvas ref={pieRef}></canvas>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tip: haz click en una sección para ver el detalle.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Estado de Empresas</h3>
              <div className="h-64">
                <canvas ref={pieEstadoRef}></canvas>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tip: haz click en una sección para ver el detalle.</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-lg font-bold text-gray-900">Empresas Incorporadas</h3>
            <p className="text-sm text-gray-600 mb-4">Crecimiento mensual histórico (click en un punto para abrir el listado).</p>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={fechaDesdeEmpresas}
                  onChange={(e) => setFechaDesdeEmpresas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={fechaHastaEmpresas}
                  onChange={(e) => setFechaHastaEmpresas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div className="h-80">
              <canvas ref={lineRef}></canvas>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rendimiento Vendedores</h3>
              <p className="text-xs text-gray-600 mb-3">Click en una barra para ver empresas asignadas.</p>
              <div className="h-64">
                <canvas ref={vendRef}></canvas>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rendimiento Técnicos</h3>
              <p className="text-xs text-gray-600 mb-3">Click en una barra para ver estados + empresas.</p>
              <div className="h-64">
                <canvas ref={tecRef}></canvas>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900">Montos de Implementación</h3>
              <div className="mb-4 mt-3">
                <select
                  value={filtroMontos}
                  onChange={(e) => setFiltroMontos(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="todos">Todos los períodos</option>
                  <option value="3meses">Últimos 3 meses</option>
                  <option value="6meses">Últimos 6 meses</option>
                  <option value="año">Este año</option>
                </select>
              </div>
              <div className="h-64">
                <canvas ref={barMontoRef}></canvas>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900">Abonos Recibidos</h3>
              <div className="mb-4 mt-3">
                <select
                  value={filtroAbonos}
                  onChange={(e) => setFiltroAbonos(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="todos">Todos los períodos</option>
                  <option value="3meses">Últimos 3 meses</option>
                  <option value="6meses">Últimos 6 meses</option>
                  <option value="año">Este año</option>
                </select>
              </div>
              <div className="h-64">
                <canvas ref={barAbonosRef}></canvas>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal principal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm"></div>

            <div
              className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{datosModal.titulo || 'Detalle'}</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      <span className="font-semibold">{datosModal.nombre || ''}</span>
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      Total: {Array.isArray(datosModal.empresas) ? datosModal.empresas.length : 0} empresa
                      {Array.isArray(datosModal.empresas) && datosModal.empresas.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {datosModal.tipo === 'tecnico-pie' && (
                  <div className="flex flex-row gap-4 mt-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-blue-100 mb-1">Desde</label>
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="px-2 py-1 rounded border border-blue-200 text-gray-800 text-xs"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-blue-100 mb-1">Hasta</label>
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="px-2 py-1 rounded border border-blue-200 text-gray-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {datosModal.tipo === 'tecnico-pie' && (
                <div className="flex flex-row items-center justify-center gap-8 py-6">
                  <div>
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Estados de las Empresas</h4>
                    <PieChartEstados estados={estadosFiltradosMemo} />
                  </div>
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {Object.entries(estadosFiltradosMemo).map(([estado, cantidad], idx) => {
                      const colors = [
                        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280', '#A3A3A3', '#F472B6'
                      ];
                      return (
                        <div key={estado} className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ background: colors[idx % colors.length] }}></span>
                          <span className="text-gray-700 text-sm font-medium">{estado}</span>
                          <span className="ml-auto text-gray-500 text-xs">{cantidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {datosModal.tipo === 'vendedor-bar' && Array.isArray(datosModal.empresas) && datosModal.empresas.length > 0 && (
                <div className="flex flex-row items-center justify-center gap-8 py-6">
                  <div>
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Estados de las Empresas</h4>
                    <PieChartEstados estados={(() => {
                      const conteo = {};
                      datosModal.empresas.forEach(e => {
                        conteo[e.estado || 'Sin especificar'] = (conteo[e.estado || 'Sin especificar'] || 0) + 1;
                      });
                      return conteo;
                    })()} />
                  </div>
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {(() => {
                      const conteo = {};
                      datosModal.empresas.forEach(e => {
                        conteo[e.estado || 'Sin especificar'] = (conteo[e.estado || 'Sin especificar'] || 0) + 1;
                      });
                      const estados = Object.entries(conteo);
                      const colors = [
                        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280', '#A3A3A3', '#F472B6'
                      ];
                      return estados.map(([estado, cantidad], idx) => (
                        <div key={estado} className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ background: colors[idx % colors.length] }}></span>
                          <span className="text-gray-700 text-sm font-medium">{estado}</span>
                          <span className="ml-auto text-gray-500 text-xs">{cantidad}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div className="px-6 py-6">
                {empresasParaTabla.length > 0 ? (
                  <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-white shadow-sm">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Nombre</th>
                          <th className="px-2 py-2 font-semibold">RNC</th>
                          <th className="px-2 py-2 font-semibold">Estado</th>
                          <th className="px-2 py-2 font-semibold">Certificación</th>
                          <th className="px-2 py-2 font-semibold">Fecha</th>
                          <th className="px-2 py-2 font-semibold">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empresasParaTabla.map((empresa, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 hover:bg-blue-50 transition-colors">
                            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">{empresa.nombre}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.rnc}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.estado}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.certificacion}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.fecha}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">No hay empresas para mostrar.</div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Empresas Incorporadas */}
      {modalEmpresasAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setModalEmpresasAbierto(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm"></div>
            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-lime-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Empresas Incorporadas - {datosModalEmpresas.nombre}</h3>
                    <p className="text-xs text-green-100 mt-1">Total: {datosModalEmpresas.empresas.length} empresa{datosModalEmpresas.empresas.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setModalEmpresasAbierto(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              {/* Gráfico de pastel y leyenda */}
              {datosModalEmpresas.empresas.length > 0 && (
                <div className="flex flex-row items-center justify-center gap-8 py-6">
                  <div>
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Estados de las Empresas</h4>
                    <PieChartEstados estados={(() => {
                      const conteo = {};
                      datosModalEmpresas.empresas.forEach(e => {
                        conteo[e.estado || 'Sin especificar'] = (conteo[e.estado || 'Sin especificar'] || 0) + 1;
                      });
                      return conteo;
                    })()} />
                  </div>
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {(() => {
                      const conteo = {};
                      datosModalEmpresas.empresas.forEach(e => {
                        conteo[e.estado || 'Sin especificar'] = (conteo[e.estado || 'Sin especificar'] || 0) + 1;
                      });
                      const estados = Object.entries(conteo);
                      const colors = [
                        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280', '#A3A3A3', '#F472B6'
                      ];
                      return estados.map(([estado, cantidad], idx) => (
                        <div key={estado} className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ background: colors[idx % colors.length] }}></span>
                          <span className="text-gray-700 text-sm font-medium">{estado}</span>
                          <span className="ml-auto text-gray-500 text-xs">{cantidad}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
              <div className="px-6 py-8">
                {datosModalEmpresas.empresas.length > 0 ? (
                  <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border bg-white shadow-sm">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Nombre</th>
                          <th className="px-2 py-2 font-semibold">RNC</th>
                          <th className="px-2 py-2 font-semibold">Estado</th>
                          <th className="px-2 py-2 font-semibold">Certificación</th>
                          <th className="px-2 py-2 font-semibold">Fecha</th>
                          <th className="px-2 py-2 font-semibold">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosModalEmpresas.empresas.map((empresa, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 hover:bg-green-50 transition-colors">
                            <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">{empresa.nombre}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.rnc}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.estado}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.certificacion}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.fecha}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{empresa.tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">No hay empresas para mostrar.</div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setModalEmpresasAbierto(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-lime-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-lime-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardContent;
