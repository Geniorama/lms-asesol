"use client"

import { useState, useEffect, useCallback } from "react"

interface Inscripcion {
  id: number
  nombres: string
  apellidos: string
  tipo_documento: string
  numero_documento: string
  fecha_nacimiento: string
  edad_calculada: number | null
  telefono_principal: string
  correo_electronico: string
  direccion: string
  barrio: string
  upz_upl: string
  linea_formacion: string
  nivel_educativo: string
  situacion_laboral: string
  puntaje_total: number
  estado: string
  notas_admin: string | null
  fecha_inscripcion: string
  fecha_actualizacion: string
  total_upz?: number // Equidad territorial: total de inscritas en la misma UPZ/UPL
  datos_calculadora?: any // JSON con los datos de la calculadora de puntaje
}

interface InscripcionesResponse {
  success: boolean
  data: Inscripcion[]
  total: number
  limit: number
  offset: number
}

const ESTADOS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'interesada', label: 'Interesada' },
  { value: 'verificada', label: 'Verificada' },
  { value: 'participante', label: 'Participante (Seleccionada)' },
  { value: 'lista_espera', label: 'Lista de Espera' },
  { value: 'rechazada', label: 'Rechazada' },
]

const LINEAS_FORMACION = [
  { value: 'todos', label: 'Todas las líneas' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'belleza', label: 'Belleza' },
  { value: 'emprendimiento', label: 'Emprendimiento' },
  { value: 'conduccion', label: 'Conducción' },
  { value: 'cuidado', label: 'Cuidado' },
]

const ESTADO_COLORS: Record<string, string> = {
  interesada: 'bg-blue-100 text-blue-800',
  verificada: 'bg-purple-100 text-purple-800',
  participante: 'bg-green-100 text-green-800',
  lista_espera: 'bg-yellow-100 text-yellow-800',
  rechazada: 'bg-red-100 text-red-800',
}

export default function InscripcionesTable() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [estado, setEstado] = useState('todos')
  const [lineaFormacion, setLineaFormacion] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaTemp, setBusquedaTemp] = useState('')

  // Inscripción seleccionada para ver detalles
  const [selectedInscripcion, setSelectedInscripcion] = useState<Inscripcion | null>(null)
  
  // Estados para edición
  const [editandoEstado, setEditandoEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [notasAdmin, setNotasAdmin] = useState('')
  const [guardandoEstado, setGuardandoEstado] = useState(false)
  
  // Estados para recalcular puntaje
  const [recalculandoPuntaje, setRecalculandoPuntaje] = useState(false)
  const [recalculandoTodos, setRecalculandoTodos] = useState(false)

  // Cargar inscripciones
  const cargarInscripciones = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (estado !== 'todos') params.append('estado', estado)
      if (lineaFormacion !== 'todos') params.append('lineaFormacion', lineaFormacion)
      if (busqueda) params.append('busqueda', busqueda)

      const response = await fetch(`/api/inscripciones?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar inscripciones')
      }

      const data: InscripcionesResponse = await response.json()
      setInscripciones(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [estado, lineaFormacion, busqueda])

  // Cargar al montar y cuando cambien los filtros
  useEffect(() => {
    cargarInscripciones()
  }, [cargarInscripciones])

  // Manejar búsqueda
  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setBusqueda(busquedaTemp)
  }

  // Actualizar estado de inscripción
  const actualizarEstado = async () => {
    if (!selectedInscripcion || !nuevoEstado) return

    setGuardandoEstado(true)
    try {
      const response = await fetch('/api/inscripciones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedInscripcion.id,
          estado: nuevoEstado,
          notas_admin: notasAdmin || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar')
      }

      await response.json()
      
      // Actualizar la inscripción en la lista
      setInscripciones(prevInscripciones =>
        prevInscripciones.map(insc =>
          insc.id === selectedInscripcion.id
            ? { ...insc, estado: nuevoEstado, notas_admin: notasAdmin || null }
            : insc
        )
      )

      // Actualizar la inscripción seleccionada
      setSelectedInscripcion({
        ...selectedInscripcion,
        estado: nuevoEstado,
        notas_admin: notasAdmin || null,
      })

      setEditandoEstado(false)
      alert('Estado actualizado exitosamente')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado')
    } finally {
      setGuardandoEstado(false)
    }
  }

  // Abrir modal de detalles
  const abrirDetalles = (inscripcion: Inscripcion) => {
    setSelectedInscripcion(inscripcion)
    setNuevoEstado(inscripcion.estado)
    setNotasAdmin(inscripcion.notas_admin || '')
    setEditandoEstado(false)
  }

  // Recalcular puntaje de una inscripción
  const recalcularPuntaje = async (id: number) => {
    setRecalculandoPuntaje(true)
    try {
      const response = await fetch('/api/inscripciones/recalcular-puntaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al recalcular puntaje')
      }

      const data = await response.json()
      
      // Actualizar la inscripción en la lista
      setInscripciones(prevInscripciones =>
        prevInscripciones.map(insc =>
          insc.id === id
            ? { ...insc, puntaje_total: data.puntaje_nuevo }
            : insc
        )
      )

      // Actualizar la inscripción seleccionada si es la misma
      if (selectedInscripcion && selectedInscripcion.id === id) {
        setSelectedInscripcion({
          ...selectedInscripcion,
          puntaje_total: data.puntaje_nuevo,
        })
      }

      alert(`Puntaje recalculado exitosamente:\nAnterior: ${data.puntaje_anterior} pts\nNuevo: ${data.puntaje_nuevo} pts`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al recalcular puntaje')
    } finally {
      setRecalculandoPuntaje(false)
    }
  }

  // Recalcular puntaje de TODAS las inscripciones
  const recalcularTodosPuntajes = async () => {
    if (!confirm('¿Estás seguro de que deseas recalcular el puntaje de TODAS las inscripciones? Esto puede tardar un momento.')) {
      return
    }

    setRecalculandoTodos(true)
    try {
      const response = await fetch('/api/inscripciones/recalcular-puntaje', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al recalcular puntajes')
      }

      const data = await response.json()
      
      alert(`Recálculo completado:\nTotal inscripciones: ${data.total_inscripciones}\nActualizadas: ${data.total_actualizadas}\nErrores: ${data.total_errores}`)
      
      // Recargar las inscripciones
      cargarInscripciones()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al recalcular puntajes')
    } finally {
      setRecalculandoTodos(false)
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Formatear fecha y hora completa
  const formatearFechaHora = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  // Capitalizar texto
  const capitalizar = (texto: string) => {
    return texto
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Generar desglose del puntaje
  const generarDesglosePuntaje = (datosCalculadora: any) => {
    if (!datosCalculadora) return []

    const criterios = []

    // 1. Salud y Seguridad Social
    if (
      datosCalculadora.regimenSalud === 'subsidiado' ||
      datosCalculadora.regimenSalud === 'contributivo_beneficiaria' ||
      datosCalculadora.regimenSalud === 'no_afiliada'
    ) {
      criterios.push({
        nombre: 'Salud y Seguridad Social',
        detalle: capitalizar(datosCalculadora.regimenSalud || ''),
        puntos: 1
      })
    }

    // 2. Rol de Cuidado
    if (datosCalculadora.esCuidadora) {
      criterios.push({
        nombre: 'Rol de Cuidado',
        detalle: 'Es cuidadora',
        puntos: 1
      })
    }

    // 3. Discapacidad
    if (datosCalculadora.tieneDiscapacidad) {
      criterios.push({
        nombre: 'Discapacidad',
        detalle: 'Presenta condición de discapacidad certificada',
        puntos: 1
      })
    }

    // 4. Pertenencia Étnica
    if (
      datosCalculadora.grupoEtnico &&
      datosCalculadora.grupoEtnico !== 'ninguno' &&
      datosCalculadora.grupoEtnico !== ''
    ) {
      criterios.push({
        nombre: 'Pertenencia Étnica',
        detalle: capitalizar(datosCalculadora.grupoEtnico),
        puntos: 1
      })
    }

    // 5. Víctima del Conflicto
    if (datosCalculadora.esVictima) {
      criterios.push({
        nombre: 'Víctima del Conflicto',
        detalle: 'Incluida en el RUV',
        puntos: 1
      })
    }

    // 6. Construcción de Paz
    if (datosCalculadora.firmantePaz) {
      criterios.push({
        nombre: 'Construcción de Paz',
        detalle: 'Firmante del acuerdo de paz',
        puntos: 1
      })
    }

    // 7. Protección
    if (datosCalculadora.tieneProteccion) {
      criterios.push({
        nombre: 'Protección',
        detalle: 'Medida de protección activa',
        puntos: 1
      })
    }

    // 8. Ruralidad
    if (datosCalculadora.viveZonaRural) {
      criterios.push({
        nombre: 'Ruralidad',
        detalle: 'Vive en zona rural de Ciudad Bolívar',
        puntos: 1
      })
    }

    // 9. Diversidad Sexual
    if (
      datosCalculadora.identidadLGBTIQ &&
      datosCalculadora.identidadLGBTIQ !== 'no' &&
      datosCalculadora.identidadLGBTIQ !== ''
    ) {
      criterios.push({
        nombre: 'Diversidad Sexual',
        detalle: capitalizar(datosCalculadora.identidadLGBTIQ === 'otro' && datosCalculadora.identidadOtra 
          ? datosCalculadora.identidadOtra 
          : datosCalculadora.identidadLGBTIQ),
        puntos: 1
      })
    }

    // 10. Población Migrante
    if (datosCalculadora.esMigrante) {
      criterios.push({
        nombre: 'Población Migrante',
        detalle: 'Es migrante',
        puntos: 1
      })
    }

    return criterios
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inscripciones</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: <span className="font-semibold">{total}</span> {total === 1 ? 'inscripción' : 'inscripciones'}
          </p>
          <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ordenado por: 1° Puntaje (mayor), 2° Fecha (primero en tiempo), 3° Equidad Territorial (UPZ con menos inscritas)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={recalcularTodosPuntajes}
            disabled={loading || recalculandoTodos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Recalcular puntajes de todas las inscripciones"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {recalculandoTodos ? 'Recalculando...' : 'Recalcular Todos'}
          </button>
          <button
            onClick={cargarInscripciones}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <form onSubmit={handleBusqueda} className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={busquedaTemp}
                onChange={(e) => setBusquedaTemp(e.target.value)}
                placeholder="Buscar por nombre, email o documento..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Estado */}
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          >
            {ESTADOS.map((est) => (
              <option key={est.value} value={est.value}>
                {est.label}
              </option>
            ))}
          </select>

          {/* Línea de Formación */}
          <select
            value={lineaFormacion}
            onChange={(e) => setLineaFormacion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          >
            {LINEAS_FORMACION.map((linea) => (
              <option key={linea.value} value={linea.value}>
                {linea.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros activos */}
        {(estado !== 'todos' || lineaFormacion !== 'todos' || busqueda) && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {estado !== 'todos' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                Estado: {ESTADOS.find(e => e.value === estado)?.label}
              </span>
            )}
            {lineaFormacion !== 'todos' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                Línea: {LINEAS_FORMACION.find(l => l.value === lineaFormacion)?.label}
              </span>
            )}
            {busqueda && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                Búsqueda: &quot;{busqueda}&quot;
              </span>
            )}
            <button
              onClick={() => {
                setEstado('todos')
                setLineaFormacion('todos')
                setBusqueda('')
                setBusquedaTemp('')
              }}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando inscripciones...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
          </div>
        ) : inscripciones.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p>No se encontraron inscripciones.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPZ/UPL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Línea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscripciones.map((inscripcion, index) => (
                  <tr key={inscripcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inscripcion.nombres} {inscripcion.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inscripcion.correo_electronico}
                      </div>
                      <div className="text-xs text-gray-400">
                        {inscripcion.tipo_documento} {inscripcion.numero_documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inscripcion.upz_upl}</div>
                      {inscripcion.total_upz !== undefined && (
                        <div className="text-xs text-gray-500" title="Total de inscritas en esta UPZ/UPL">
                          {inscripcion.total_upz} {inscripcion.total_upz === 1 ? 'inscrita' : 'inscritas'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capitalizar(inscripcion.linea_formacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded">
                        {inscripcion.puntaje_total} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${ESTADO_COLORS[inscripcion.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {capitalizar(inscripcion.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatearFecha(inscripcion.fecha_inscripcion)}</div>
                      <div className="text-xs text-gray-500">{formatearFechaHora(inscripcion.fecha_inscripcion).split(',')[1]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => abrirDetalles(inscripcion)}
                        className="text-purple-600 hover:text-purple-900 font-medium cursor-pointer"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedInscripcion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Detalles de Inscripción #{selectedInscripcion.id}
              </h3>
              <button
                onClick={() => setSelectedInscripcion(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Nombres:</span>
                    <p className="font-medium">{selectedInscripcion.nombres}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Apellidos:</span>
                    <p className="font-medium">{selectedInscripcion.apellidos}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Documento:</span>
                    <p className="font-medium">{selectedInscripcion.tipo_documento} {selectedInscripcion.numero_documento}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Fecha de Nacimiento:</span>
                    <p className="font-medium">{selectedInscripcion.fecha_nacimiento} ({selectedInscripcion.edad_calculada} años)</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Teléfono:</span>
                    <p className="font-medium">{selectedInscripcion.telefono_principal}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedInscripcion.correo_electronico}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Dirección:</span>
                    <p className="font-medium">{selectedInscripcion.direccion}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Barrio:</span>
                    <p className="font-medium">{selectedInscripcion.barrio}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">UPZ/UPL:</span>
                    <p className="font-medium">{selectedInscripcion.upz_upl}</p>
                  </div>
                </div>
              </div>

              {/* Formación */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Información de Formación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Línea de Formación:</span>
                    <p className="font-medium">{capitalizar(selectedInscripcion.linea_formacion)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nivel Educativo:</span>
                    <p className="font-medium">{selectedInscripcion.nivel_educativo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Situación Laboral:</span>
                    <p className="font-medium">{selectedInscripcion.situacion_laboral}</p>
                  </div>
                </div>
              </div>

              {/* Desglose de Puntaje */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Desglose de Puntaje</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-lg font-bold text-purple-700 bg-purple-100 rounded-lg">
                      {selectedInscripcion.puntaje_total} / 10 puntos
                    </span>
                    <button
                      onClick={() => recalcularPuntaje(selectedInscripcion.id)}
                      disabled={recalculandoPuntaje}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Recalcular puntaje basado en los criterios actuales"
                    >
                      {recalculandoPuntaje ? '⏳' : '🔄 Recalcular'}
                    </button>
                  </div>
                </div>
                
                {selectedInscripcion.datos_calculadora ? (
                  <div className="space-y-2">
                    {generarDesglosePuntaje(selectedInscripcion.datos_calculadora).map((criterio, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900">{criterio.nombre}</p>
                          <p className="text-sm text-green-700">{criterio.detalle}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-600 text-white text-sm font-bold rounded">
                          +{criterio.puntos}
                        </span>
                      </div>
                    ))}
                    
                    {generarDesglosePuntaje(selectedInscripcion.datos_calculadora).length === 0 && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                        No cumple con ningún criterio de puntaje
                      </div>
                    )}

                    {generarDesglosePuntaje(selectedInscripcion.datos_calculadora).length < 10 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Criterios no cumplidos:</strong> {10 - generarDesglosePuntaje(selectedInscripcion.datos_calculadora).length} de 10
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                    No hay datos de calculadora disponibles
                  </div>
                )}
              </div>

              {/* Estado */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Gestión de Estado</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Estado Actual:</span>
                      {!editandoEstado ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${ESTADO_COLORS[selectedInscripcion.estado] || 'bg-gray-100 text-gray-800'}`}>
                            {capitalizar(selectedInscripcion.estado)}
                          </span>
                          <button
                            onClick={() => setEditandoEstado(true)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <select
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                        >
                          {ESTADOS.filter(e => e.value !== 'todos').map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Fecha y Hora de Inscripción:</span>
                      <p className="font-medium mt-1">{formatearFechaHora(selectedInscripcion.fecha_inscripcion)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Timestamp: {new Date(selectedInscripcion.fecha_inscripcion).getTime()}
                      </p>
                    </div>
                  </div>

                  {/* Notas Administrativas */}
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">
                      Notas Administrativas:
                    </label>
                    <textarea
                      value={notasAdmin}
                      onChange={(e) => setNotasAdmin(e.target.value)}
                      disabled={!editandoEstado}
                      placeholder="Agregar notas sobre el estado de esta inscripción..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 min-h-[80px]"
                    />
                  </div>

                  {/* Botones de acción */}
                  {editandoEstado && (
                    <div className="flex gap-2">
                      <button
                        onClick={actualizarEstado}
                        disabled={guardandoEstado || nuevoEstado === selectedInscripcion.estado && notasAdmin === (selectedInscripcion.notas_admin || '')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {guardandoEstado ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      <button
                        onClick={() => {
                          setEditandoEstado(false)
                          setNuevoEstado(selectedInscripcion.estado)
                          setNotasAdmin(selectedInscripcion.notas_admin || '')
                        }}
                        disabled={guardandoEstado}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedInscripcion(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
