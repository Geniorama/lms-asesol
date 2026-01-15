import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Verificar que sea admin
  if (session.user.rol !== 'admin') {
    redirect("/dashboard")
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Panel de Administración
            </h1>
            <p className="text-sm text-purple-100">
              {user.nombre} {user.apellidos}
            </p>
          </div>
          
          <div className="flex gap-4">
            <a
              href="/dashboard"
              className="px-4 py-2 bg-white hover:bg-purple-50 text-purple-600 rounded-lg transition-colors cursor-pointer"
            >
              Dashboard
            </a>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cards de Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Estudiantes</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Inscripciones</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Cursos Activos</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Administradores</h3>
            <p className="text-3xl font-bold text-gray-900">1</p>
          </div>
        </div>

        {/* Secciones de Administración */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Administra estudiantes y otros administradores del sistema.
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
              Ver Usuarios
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inscripciones
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Revisa y gestiona las inscripciones recibidas.
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
              Ver Inscripciones
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cursos
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Crea y gestiona los cursos disponibles en la plataforma.
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
              Gestionar Cursos
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reportes
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Genera reportes y estadísticas del sistema.
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
              Ver Reportes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
