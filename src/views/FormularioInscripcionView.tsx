"use client"

import { useForm } from "react-hook-form"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import type { FormularioInscripcion } from "@/types"
import FileUpload from "@/components/FileUpload"
import ReCAPTCHA from "react-google-recaptcha"
import { calcularPuntaje } from "@/lib/calcularPuntaje"

// Datos de ejemplo para los campos desplegables
const BARRIOS_CIUDAD_BOLIVAR = [
  "Arborizadora Alta",
  "Arborizadora Baja", 
  "Candelaria",
  "El Mochuelo",
  "El Tesoro",
  "Jerusalén",
  "Lucero Alto",
  "Lucero Bajo",
  "Quiba",
  "San Francisco",
  "Sierra Morena",
  "Vista Hermosa",
  "Ismael Perdomo",
  "Potosí",
  "El Paraíso"
];

const UPZ_OPTIONS = [
  { value: "UPZ 63 - Ismael Perdomo", label: "UPZ 63 - Ismael Perdomo" },
  { value: "UPZ 64 - Quiba", label: "UPZ 64 - Quiba" },
  { value: "UPZ 65 - Lucero", label: "UPZ 65 - Lucero" },
  { value: "UPZ 66 - El Tesoro", label: "UPZ 66 - El Tesoro" },
  { value: "UPZ 67 - Jerusalén", label: "UPZ 67 - Jerusalén" },
  { value: "UPZ 68 - San Francisco", label: "UPZ 68 - San Francisco" },
  { value: "UPZ 69 - Arborizadora", label: "UPZ 69 - Arborizadora" },
  { value: "UPL - El Mochuelo", label: "UPL - El Mochuelo" },
];

const PASOS = [
  { id: 1, titulo: "Datos de Identificación", descripcion: "Información personal y de contacto" },
  { id: 2, titulo: "Ubicación Territorial", descripcion: "Dirección y residencia" },
  { id: 3, titulo: "Línea de Formación", descripcion: "Selección del componente" },
  { id: 4, titulo: "Información Adicional", descripcion: "Preguntas complementarias" },
  { id: 5, titulo: "Perfil Sociolaboral", descripcion: "Información educativa y laboral" },
  { id: 6, titulo: "Legal y Cierre", descripcion: "Términos y condiciones" },
];

export default function FormularioInscripcionView() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors }, setValue, setError, clearErrors, trigger } = useForm<FormularioInscripcion>({
    mode: "onChange",
    defaultValues: {
      datosIdentificacion: {
        nombres: "",
        apellidos: "",
        tipoDocumento: "C.C.",
        numeroDocumento: "",
        fechaNacimiento: "",
        telefonoPrincipal: "",
        telefonoSecundario: "",
        correoElectronico: "",
      },
      ubicacionTerritorial: {
        direccion: "",
        barrio: "",
        upz_upl: "",
        resideCiudadBolivar: true,
        reciboPublico: null,
      },
      seleccionComponente: {
        lineaFormacion: "",
      },
      calculadoraPuntaje: {
        regimenSalud: "",
        certificadoAdres: null,
        esCuidadora: false,
        tieneDiscapacidad: false,
        grupoEtnico: "",
        esVictima: false,
        firmantePaz: false,
        tieneProteccion: false,
        viveZonaRural: false,
        identidadLGBTIQ: "",
        esMigrante: false,
      },
      perfilSociolaboral: {
        nivelEducativo: "",
        situacionLaboral: "",
        esJefaHogar: false,
        tieneHijos: false,
      },
      legalCierre: {
        aceptaDeclaracion: false,
        aceptaAutorizacionDatos: false,
        aceptaCompromiso: false,
      }
    }
  });

  const [pasoActual, setPasoActual] = useState(1);
  const [edad, setEdad] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensajeBloqueo, setMensajeBloqueo] = useState("");
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [tieneProgresoGuardado, setTieneProgresoGuardado] = useState(false);
  const [pasoActualCompleto, setPasoActualCompleto] = useState(false);

  // Cargar progreso guardado desde localStorage al montar el componente
  useEffect(() => {
    const progressoGuardado = localStorage.getItem("formulario-inscripcion-progreso");
    const pasoGuardado = localStorage.getItem("formulario-inscripcion-paso");
    
    if (progressoGuardado) {
      try {
        const datos = JSON.parse(progressoGuardado);
        // Restaurar todos los campos del formulario
        Object.keys(datos).forEach((key) => {
          setValue(key as keyof FormularioInscripcion, datos[key]);
        });
        
        // Restaurar el paso actual
        if (pasoGuardado) {
          setPasoActual(parseInt(pasoGuardado));
        }
        
        // Indicar que hay progreso guardado
        setTieneProgresoGuardado(true);
      } catch (error) {
        console.error("Error al cargar el progreso:", error);
      }
    }
    
    // Marcar como cargado después de intentar cargar (haya o no datos)
    setProgresoCargado(true);
  }, [setValue]);

  // Guardar progreso automáticamente cada vez que cambian los datos
  useEffect(() => {
    if (!progresoCargado) return; // Esperar a que se cargue primero
    
    const subscription = watch((data) => {
      localStorage.setItem("formulario-inscripcion-progreso", JSON.stringify(data));
      localStorage.setItem("formulario-inscripcion-paso", pasoActual.toString());
      setTieneProgresoGuardado(true); // Marcar que ahora hay progreso guardado
    });
    
    return () => subscription.unsubscribe();
  }, [watch, pasoActual, progresoCargado]);

  // Watch fields necesarios para lógica condicional
  const fechaNacimiento = watch("datosIdentificacion.fechaNacimiento");
  const lineaFormacion = watch("seleccionComponente.lineaFormacion");
  const tipoDocumento = watch("datosIdentificacion.tipoDocumento");
  const resideCiudadBolivar = watch("ubicacionTerritorial.resideCiudadBolivar");
  const ultimoGradoEscolar = watch("seleccionComponente.ultimoGradoEscolar");
  const tieneLicencia = watch("seleccionComponente.tieneLicencia");
  const tieneAntecedentes = watch("seleccionComponente.tieneAntecedentes");
  const emprendimientoDomiciliadoCB = watch("seleccionComponente.emprendimientoDomiciliadoCB");
  const tieneNegocio = watch("seleccionComponente.tieneNegocio");
  
  // Watch para todos los campos del formulario
  const todosLosCampos = watch();
  
  // Watch para calculadora de puntaje
  const regimenSalud = watch("calculadoraPuntaje.regimenSalud");
  const esCuidadora = watch("calculadoraPuntaje.esCuidadora");
  const tieneDiscapacidad = watch("calculadoraPuntaje.tieneDiscapacidad");
  const grupoEtnico = watch("calculadoraPuntaje.grupoEtnico");
  const esVictima = watch("calculadoraPuntaje.esVictima");
  const firmantePaz = watch("calculadoraPuntaje.firmantePaz");
  const tieneProteccion = watch("calculadoraPuntaje.tieneProteccion");
  const viveZonaRural = watch("calculadoraPuntaje.viveZonaRural");
  const identidadLGBTIQ = watch("calculadoraPuntaje.identidadLGBTIQ");
  const esMigrante = watch("calculadoraPuntaje.esMigrante");

  // Validación centralizada de todas las condiciones de bloqueo
  useEffect(() => {
    // 1. Validar edad mínima
    if (edad !== null && edad < 14) {
      setBloqueado(true);
      setMensajeBloqueo("Lo sentimos, el registro requiere ser mayor de 14 años.");
      return;
    }

    // 2. Validar residencia en Ciudad Bolívar
    if (resideCiudadBolivar === false) {
      setBloqueado(true);
      setMensajeBloqueo("Lo sentimos, el proyecto es exclusivo para residentes de la localidad de Ciudad Bolívar.");
      return;
    }

    // 3. Validar restricciones por línea de formación
    if (lineaFormacion && edad) {
      if (lineaFormacion === "conduccion" && (edad < 18 || edad > 60)) {
        setBloqueado(true);
        setMensajeBloqueo("La línea de Conducción solo está disponible para personas entre 18 y 60 años.");
        return;
      }
      if (lineaFormacion === "vigilancia" && edad < 18) {
        setBloqueado(true);
        setMensajeBloqueo("La línea de Vigilancia y Seguridad Privada solo está disponible para mayores de 18 años.");
        return;
      }
      if (lineaFormacion === "cuidado_estetico" && edad < 14) {
        setBloqueado(true);
        setMensajeBloqueo("La línea de Cuidado Estético solo está disponible para mayores de 14 años.");
        return;
      }
    }

    // 4. Validar grado escolar para Cuidado Estético
    if (lineaFormacion === "cuidado_estetico" && ultimoGradoEscolar) {
      if (ultimoGradoEscolar !== "bachiller") {
        const grado = parseInt(ultimoGradoEscolar.replace(/\D/g, ""));
        if (!isNaN(grado) && grado < 9) {
          setBloqueado(true);
          setMensajeBloqueo("Tu postulación no puede continuar, no cumples con el requisito técnico para acceder a esta línea de formación (Mínimo 9° grado).");
          return;
        }
      }
    }

    // 5. Validar que NO tenga licencia para Conducción (filtro excluyente)
    if (lineaFormacion === "conduccion" && tieneLicencia) {
      setBloqueado(true);
      setMensajeBloqueo("No puede continuar por esta línea si ya tiene licencia de conducción. Este programa está dirigido a personas que aún no cuentan con licencia.");
      return;
    }

    // 6. Validar que NO tenga antecedentes para Vigilancia (filtro excluyente)
    if (lineaFormacion === "vigilancia" && tieneAntecedentes) {
      setBloqueado(true);
      setMensajeBloqueo("No puede continuar por esta línea si tiene antecedentes judiciales (Decreto 1565).");
      return;
    }

    // 7. Validar que el emprendimiento/idea esté domiciliado en CB (filtro excluyente)
    // Aplica tanto para negocios activos como para ideas
    if (lineaFormacion === "emprendimiento" && tieneNegocio && emprendimientoDomiciliadoCB === false) {
      setBloqueado(true);
      setMensajeBloqueo("Solo se aceptan emprendimientos e ideas domiciliados en la localidad de Ciudad Bolívar.");
      return;
    }

    // Si llegamos aquí, no hay bloqueos
    setBloqueado(false);
    setMensajeBloqueo("");
  }, [edad, resideCiudadBolivar, lineaFormacion, ultimoGradoEscolar, tieneLicencia, tieneAntecedentes, emprendimientoDomiciliadoCB, tieneNegocio]);

  // Calcular edad cuando cambia fecha de nacimiento
  useEffect(() => {
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      setEdad(edadCalculada);
    }
  }, [fechaNacimiento]);

  // Validar migrante con PPT
  useEffect(() => {
    if (esMigrante && tipoDocumento !== "PPT") {
      setError("calculadoraPuntaje.esMigrante", {
        type: "manual",
        message: "Los migrantes deben tener PPT como tipo de documento"
      });
    } else {
      clearErrors("calculadoraPuntaje.esMigrante");
    }
  }, [esMigrante, tipoDocumento, setError, clearErrors]);

  // Calcular puntaje total usando la función centralizada
  useEffect(() => {
    const calculadoraData = watch("calculadoraPuntaje");
    const puntaje = calcularPuntaje(calculadoraData);
    setPuntajeTotal(puntaje);
  }, [watch, regimenSalud, esCuidadora, tieneDiscapacidad, grupoEtnico, esVictima, firmantePaz, tieneProteccion, viveZonaRural, identidadLGBTIQ, esMigrante]);

  // Verificar si el paso actual está completo (para habilitar/deshabilitar botón)
  const verificarPasoCompleto = useCallback(() => {
    const datos = todosLosCampos;

    switch (pasoActual) {
      case 1:
        return !!(
          datos.datosIdentificacion?.nombres &&
          datos.datosIdentificacion?.apellidos &&
          datos.datosIdentificacion?.numeroDocumento &&
          datos.datosIdentificacion?.fechaNacimiento &&
          datos.datosIdentificacion?.telefonoPrincipal &&
          datos.datosIdentificacion?.telefonoSecundario &&
          datos.datosIdentificacion?.correoElectronico &&
          // Validar formato de email
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(datos.datosIdentificacion?.correoElectronico || "") &&
          // Validar formato de teléfonos (10 dígitos)
          /^[0-9]{10}$/.test(datos.datosIdentificacion?.telefonoPrincipal || "") &&
          /^[0-9]{10}$/.test(datos.datosIdentificacion?.telefonoSecundario || "")
        );

      case 2:
        return !!(
          datos.ubicacionTerritorial?.direccion &&
          datos.ubicacionTerritorial?.barrio &&
          datos.ubicacionTerritorial?.upz_upl &&
          datos.ubicacionTerritorial?.reciboPublico &&
          datos.ubicacionTerritorial?.resideCiudadBolivar === true
        );

      case 3:
        if (!datos.seleccionComponente?.lineaFormacion) return false;

        if (lineaFormacion === "emprendimiento") {
          // No permitir continuar si el emprendimiento/idea NO está domiciliado en CB
          if (datos.seleccionComponente?.tieneNegocio && 
              datos.seleccionComponente?.emprendimientoDomiciliadoCB === false) {
            return false;
          }
          
          // Requiere todos los campos obligatorios incluyendo checkbox de domicilio
          return !!(
            datos.seleccionComponente?.tieneNegocio &&
            datos.seleccionComponente?.estadoEmprendimiento &&
            datos.seleccionComponente?.emprendimientoDomiciliadoCB === true
          );
        } else if (lineaFormacion === "cuidado_estetico") {
          return !!datos.seleccionComponente?.ultimoGradoEscolar;
        } else if (lineaFormacion === "conduccion") {
          // No permitir continuar si ya tiene licencia
          if (datos.seleccionComponente?.tieneLicencia) {
            return false;
          }
        } else if (lineaFormacion === "vigilancia") {
          // No permitir continuar si tiene antecedentes
          if (datos.seleccionComponente?.tieneAntecedentes) {
            return false;
          }
        }
        
        return true;

      case 4:
        const baseCompleto = !!(
          datos.calculadoraPuntaje?.regimenSalud &&
          datos.calculadoraPuntaje?.certificadoAdres
        );

        if (!baseCompleto) return false;

        // Si es cuidadora, validar campos adicionales
        if (datos.calculadoraPuntaje?.esCuidadora) {
          return !!(
            datos.calculadoraPuntaje?.tipoCuidado &&
            datos.calculadoraPuntaje?.personaCuidada?.nombres &&
            datos.calculadoraPuntaje?.personaCuidada?.apellidos &&
            datos.calculadoraPuntaje?.personaCuidada?.identificacion
          );
        }

        return true;

      case 5:
        const perfilCompleto = !!(
          datos.perfilSociolaboral?.nivelEducativo &&
          datos.perfilSociolaboral?.situacionLaboral
        );

        if (!perfilCompleto) return false;

        // Si tiene hijos, validar número
        if (datos.perfilSociolaboral?.tieneHijos) {
          return !!(datos.perfilSociolaboral?.numeroHijos && datos.perfilSociolaboral.numeroHijos > 0);
        }

        return true;

      case 6:
        return !!(
          datos.legalCierre?.aceptaDeclaracion &&
          datos.legalCierre?.aceptaAutorizacionDatos &&
          datos.legalCierre?.aceptaCompromiso
        );

      default:
        return false;
    }
  }, [todosLosCampos, pasoActual, lineaFormacion]);

  // Actualizar estado cuando cambien los campos
  useEffect(() => {
    setPasoActualCompleto(verificarPasoCompleto());
  }, [verificarPasoCompleto]);

  const validarPasoActual = async () => {
    let camposAValidar: string[] = [];
    const datosFormulario = watch();

    switch (pasoActual) {
      case 1:
        camposAValidar = [
          "datosIdentificacion.nombres",
          "datosIdentificacion.apellidos",
          "datosIdentificacion.tipoDocumento",
          "datosIdentificacion.numeroDocumento",
          "datosIdentificacion.fechaNacimiento",
          "datosIdentificacion.telefonoPrincipal",
          "datosIdentificacion.telefonoSecundario",
          "datosIdentificacion.correoElectronico"
        ];
        break;
      case 2:
        camposAValidar = [
          "ubicacionTerritorial.direccion",
          "ubicacionTerritorial.barrio",
          "ubicacionTerritorial.upz_upl"
        ];
        
        // Validar recibo público (obligatorio)
        if (!datosFormulario.ubicacionTerritorial?.reciboPublico) {
          alert("Por favor, carga el Recibo Público. Es un requisito obligatorio.");
          return false;
        }
        
        // Validar checkbox de residencia
        if (!datosFormulario.ubicacionTerritorial?.resideCiudadBolivar) {
          alert("Debes confirmar que resides en la localidad de Ciudad Bolívar.");
          return false;
        }
        break;
      case 3:
        camposAValidar = ["seleccionComponente.lineaFormacion"];
        
        if (lineaFormacion === "emprendimiento") {
          camposAValidar.push(
            "seleccionComponente.tieneNegocio",
            "seleccionComponente.estadoEmprendimiento"
          );
          
          // Validar checkbox de emprendimiento domiciliado en CB
          if (!datosFormulario.seleccionComponente?.emprendimientoDomiciliadoCB) {
            alert("Debes confirmar que tu emprendimiento/idea está domiciliado en Ciudad Bolívar.");
            return false;
          }
        } else if (lineaFormacion === "cuidado_estetico") {
          camposAValidar.push("seleccionComponente.ultimoGradoEscolar");
        }
        break;
      case 4:
        camposAValidar = ["calculadoraPuntaje.regimenSalud"];
        
        // Validar certificado ADRES (obligatorio)
        if (!datosFormulario.calculadoraPuntaje?.certificadoAdres) {
          alert("Por favor, carga el Certificado ADRES. Es obligatorio.");
          return false;
        }
        
        // Validar certificados condicionales obligatorios
        if (datosFormulario.calculadoraPuntaje?.esCuidadora) {
          if (!datosFormulario.calculadoraPuntaje?.tipoCuidado) {
            alert("Por favor, selecciona el tipo de cuidado.");
            return false;
          }
          // Validar datos de persona cuidada
          if (!datosFormulario.calculadoraPuntaje?.personaCuidada?.nombres ||
              !datosFormulario.calculadoraPuntaje?.personaCuidada?.apellidos ||
              !datosFormulario.calculadoraPuntaje?.personaCuidada?.identificacion) {
            alert("Por favor, completa los datos de la persona cuidada.");
            return false;
          }
        }
        break;
      case 5:
        camposAValidar = [
          "perfilSociolaboral.nivelEducativo",
          "perfilSociolaboral.situacionLaboral"
        ];
        if (watch("perfilSociolaboral.tieneHijos")) {
          camposAValidar.push("perfilSociolaboral.numeroHijos");
        }
        break;
      case 6:
        camposAValidar = [
          "legalCierre.aceptaDeclaracion",
          "legalCierre.aceptaAutorizacionDatos",
          "legalCierre.aceptaCompromiso"
        ];
        break;
    }

    const resultado = await trigger(camposAValidar as never[]);
    return resultado;
  };

  const siguientePaso = async () => {
    const esValido = await validarPasoActual();
    if (esValido && !bloqueado) {
      setPasoActual((prev) => Math.min(prev + 1, PASOS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const pasoAnterior = () => {
    setPasoActual((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarProgreso = () => {
    if (confirm("¿Está seguro de que desea limpiar todo el progreso guardado?")) {
      localStorage.removeItem("formulario-inscripcion-progreso");
      localStorage.removeItem("formulario-inscripcion-paso");
      setTieneProgresoGuardado(false);
      window.location.reload();
    }
  };

  const onSubmit = async (data: FormularioInscripcion) => {
    if (bloqueado) {
      alert(mensajeBloqueo);
      return;
    }

    // Validar reCAPTCHA
    if (!recaptchaToken) {
      alert("Por favor, completa la verificación de reCAPTCHA antes de enviar el formulario.");
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);
    
    try {
      // Agregar el puntaje calculado a los datos
      const datosCompletos = {
        ...data,
        puntajeInterno: puntajeTotal,
        edadCalculada: edad,
        recaptchaToken // Incluir el token para validación en backend
      };
      
      console.log("Enviando datos al servidor...");

      // Enviar al API
      const response = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCompletos),
      });

      const resultado = await response.json();

      if (!response.ok) {
        // Error del servidor
        throw new Error(resultado.error || 'Error al enviar la inscripción');
      }

      // Éxito!
      console.log("Inscripción guardada:", resultado);
      
      // Limpiar localStorage después del envío exitoso
      localStorage.removeItem("formulario-inscripcion-progreso");
      localStorage.removeItem("formulario-inscripcion-paso");
      setTieneProgresoGuardado(false);
      
      // Resetear reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      
      // Redirigir a la página de agradecimiento
      router.push('/gracias');

    } catch (error) {
      console.error('Error al enviar inscripción:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorEnvio(mensaje);
      
      // Mostrar error al usuario
      alert(
        `❌ Error al enviar la inscripción\n\n` +
        `${mensaje}\n\n` +
        `Por favor, intenta nuevamente. Si el problema persiste, contacta con soporte.`
      );
      
      // Resetear reCAPTCHA para permitir reintento
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-6">
          <div className="mb-6 relative">
            {/* Botón limpiar progreso - Solo visible en desktop en la esquina */}
            {tieneProgresoGuardado && (
              <div className="hidden md:block absolute top-0 right-0">
                <button
                  type="button"
                  onClick={limpiarProgreso}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer border border-red-200"
                  title="Limpiar progreso guardado"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar progreso
                </button>
              </div>
            )}
            
            {/* Título */}
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
                Formulario de Inscripción
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Proyecto de Formación - Ciudad Bolívar
              </p>
            </div>
            
            {/* Botón limpiar progreso - Solo visible en mobile, centrado debajo */}
            {tieneProgresoGuardado && (
              <div className="md:hidden flex justify-center mt-4">
                <button
                  type="button"
                  onClick={limpiarProgreso}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200 shadow-sm"
                  title="Limpiar progreso guardado"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar progreso guardado
                </button>
              </div>
            )}
          </div>

          {/* Indicador de Progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {PASOS.map((paso) => (
                <div key={paso.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      pasoActual === paso.id
                        ? "bg-blue-600 text-white scale-110 shadow-lg"
                        : pasoActual > paso.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {pasoActual > paso.id ? "✓" : paso.id}
                  </div>
                  <div className="hidden md:block text-xs text-center mt-2 w-24">
                    <p className={`font-medium ${pasoActual === paso.id ? "text-blue-600" : "text-gray-500"}`}>
                      {paso.titulo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-linear-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Información del paso actual */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {PASOS[pasoActual - 1].titulo}
            </h2>
            <p className="text-sm text-gray-600">{PASOS[pasoActual - 1].descripcion}</p>
          </div>
        </div>

        {/* Alertas */}
        {mensajeBloqueo && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow">
            <p className="font-semibold">⚠️ {mensajeBloqueo}</p>
          </div>
        )}

        {edad !== null && pasoActual === 1 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-lg shadow">
            <p><strong>Edad calculada:</strong> {edad} años</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            {/* PASO 1: DATOS DE IDENTIFICACIÓN */}
            {pasoActual === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombres Completos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("datosIdentificacion.nombres", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingrese sus nombres"
                    />
                    {errors.datosIdentificacion?.nombres && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.nombres.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos Completos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("datosIdentificacion.apellidos", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingrese sus apellidos"
                    />
                    {errors.datosIdentificacion?.apellidos && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.apellidos.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("datosIdentificacion.tipoDocumento", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                      <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                      <option value="PPT">Permiso de Protección Temporal (PPT)</option>
                      <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("datosIdentificacion.numeroDocumento", { 
                        required: "Este campo es obligatorio",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Solo se permiten números"
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Número de documento"
                    />
                    {errors.datosIdentificacion?.numeroDocumento && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.numeroDocumento.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("datosIdentificacion.fechaNacimiento", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.datosIdentificacion?.fechaNacimiento && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.fechaNacimiento.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono Celular Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register("datosIdentificacion.telefonoPrincipal", { 
                        required: "Este campo es obligatorio",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Debe tener 10 dígitos"
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3001234567"
                    />
                    {errors.datosIdentificacion?.telefonoPrincipal && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.telefonoPrincipal.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono Celular Secundario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register("datosIdentificacion.telefonoSecundario", { 
                        required: "Este campo es obligatorio",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Debe tener 10 dígitos"
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3001234567"
                    />
                    {errors.datosIdentificacion?.telefonoSecundario && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.telefonoSecundario.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("datosIdentificacion.correoElectronico", { 
                        required: "Este campo es obligatorio",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Correo electrónico inválido"
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                    {errors.datosIdentificacion?.correoElectronico && (
                      <p className="mt-1 text-sm text-red-600">{errors.datosIdentificacion.correoElectronico.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: UBICACIÓN TERRITORIAL */}
            {pasoActual === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de Residencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("ubicacionTerritorial.direccion", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle 1 # 2-3"
                    />
                    {errors.ubicacionTerritorial?.direccion && (
                      <p className="mt-1 text-sm text-red-600">{errors.ubicacionTerritorial.direccion.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barrio <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("ubicacionTerritorial.barrio", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un barrio</option>
                      {BARRIOS_CIUDAD_BOLIVAR.map((barrio) => (
                        <option key={barrio} value={barrio}>{barrio}</option>
                      ))}
                    </select>
                    {errors.ubicacionTerritorial?.barrio && (
                      <p className="mt-1 text-sm text-red-600">{errors.ubicacionTerritorial.barrio.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPZ / UPL <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("ubicacionTerritorial.upz_upl", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione UPZ/UPL</option>
                      {UPZ_OPTIONS.map((upz) => (
                        <option key={upz.value} value={upz.value}>{upz.label}</option>
                      ))}
                    </select>
                    {errors.ubicacionTerritorial?.upz_upl && (
                      <p className="mt-1 text-sm text-red-600">{errors.ubicacionTerritorial.upz_upl.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <input
                        type="checkbox"
                        {...register("ubicacionTerritorial.resideCiudadBolivar")}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ¿Reside actualmente en la localidad de Ciudad Bolívar? <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <FileUpload
                      label="Recibo Público (Foto/PDF)"
                      required={true}
                      accept="image/*,.pdf"
                      onChange={(file) => setValue("ubicacionTerritorial.reciboPublico", file)}
                      hint="JPG, PNG o PDF (máx. 5MB) - Requisito obligatorio"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: SELECCIÓN DEL COMPONENTE */}
            {pasoActual === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿A qué línea de formación desea inscribirse? <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("seleccionComponente.lineaFormacion", { required: "Este campo es obligatorio" })}
                    disabled={!edad || edad < 14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccione una línea de formación</option>
                    <option value="emprendimiento">A. Emprendimiento</option>
                    {edad && edad >= 18 && edad <= 60 && (
                      <option value="conduccion">B. Conducción (Licencia C1)</option>
                    )}
                    {edad && edad >= 18 && (
                      <option value="vigilancia">C. Vigilancia y Seguridad Privada</option>
                    )}
                    {edad && edad >= 14 && (
                      <option value="cuidado_estetico">D. Cuidado Estético (Manicure/Pedicure)</option>
                    )}
                  </select>
                  {errors.seleccionComponente?.lineaFormacion && (
                    <p className="mt-1 text-sm text-red-600">{errors.seleccionComponente.lineaFormacion.message}</p>
                  )}
                </div>

                {/* EMPRENDIMIENTO */}
                {lineaFormacion === "emprendimiento" && (
                  <div className="space-y-6 bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg text-blue-900">Preguntas sobre Emprendimiento</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Tiene un negocio activo o es una idea? <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("seleccionComponente.tieneNegocio", { required: "Este campo es obligatorio" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="activo">Negocio Activo</option>
                        <option value="idea">Es una Idea</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Estado? <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("seleccionComponente.estadoEmprendimiento", { required: "Este campo es obligatorio" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="idea">Idea</option>
                        <option value="en_marcha">En Marcha</option>
                        <option value="liderazgo_comunitario">Liderazgo Comunitario</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register("seleccionComponente.perteneceOrganizacion")}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ¿Pertenece a alguna organización / JAC?
                        </span>
                      </label>
                    </div>

                    {watch("seleccionComponente.perteneceOrganizacion") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ¿Cuál organización?
                        </label>
                        <input
                          type="text"
                          {...register("seleccionComponente.nombreOrganizacion")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nombre de la organización"
                        />
                      </div>
                    )}

                    {/* Checkbox de domicilio - Solo se muestra si ya seleccionó Negocio Activo o Idea */}
                    {tieneNegocio && (
                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            {...register("seleccionComponente.emprendimientoDomiciliadoCB", { required: "Debe confirmar que su emprendimiento está domiciliado en Ciudad Bolívar" })}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            ¿Su emprendimiento/idea está domiciliado en Ciudad Bolívar? <span className="text-red-500">*</span>
                          </span>
                        </label>
                        {errors.seleccionComponente?.emprendimientoDomiciliadoCB && (
                          <p className="mt-1 text-sm text-red-600">{errors.seleccionComponente.emprendimientoDomiciliadoCB.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* CONDUCCIÓN */}
                {lineaFormacion === "conduccion" && (
                  <div className="space-y-6 bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg text-green-900">Preguntas sobre Conducción</h3>
                    
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register("seleccionComponente.sabeConducir")}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ¿Sabe conducir actualmente?
                        </span>
                      </label>
                    </div>

                    {watch("seleccionComponente.sabeConducir") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ¿Cómo aprendió a conducir?
                        </label>
                        <select
                          {...register("seleccionComponente.comoAprendioConducir")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="curso">Curso de conducción</option>
                          <option value="empirico">Experiencia empírica</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register("seleccionComponente.tieneLicencia")}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ¿Cuenta actualmente con licencia de conducción?
                        </span>
                      </label>
                      {watch("seleccionComponente.tieneLicencia") && (
                        <p className="mt-2 text-sm text-red-600">⚠️ No puede continuar por esta línea si ya tiene licencia</p>
                      )}
                    </div>
                  </div>
                )}

                {/* VIGILANCIA */}
                {lineaFormacion === "vigilancia" && (
                  <div className="space-y-6 bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg text-purple-900">Preguntas sobre Vigilancia y Seguridad</h3>
                    
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register("seleccionComponente.tieneAntecedentes")}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ¿Tiene antecedentes judiciales?
                        </span>
                      </label>
                      {watch("seleccionComponente.tieneAntecedentes") && (
                        <p className="mt-2 text-sm text-red-600">⚠️ Filtro excluyente - Decreto 1565</p>
                      )}
                    </div>
                  </div>
                )}

                {/* CUIDADO ESTÉTICO */}
                {lineaFormacion === "cuidado_estetico" && (
                  <div className="space-y-6 bg-pink-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg text-pink-900">Preguntas sobre Cuidado Estético</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Cuál es su último grado escolar aprobado? <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("seleccionComponente.ultimoGradoEscolar", { required: "Este campo es obligatorio" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="1">1° Primaria</option>
                        <option value="2">2° Primaria</option>
                        <option value="3">3° Primaria</option>
                        <option value="4">4° Primaria</option>
                        <option value="5">5° Primaria</option>
                        <option value="6">6° Bachillerato</option>
                        <option value="7">7° Bachillerato</option>
                        <option value="8">8° Bachillerato</option>
                        <option value="9">9° Bachillerato</option>
                        <option value="10">10° Bachillerato</option>
                        <option value="11">11° Bachillerato</option>
                        <option value="bachiller">Bachiller Completo</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 4: INFORMACIÓN ADICIONAL (antes Calculadora de Puntaje) */}
            {pasoActual === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-linear-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-center text-lg font-semibold text-gray-700">
                    Por favor, responda las siguientes preguntas adicionales sobre su situación actual
                  </p>
                </div>

                {/* 1. SALUD */}
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                    Salud y Seguridad Social
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Cuál es su régimen de salud actual? <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("calculadoraPuntaje.regimenSalud", { required: "Este campo es obligatorio" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="subsidiado">Subsidiado</option>
                        <option value="contributivo_beneficiaria">Contributivo - Beneficiaria</option>
                        <option value="contributivo_cotizante">Contributivo - Cotizante</option>
                        <option value="no_afiliada">No afiliada / Sisbén únicamente</option>
                      </select>
                      {errors.calculadoraPuntaje?.regimenSalud && (
                        <p className="mt-1 text-sm text-red-600">{errors.calculadoraPuntaje.regimenSalud.message}</p>
                      )}
                    </div>

                    <div>
                      <FileUpload
                        label="Certificado ADRES"
                        accept="image/*,.pdf"
                        onChange={(file) => setValue("calculadoraPuntaje.certificadoAdres", file)}
                        hint="Certificado de afiliación al sistema de salud"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ROL DE CUIDADO */}
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                    Rol de Cuidado
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register("calculadoraPuntaje.esCuidadora")}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ¿Se reconoce usted como mujer cuidadora (de niños, adultos mayores, personas con discapacidad)?
                        </span>
                      </label>
                    </div>

                    {esCuidadora && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de cuidado
                          </label>
                          <select
                            {...register("calculadoraPuntaje.tipoCuidado")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="remunerado">Remunerado</option>
                            <option value="no_remunerado">No remunerado</option>
                            <option value="familiar">Familiar</option>
                          </select>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Identificación de la persona cuidada</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              {...register("calculadoraPuntaje.personaCuidada.nombres")}
                              placeholder="Nombres completos"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              {...register("calculadoraPuntaje.personaCuidada.apellidos")}
                              placeholder="Apellidos completos"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              {...register("calculadoraPuntaje.personaCuidada.identificacion")}
                              placeholder="Número de identificación"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="tel"
                              {...register("calculadoraPuntaje.personaCuidada.telefono")}
                              placeholder="Teléfono de contacto"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <FileUpload
                            label="Certificado / Autocertificación"
                            accept="image/*,.pdf"
                            onChange={(file) => setValue("calculadoraPuntaje.certificadoCuidado", file)}
                            hint="Documento que certifique su rol como cuidadora"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Continuar con el resto de criterios de puntaje... */}
                {/* Por brevedad, incluiré versiones resumidas de los demás criterios */}
                
                {/* 3-10: Resto de criterios */}
                <div className="space-y-4">
                  {/* 3. DISCAPACIDAD */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.tieneDiscapacidad")}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">3. Discapacidad:</span> ¿Presenta alguna condición de discapacidad certificada?
                      </span>
                    </label>
                    {tieneDiscapacidad && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado de Discapacidad"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoDiscapacidad", file)}
                          hint="Certificado oficial de su condición"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. PERTENENCIA ÉTNICA */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">4. Pertenencia Étnica:</span> ¿Se autorreconoce en alguno de estos grupos?
                    </label>
                    <select
                      {...register("calculadoraPuntaje.grupoEtnico")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="indigena">Indígena</option>
                      <option value="afrocolombiana">Afrocolombiana</option>
                      <option value="raizal">Raizal</option>
                      <option value="palenquera">Palenquera</option>
                      <option value="ninguno">Ninguno</option>
                    </select>
                    {grupoEtnico && grupoEtnico !== "ninguno" && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado de Pertenencia Étnica"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoEtnico", file)}
                          hint="Certificado de la autoridad competente"
                        />
                      </div>
                    )}
                  </div>

                  {/* 5. VÍCTIMA DEL CONFLICTO */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.esVictima")}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">5. Víctima del Conflicto:</span> ¿Está incluida en el RUV?
                      </span>
                    </label>
                    {esVictima && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado RUV"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoRUV", file)}
                          hint="Registro Único de Víctimas"
                        />
                      </div>
                    )}
                  </div>

                  {/* 6. CONSTRUCCIÓN DE PAZ */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.firmantePaz")}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">6. Construcción de Paz:</span> ¿Es firmante del acuerdo o en reincorporación?
                      </span>
                    </label>
                    {firmantePaz && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado de Construcción de Paz"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoPaz", file)}
                          hint="Documento que acredite su participación"
                        />
                      </div>
                    )}
                  </div>

                  {/* 7. PROTECCIÓN */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-pink-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.tieneProteccion")}
                        className="w-5 h-5 text-pink-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">7. Protección:</span> ¿Tiene medida de protección por violencia?
                      </span>
                    </label>
                    {tieneProteccion && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado de Protección"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoProteccion", file)}
                          hint="Medida de protección oficial"
                        />
                      </div>
                    )}
                  </div>

                  {/* 8. RURALIDAD */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.viveZonaRural")}
                        className="w-5 h-5 text-amber-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">8. Ruralidad:</span> ¿Vive en zona rural de Ciudad Bolívar?
                      </span>
                    </label>
                    {viveZonaRural && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado de Ruralidad"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoRuralidad", file)}
                          hint="Documento que certifique residencia rural"
                        />
                      </div>
                    )}
                  </div>

                  {/* 9. DIVERSIDAD SEXUAL */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-violet-500">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">9. Diversidad Sexual:</span> ¿Se identifica como mujer LGBTIQ+?
                    </label>
                    <select
                      {...register("calculadoraPuntaje.identidadLGBTIQ")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="lesbiana">Lesbiana</option>
                      <option value="bisexual">Bisexual</option>
                      <option value="transgenero">Transgénero</option>
                      <option value="queer">Queer</option>
                      <option value="no_binario">No Binario</option>
                      <option value="otro">Otro</option>
                      <option value="no">No</option>
                    </select>
                    {identidadLGBTIQ === "otro" && (
                      <input
                        type="text"
                        {...register("calculadoraPuntaje.identidadOtra")}
                        placeholder="Especifique"
                        className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                  </div>

                  {/* 10. POBLACIÓN MIGRANTE */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-cyan-500">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...register("calculadoraPuntaje.esMigrante")}
                        className="w-5 h-5 text-cyan-600 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <span className="font-bold">10. Población Migrante:</span> ¿Es migrante? (Requiere PPT)
                      </span>
                    </label>
                    {errors.calculadoraPuntaje?.esMigrante && (
                      <p className="mt-2 text-sm text-red-600">{errors.calculadoraPuntaje.esMigrante.message}</p>
                    )}
                    {esMigrante && (
                      <div className="mt-3">
                        <FileUpload
                          label="Certificado Migrante"
                          accept="image/*,.pdf"
                          onChange={(file) => setValue("calculadoraPuntaje.certificadoMigrante", file)}
                          hint="PPT u otro documento oficial"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 5: PERFIL SOCIOLABORAL */}
            {pasoActual === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel Educativo <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("perfilSociolaboral.nivelEducativo", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="primaria">Primaria</option>
                      <option value="bachiller">Bachiller</option>
                      <option value="tecnico">Técnico</option>
                      <option value="tecnologo">Tecnólogo</option>
                      <option value="profesional">Profesional</option>
                    </select>
                    {errors.perfilSociolaboral?.nivelEducativo && (
                      <p className="mt-1 text-sm text-red-600">{errors.perfilSociolaboral.nivelEducativo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situación Laboral Actual <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("perfilSociolaboral.situacionLaboral", { required: "Este campo es obligatorio" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="desempleada">Desempleada</option>
                      <option value="empleada_informal">Empleada Informal</option>
                      <option value="empleada_formal">Empleada Formal</option>
                      <option value="hogar">Hogar</option>
                    </select>
                    {errors.perfilSociolaboral?.situacionLaboral && (
                      <p className="mt-1 text-sm text-red-600">{errors.perfilSociolaboral.situacionLaboral.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <input
                        type="checkbox"
                        {...register("perfilSociolaboral.esJefaHogar")}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ¿Es usted madre cabeza de hogar?
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                      <input
                        type="checkbox"
                        {...register("perfilSociolaboral.tieneHijos")}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ¿Tiene hijos a cargo?
                      </span>
                    </label>
                  </div>

                  {watch("perfilSociolaboral.tieneHijos") && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Cuántos hijos tiene? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register("perfilSociolaboral.numeroHijos", { 
                          required: "Este campo es obligatorio",
                          min: { value: 1, message: "Debe ser al menos 1" }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.perfilSociolaboral?.numeroHijos && (
                        <p className="mt-1 text-sm text-red-600">{errors.perfilSociolaboral.numeroHijos.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 6: LEGAL Y CIERRE */}
            {pasoActual === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register("legalCierre.aceptaDeclaracion", { required: "Debe aceptar la declaración de veracidad" })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Declaración de Veracidad <span className="text-red-500">*</span>
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Declaro bajo gravedad de juramento que la información suministrada en este formulario es veraz, 
                        completa y verificable. Entiendo que cualquier falsedad en los datos proporcionados puede resultar 
                        en la exclusión del proceso de selección y/o la terminación de mi participación en el programa.
                      </p>
                    </div>
                  </label>
                  {errors.legalCierre?.aceptaDeclaracion && (
                    <p className="mt-2 text-sm text-red-600">{errors.legalCierre.aceptaDeclaracion.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register("legalCierre.aceptaAutorizacionDatos", { required: "Debe aceptar la autorización de datos" })}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Autorización de Tratamiento de Datos Personales <span className="text-red-500">*</span>
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Autorizo de manera libre, previa, expresa e informada el tratamiento de mis datos personales 
                        conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, para los fines relacionados con 
                        el proceso de inscripción, selección, caracterización y seguimiento del programa de formación.
                      </p>
                    </div>
                  </label>
                  {errors.legalCierre?.aceptaAutorizacionDatos && (
                    <p className="mt-2 text-sm text-red-600">{errors.legalCierre.aceptaAutorizacionDatos.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register("legalCierre.aceptaCompromiso", { required: "Debe aceptar el compromiso" })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Compromiso de Asistencia <span className="text-red-500">*</span>
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Me comprometo a asistir puntualmente a todas las sesiones de formación programadas, cumplir con 
                        las actividades asignadas y completar el programa satisfactoriamente. Entiendo que mi ausencia 
                        injustificada puede resultar en la pérdida de mi cupo.
                      </p>
                    </div>
                  </label>
                  {errors.legalCierre?.aceptaCompromiso && (
                    <p className="mt-2 text-sm text-red-600">{errors.legalCierre.aceptaCompromiso.message}</p>
                  )}
                </div>

                <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center">
                  <p className="text-lg font-semibold text-gray-700">
                    🎉 ¡Estás a punto de completar tu inscripción!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Revisa que toda la información sea correcta antes de enviar.
                  </p>
                </div>

                {/* Mensaje de error si existe */}
                {errorEnvio && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-red-500 text-xl">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">Error al enviar</p>
                        <p className="text-sm text-red-600 mt-1">{errorEnvio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* reCAPTCHA */}
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-sm text-gray-700 mb-4 font-medium">
                    Verificación de seguridad <span className="text-red-500">*</span>
                  </p>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                    onErrored={() => setRecaptchaToken(null)}
                    theme="light"
                    size="normal"
                  />
                  {!recaptchaToken && !enviando && (
                    <p className="mt-2 text-sm text-gray-500">
                      Completa la verificación para poder enviar el formulario
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botones de Navegación */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={pasoAnterior}
              disabled={pasoActual === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Anterior
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Paso {pasoActual} de {PASOS.length}
              </p>
            </div>

            {pasoActual < PASOS.length ? (
              <button
                type="button"
                onClick={siguientePaso}
                disabled={bloqueado || !pasoActualCompleto}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                disabled={bloqueado || !pasoActualCompleto || !recaptchaToken || enviando}
                className="px-8 py-3 bg-linear-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg"
              >
                {enviando ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>✓ Enviar Inscripción</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}