"use client"

import { useState, useEffect } from "react"

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
  fecha_inscripcion: string
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
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'en_revision', label: 'En Revisión' },
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
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
  en_revision: 'bg-blue-100 text-blue-800',
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

  // Cargar inscripciones
  const cargarInscripciones = async () => {
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
  }

  // Cargar al montar y cuando cambien los filtros
  useEffect(() => {
    cargarInscripciones()
  }, [estado, lineaFormacion, busqueda])

  // Manejar búsqueda
  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setBusqueda(busquedaTemp)
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Capitalizar texto
  const capitalizar = (texto: string) => {
    return texto
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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
        </div>
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
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
                {inscripciones.map((inscripcion) => (
                  <tr key={inscripcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{inscripcion.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inscripcion.nombres} {inscripcion.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inscripcion.correo_electronico}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inscripcion.tipo_documento} {inscripcion.numero_documento}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(inscripcion.fecha_inscripcion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedInscripcion(inscripcion)}
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
                  <div>
                    <span className="text-sm text-gray-500">Puntaje Total:</span>
                    <p className="font-medium text-purple-700">{selectedInscripcion.puntaje_total} puntos</p>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Estado y Fecha</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Estado Actual:</span>
                    <p className="font-medium">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${ESTADO_COLORS[selectedInscripcion.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {capitalizar(selectedInscripcion.estado)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Fecha de Inscripción:</span>
                    <p className="font-medium">{formatearFecha(selectedInscripcion.fecha_inscripcion)}</p>
                  </div>
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
