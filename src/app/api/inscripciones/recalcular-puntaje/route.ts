import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/auth'
import { calcularPuntajeFromDB } from '@/lib/calcularPuntaje'

// Endpoint POST para recalcular el puntaje de una inscripción específica
export async function POST(request: NextRequest) {
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
    const { id } = body

    // Validar datos
    if (!id) {
      return NextResponse.json(
        { error: 'ID de inscripción requerido' },
        { status: 400 }
      )
    }

    // Obtener la inscripción de Supabase
    const { data: inscripcion, error: fetchError } = await supabaseAdmin
      .from('inscripciones')
      .select('id, datos_calculadora')
      .eq('id', id)
      .single()

    if (fetchError || !inscripcion) {
      console.error('Error al obtener inscripción:', fetchError)
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    // Recalcular el puntaje
    const nuevoPuntaje = calcularPuntajeFromDB(inscripcion.datos_calculadora)

    // Actualizar en Supabase
    const { data: inscripcionActualizada, error: updateError } = await supabaseAdmin
      .from('inscripciones')
      .update({ puntaje_total: nuevoPuntaje })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error al actualizar puntaje:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar el puntaje' },
        { status: 500 }
      )
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Puntaje recalculado exitosamente',
        puntaje_anterior: inscripcion.datos_calculadora?.puntajeTotal || 0,
        puntaje_nuevo: nuevoPuntaje,
        data: inscripcionActualizada,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error en POST /api/inscripciones/recalcular-puntaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint PUT para recalcular el puntaje de TODAS las inscripciones
export async function PUT(request: NextRequest) {
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

    // Obtener TODAS las inscripciones
    const { data: inscripciones, error: fetchError } = await supabaseAdmin
      .from('inscripciones')
      .select('id, datos_calculadora, puntaje_total')

    if (fetchError) {
      console.error('Error al obtener inscripciones:', fetchError)
      return NextResponse.json(
        { error: 'Error al obtener las inscripciones' },
        { status: 500 }
      )
    }

    if (!inscripciones || inscripciones.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No hay inscripciones para recalcular', total_actualizadas: 0 },
        { status: 200 }
      )
    }

    let actualizadas = 0
    let errores = 0

    // Recalcular y actualizar cada inscripción
    for (const inscripcion of inscripciones) {
      try {
        const nuevoPuntaje = calcularPuntajeFromDB(inscripcion.datos_calculadora)
        
        // Solo actualizar si el puntaje cambió
        if (nuevoPuntaje !== inscripcion.puntaje_total) {
          const { error: updateError } = await supabaseAdmin
            .from('inscripciones')
            .update({ puntaje_total: nuevoPuntaje })
            .eq('id', inscripcion.id)

          if (updateError) {
            console.error(`Error al actualizar inscripción ${inscripcion.id}:`, updateError)
            errores++
          } else {
            actualizadas++
          }
        }
      } catch (error) {
        console.error(`Error procesando inscripción ${inscripcion.id}:`, error)
        errores++
      }
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Proceso de recálculo completado',
        total_inscripciones: inscripciones.length,
        total_actualizadas: actualizadas,
        total_errores: errores,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error en PUT /api/inscripciones/recalcular-puntaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
