/**
 * Utilidades para manejo de APIs
 * Centraliza las llamadas a diferentes endpoints de la misma base
 */

// Base URL para las APIs de N8N (usando variable de entorno)
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://n8n-dev.waopos.com/webhook';

/**
 * Función genérica para hacer llamadas a la API de N8N
 * @param {string} endpoint - Nombre del endpoint (ej: 'TablaMiembros', 'crear-miembro')
 * @param {object} options - Opciones de fetch (method, body, headers, etc.)
 * @returns {Promise} - Respuesta de la API
 */
export async function callN8NAPI(endpoint, options = {}) {
  const url = `${N8N_BASE_URL}/${endpoint}`;

  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    method: 'GET',
    headers: isFormData
      ? {} // sin headers para FormData
      : { 'Content-Type': 'application/json' },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

    if (isFormData) {
      console.log(`🌐 Llamando a N8N API: ${url}`);
      console.log('📦 Payload: FormData');
      for (const [key, value] of options.body.entries()) {
        console.log(`  • ${key}:`, value);
      }
    } else {
      console.log(`🌐 Llamando a N8N API: ${url}`, {
        method: mergedOptions.method,
        body: mergedOptions.body ? JSON.parse(mergedOptions.body) : null
      });
    }

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    // Verificar si hay contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      console.warn(`⚠️ Respuesta vacía de ${endpoint}`);
      return [];
    }

    // Verificar si es JSON válido
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Respuesta no es JSON de ${endpoint}:`, responseText);
      throw new Error(`Respuesta no es JSON válido: ${responseText.substring(0, 100)}...`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Respuesta exitosa de ${endpoint}:`, data);
      return data;
    } catch (jsonError) {
      console.error(`❌ Error al parsear JSON de ${endpoint}:`, responseText);
      throw new Error(`Respuesta JSON inválida: ${jsonError.message}`);
    }

  } catch (error) {
    console.error(`❌ Error en llamada a ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Funciones específicas para cada endpoint
 */

// Obtener lista de miembros/personal
export async function obtenerMiembros() {
  try {
    const response = await callN8NAPI('TablaMiembros', {
      method: 'POST',
      body: JSON.stringify({
        "Type": "SQL",
        "Table": "Miembros"
      })
    });

    // Validar que la respuesta sea un array
    if (!Array.isArray(response)) {
      console.warn('⚠️ Respuesta de API no es un array:', response);
      return [];
    }

    return response;
  } catch (error) {
    console.error('❌ Error específico en obtenerMiembros:', error);
    throw new Error(`No se pudo obtener la lista de personal: ${error.message}`);
  }
}

// Obtener datos de implementaciones
export async function obtenerImplementaciones() {
  try {
    const response = await callN8NAPI('TablaMiembros', {
      method: 'POST',
      body: JSON.stringify({
        "Table": "implementaciondatos",
        "Type": "SQL"
      })
    });

    // Validar que la respuesta sea un array
    if (!Array.isArray(response)) {
      console.warn('⚠️ Respuesta de implementaciones no es un array:', response);
      return [];
    }

    return response;
  } catch (error) {
    console.error('❌ Error específico en obtenerImplementaciones:', error);
    throw new Error(`No se pudo obtener los datos de implementaciones: ${error.message}`);
  }
}

// Obtener datos de certificaciones
export async function obtenerCertificacion() {
  try {
    const response = await callN8NAPI('TablaMiembros', {
      method: 'POST',
      body: JSON.stringify({
        "Table": "certificaciones",
        "Type": "SQL"
      })
    });

    // Validar que la respuesta sea un array
    if (!Array.isArray(response)) {
      console.warn('⚠️ Respuesta de certificaciones no es un array:', response);
      return [];
    }

    return response;
  } catch (error) {
    console.error('❌ Error específico en obtenerCertificacion:', error);
    throw new Error(`No se pudo obtener los datos de certificaciones: ${error.message}`);
  }
}

// Función de login
export async function iniciarSesion(email, password, recaptchaToken = null, sessionToken = null, codigo2FA = null) {
  try {
    console.log('🔐 Intentando iniciar sesión para:', { email, cedula: password, recaptcha: recaptchaToken ? 'presente' : 'ausente', sessionToken: sessionToken ? 'presente' : 'ausente', codigo2FA: codigo2FA ? 'presente' : 'ausente' });

    const response = await callN8NAPI('TablaMiembros', {
      method: 'POST',
      body: JSON.stringify({
        "Table": "Login",
        "Type": "SQl",
        "Data": {
          "email": email,
          "cedula": password,
          "recaptchaToken": recaptchaToken,
          "sessionToken": sessionToken,
          "codigo2FA": codigo2FA
        }
      })
    });

    console.log('🔐 Respuesta de login:', response);

    // Verificar la nueva estructura de la respuesta
    if (Array.isArray(response) && response.length > 0) {
      const loginResult = response[0];

      // Verificar la nueva estructura con verificar_miembro_existe_json
      if (loginResult && loginResult.verificar_miembro_existe_json) {
        const loginData = loginResult.verificar_miembro_existe_json;

        if (loginData.existe === true && loginData.datos) {
          console.log('✅ Login exitoso - miembro verificado con datos:', loginData.datos);
          return {
            success: true,
            data: loginData.datos,
            userInfo: {
              miembroID: loginData.datos.miembroID,
              nombre: loginData.datos.nombre,
              email: loginData.datos.email,
              celular: loginData.datos.celular,
              id_clickup: loginData.datos.id_clickup,
              cedula: loginData.datos.cedula,
              fecha_creacion: loginData.datos.fecha_creacion,
              fecha_modificacion: loginData.datos.fecha_modificacion
            }
          };
        } else {
          console.warn('⚠️ Credenciales incorrectas - miembro no existe');
          return { success: false, message: 'Credenciales incorrectas' };
        }
      }

      // Mantener compatibilidad con estructura anterior
      if (loginResult && loginResult.verificar_miembro_existe === true) {
        console.log('✅ Login exitoso - estructura anterior');
        return { success: true, data: loginResult };
      } else if (loginResult && loginResult.verificar_miembro_existe === false) {
        console.warn('⚠️ Credenciales incorrectas - estructura anterior');
        return { success: false, message: 'Credenciales incorrectas' };
      }
    }

    // Si la respuesta no tiene la estructura esperada
    console.warn('⚠️ Respuesta inesperada del servidor:', response);
    return { success: false, message: 'Respuesta inesperada del servidor' };

  } catch (error) {
    console.error('❌ Error en iniciarSesion:', error);
    throw new Error(`Error al iniciar sesión: ${error.message}`);
  }
}

// Crear nuevo miembro/personal
export async function crearMiembro(datosPersonal) {
  const payload = {
    "Table": "MiembroNU",
    "Type": "SQl",
    "Data": datosPersonal
  };

  return callN8NAPI('TablaMiembros', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Crear nueva tarea
export async function crearTarea(datosTarea) {
  console.log('📤 Enviando tarea al webhook N8N...')
  console.log('📦 Payload completo:', datosTarea)
  
  try {
    const response = await callN8NAPI('c49681de-ed44-4032-a426-ebe3c911a030', {
      method: 'POST',
      body: datosTarea
    })
    
    console.log('✅ Tarea creada exitosamente:', response)
    return response
  } catch (error) {
    console.error('❌ Error detallado al crear tarea:')
    console.error('  - Mensaje:', error.message)
    console.error('  - Datos enviados:', datosTarea)
    
    // Proporcionar mensaje más específico
    if (error.message.includes('500')) {
      throw new Error('El servidor N8N no pudo procesar la solicitud. Verifica que el workflow esté activo y configurado correctamente.')
    } else if (error.message.includes('404')) {
      throw new Error('El webhook no existe o la URL es incorrecta.')
    } else if (error.message.includes('timeout') || error.message.includes('network')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }
    
    throw error
  }
}

// Función para endpoints futuros (ejemplo)
export async function actualizarMiembro(id, datosPersonal) {
  const payload = {
    "Table": "MiembroNU",
    "Type": "SQl",
    "Data": {
      ...datosPersonal,
      miembroID: id
    }
  };

  return callN8NAPI('TablaMiembros', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Función para eliminar miembro (ejemplo)
export async function eliminarMiembro(id) {
  return callN8NAPI(`eliminar-miembro/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Utilidades adicionales
 */

// Mapeo de tipos para la API
export const TIPOS_PERSONAL = {
  'Tecnico': 1,
  'Vendedor': 2,
  'Gerencia': 3,
  'Distribuidor': 4
};

// Función para convertir tipos de texto a números
export function convertirTiposANumeros(tiposTexto) {
  return tiposTexto.map(tipo => TIPOS_PERSONAL[tipo]).filter(Boolean);
}

// Función para formatear datos del formulario para la API
export function formatearDatosParaAPI(formData) {
  return {
    nombre: formData.nombre,
    email: formData.email,
    celular: formData.telefono,
    prioridad: formData.prioridad,
    id_clickup: null,
    tipos: convertirTiposANumeros(formData.tipos)
  };
}
