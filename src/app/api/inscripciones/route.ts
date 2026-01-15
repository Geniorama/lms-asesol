import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/auth'
import { z } from 'zod'

// Esquema de validación
const inscripcionSchema = z.object({
  datosIdentificacion: z.object({
    nombres: z.string().min(2, 'Nombres requeridos'),
    apellidos: z.string().min(2, 'Apellidos requeridos'),
    tipoDocumento: z.string(),
    numeroDocumento: z.string().min(5, 'Número de documento requerido'),
    fechaNacimiento: z.string(),
    telefonoPrincipal: z.string().min(7, 'Teléfono requerido'),
    telefonoSecundario: z.string().optional(),
    correoElectronico: z.string().email('Email inválido'),
  }),
  ubicacionTerritorial: z.object({
    direccion: z.string().min(5, 'Dirección requerida'),
    barrio: z.string(),
    upz_upl: z.string(),
    resideCiudadBolivar: z.boolean(),
  }),
  seleccionComponente: z.object({
    lineaFormacion: z.string(),
  }),
  calculadoraPuntaje: z.object({}).passthrough(), // Permitir cualquier estructura
  perfilSociolaboral: z.object({
    nivelEducativo: z.string(),
    situacionLaboral: z.string(),
    esJefaHogar: z.boolean().optional(),
    tieneHijos: z.boolean().optional(),
  }),
  legalCierre: z.object({
    aceptaDeclaracion: z.boolean(),
    aceptaAutorizacionDatos: z.boolean(),
    aceptaCompromiso: z.boolean(),
  }),
  puntajeInterno: z.number().optional(),
  edadCalculada: z.number().optional(),
  recaptchaToken: z.string().min(1, 'Token de reCAPTCHA requerido'),
})

// Función para verificar reCAPTCHA con Google
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY no está configurada')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    
    console.log('Verificación reCAPTCHA:', {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    })

    return data.success === true
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del body
    const body = await request.json()

    // Validar estructura de datos
    const validationResult = inscripcionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verificar reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaToken)
    
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Verificación de reCAPTCHA fallida. Por favor, intenta nuevamente.' },
        { status: 400 }
      )
    }

    // Obtener información adicional
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Preparar datos para insertar en la BD
    const inscripcionData = {
      // Datos de identificación
      nombres: data.datosIdentificacion.nombres,
      apellidos: data.datosIdentificacion.apellidos,
      tipo_documento: data.datosIdentificacion.tipoDocumento,
      numero_documento: data.datosIdentificacion.numeroDocumento,
      fecha_nacimiento: data.datosIdentificacion.fechaNacimiento,
      edad_calculada: data.edadCalculada || null,
      telefono_principal: data.datosIdentificacion.telefonoPrincipal,
      telefono_secundario: data.datosIdentificacion.telefonoSecundario || null,
      correo_electronico: data.datosIdentificacion.correoElectronico,

      // Ubicación territorial
      direccion: data.ubicacionTerritorial.direccion,
      barrio: data.ubicacionTerritorial.barrio,
      upz_upl: data.ubicacionTerritorial.upz_upl,
      reside_ciudad_bolivar: data.ubicacionTerritorial.resideCiudadBolivar,

      // Línea de formación
      linea_formacion: data.seleccionComponente.lineaFormacion,

      // Calculadora de puntaje (guardamos todo el objeto como JSON)
      datos_calculadora: data.calculadoraPuntaje,
      puntaje_total: data.puntajeInterno || 0,

      // Perfil sociolaboral
      nivel_educativo: data.perfilSociolaboral.nivelEducativo || null,
      situacion_laboral: data.perfilSociolaboral.situacionLaboral || null,
      es_jefa_hogar: data.perfilSociolaboral.esJefaHogar || false,
      tiene_hijos: data.perfilSociolaboral.tieneHijos || false,

      // Legal
      acepta_declaracion: data.legalCierre.aceptaDeclaracion,
      acepta_autorizacion_datos: data.legalCierre.aceptaAutorizacionDatos,
      acepta_compromiso: data.legalCierre.aceptaCompromiso,

      // Metadata
      recaptcha_verificado: true,
      ip_address: ipAddress,
      user_agent: userAgent,
      estado: 'interesada',
    }

    // Insertar en Supabase
    const { data: inscripcion, error: dbError } = await supabaseAdmin
      .from('inscripciones')
      .insert(inscripcionData)
      .select()
      .single()

    if (dbError) {
      console.error('Error al guardar inscripción:', dbError)
      
      // Manejo específico de error de documento duplicado
      if (dbError.code === '23505') { // Violación de unique constraint
        return NextResponse.json(
          { 
            error: 'Ya existe una inscripción con este número de documento.',
            details: 'Si necesitas actualizar tu información, contacta con soporte.'
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Error al guardar la inscripción. Por favor, intenta nuevamente.' },
        { status: 500 }
      )
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: '¡Inscripción enviada exitosamente!',
        inscripcionId: inscripcion.id,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error en POST /api/inscripciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint PATCH para actualizar estado de inscripción (solo admins)
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea admin
    if (session.user.rol !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    // Obtener datos del body
    const body = await request.json()
    const { id, estado, notas_admin } = body

    // Validar datos
    if (!id) {
      return NextResponse.json(
        { error: 'ID de inscripción requerido' },
        { status: 400 }
      )
    }

    if (!estado) {
      return NextResponse.json(
        { error: 'Estado requerido' },
        { status: 400 }
      )
    }

    // Validar que el estado sea válido
    const estadosValidos = ['interesada', 'verificada', 'participante', 'lista_espera', 'rechazada']
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Actualizar en Supabase
    const updateData: any = {
      estado,
      fecha_actualizacion: new Date().toISOString(),
    }

    // Agregar notas si se proporcionan
    if (notas_admin !== undefined) {
      updateData.notas_admin = notas_admin
    }

    const { data: inscripcion, error: dbError } = await supabaseAdmin
      .from('inscripciones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (dbError) {
      console.error('Error al actualizar inscripción:', dbError)
      return NextResponse.json(
        { error: 'Error al actualizar la inscripción' },
        { status: 500 }
      )
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: inscripcion,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error en PATCH /api/inscripciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint GET para obtener inscripciones (solo admins)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea admin
    if (session.user.rol !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    // Obtener parámetros de query para filtros y paginación
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado')
    const lineaFormacion = searchParams.get('lineaFormacion')
    const busqueda = searchParams.get('busqueda')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query base
    let query = supabaseAdmin
      .from('inscripciones')
      .select('*', { count: 'exact' })
      .order('fecha_inscripcion', { ascending: false })

    // Aplicar filtros
    if (estado && estado !== 'todos') {
      query = query.eq('estado', estado)
    }

    if (lineaFormacion && lineaFormacion !== 'todos') {
      query = query.eq('linea_formacion', lineaFormacion)
    }

    if (busqueda && busqueda.trim() !== '') {
      // Buscar en nombres, apellidos, email o documento
      query = query.or(
        `nombres.ilike.%${busqueda}%,` +
        `apellidos.ilike.%${busqueda}%,` +
        `correo_electronico.ilike.%${busqueda}%,` +
        `numero_documento.ilike.%${busqueda}%`
      )
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1)

    // Ejecutar query
    const { data: inscripciones, error: dbError, count } = await query

    if (dbError) {
      console.error('Error al obtener inscripciones:', dbError)
      return NextResponse.json(
        { error: 'Error al obtener las inscripciones' },
        { status: 500 }
      )
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: inscripciones || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error en GET /api/inscripciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
