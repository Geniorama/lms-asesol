import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"
import InscripcionesTable from "@/components/InscripcionesTable"

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
        {/* Tabla de Inscripciones */}
        <InscripcionesTable />
      </main>
    </div>
  )
}
