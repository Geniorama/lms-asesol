import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"

// Forzar revalidación en cada request (sin caché)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Bienvenido, {user.nombre} {user.apellidos}
            </p>
          </div>
          
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
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Información del Usuario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tu Información
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="text-sm text-gray-900">{user.nombre} {user.apellidos}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.rol === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.rol === 'admin' ? 'Administrador' : 'Estudiante'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Card de Acceso Rápido */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acceso Rápido
            </h2>
            <div className="space-y-3">
              {user.rol === 'admin' && (
                <a
                  href="/admin"
                  className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors cursor-pointer"
                >
                  Panel de Administración
                </a>
              )}
              <a
                href="/formulario-inscripcion"
                className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors cursor-pointer"
              >
                Ver Formulario de Inscripción
              </a>
            </div>
          </div>

          {/* Card de Estadísticas (placeholder) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estadísticas
            </h2>
            <p className="text-sm text-gray-600">
              Contenido próximamente...
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
