import Link from "next/link";

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Gracias por realizar tu inscripción
        </h1>

        {/* Estado actual */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Tu estado actual es:{" "}
            <span className="text-blue-600">INTERESADA</span>
          </p>
          <p className="text-gray-700">
            Esto significa que hemos recibido correctamente tu información y está
            a la espera de la revisión de documentos.
          </p>
        </div>

        {/* Información importante */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded-r-lg">
          <p className="text-gray-700 font-medium mb-2">
            ⚠️ Información importante:
          </p>
          <p className="text-gray-700">
            La inscripción no garantiza el cupo ni la participación en el proceso.
          </p>
        </div>

        {/* Próximos pasos */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Tu información será revisada conforme a los criterios establecidos.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Una vez finalizada la verificación de requisitos, se te informará si
            continúas a la siguiente etapa.
          </p>
        </div>

        {/* Botón de regreso */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors cursor-pointer shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>

        {/* Nota adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Si tienes alguna pregunta, por favor contacta con nosotros.
          </p>
        </div>
      </div>
    </div>
  );
}
