import type { CalculadoraPuntaje, RegimenSalud, GrupoEtnico, IdentidadLGBTIQ } from '@/types'

/**
 * Calcula el puntaje total basado en los criterios de la calculadora.
 * Cada criterio suma máximo 1 punto.
 * Puntaje máximo: 10 puntos
 */
export function calcularPuntaje(calculadora: CalculadoraPuntaje): number {
  let puntaje = 0

  // 1. SALUD Y SEGURIDAD SOCIAL (+1 punto)
  // Suma si es: subsidiado, contributivo_beneficiaria, o no_afiliada
  if (
    calculadora.regimenSalud === 'subsidiado' ||
    calculadora.regimenSalud === 'contributivo_beneficiaria' ||
    calculadora.regimenSalud === 'no_afiliada'
  ) {
    puntaje += 1
  }

  // 2. ROL DE CUIDADO (+1 punto)
  if (calculadora.esCuidadora) {
    puntaje += 1
  }

  // 3. DISCAPACIDAD (+1 punto)
  if (calculadora.tieneDiscapacidad) {
    puntaje += 1
  }

  // 4. PERTENENCIA ÉTNICA (+1 punto) - No acumulativo
  // Suma 1 punto si marca cualquiera de las opciones (excepto "ninguno" o vacío)
  const grupoEtnicoValido = calculadora.grupoEtnico && 
    calculadora.grupoEtnico !== 'ninguno' && 
    String(calculadora.grupoEtnico).trim() !== ''
  if (grupoEtnicoValido) {
    puntaje += 1
  }

  // 5. VÍCTIMA DEL CONFLICTO (+1 punto)
  if (calculadora.esVictima) {
    puntaje += 1
  }

  // 6. CONSTRUCCIÓN DE PAZ (+1 punto)
  if (calculadora.firmantePaz) {
    puntaje += 1
  }

  // 7. PROTECCIÓN (+1 punto)
  if (calculadora.tieneProteccion) {
    puntaje += 1
  }

  // 8. RURALIDAD (+1 punto)
  if (calculadora.viveZonaRural) {
    puntaje += 1
  }

  // 9. DIVERSIDAD SEXUAL (+1 punto) - No acumulativo
  // Suma 1 punto si marca cualquier opción LGBTIQ+ (excepto "no" o vacío)
  const identidadLGBTIQValida = calculadora.identidadLGBTIQ && 
    calculadora.identidadLGBTIQ !== 'no' && 
    String(calculadora.identidadLGBTIQ).trim() !== ''
  if (identidadLGBTIQValida) {
    puntaje += 1
  }

  // 10. POBLACIÓN MIGRANTE (+1 punto)
  if (calculadora.esMigrante) {
    puntaje += 1
  }

  return puntaje
}

/**
 * Calcula el puntaje desde los datos raw de Supabase.
 * Útil para recalcular puntajes de inscripciones existentes.
 */
export function calcularPuntajeFromDB(datosCalculadora: Record<string, unknown> | null): number {
  if (!datosCalculadora) return 0

  const calculadora: CalculadoraPuntaje = {
    regimenSalud: (datosCalculadora.regimenSalud as RegimenSalud) || ('' as RegimenSalud | ''),
    certificadoAdres: null,
    esCuidadora: Boolean(datosCalculadora.esCuidadora),
    tieneDiscapacidad: Boolean(datosCalculadora.tieneDiscapacidad),
    grupoEtnico: (datosCalculadora.grupoEtnico as GrupoEtnico) || ('' as GrupoEtnico | ''),
    esVictima: Boolean(datosCalculadora.esVictima),
    firmantePaz: Boolean(datosCalculadora.firmantePaz),
    tieneProteccion: Boolean(datosCalculadora.tieneProteccion),
    viveZonaRural: Boolean(datosCalculadora.viveZonaRural),
    identidadLGBTIQ: (datosCalculadora.identidadLGBTIQ as IdentidadLGBTIQ) || ('' as IdentidadLGBTIQ | ''),
    esMigrante: Boolean(datosCalculadora.esMigrante),
  }

  return calcularPuntaje(calculadora)
}
