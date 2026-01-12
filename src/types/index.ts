// Enums
export type TipoDocumento = "C.C." | "T.I." | "PPT" | "C.E.";
export type LineaFormacion = "emprendimiento" | "conduccion" | "vigilancia" | "cuidado_estetico";
export type EstadoEmprendimiento = "idea" | "en_marcha" | "liderazgo_comunitario";
export type AprendizajeConduccion = "curso" | "empirico";
export type RegimenSalud = "subsidiado" | "contributivo_beneficiaria" | "contributivo_cotizante" | "no_afiliada";
export type TipoCuidado = "remunerado" | "no_remunerado" | "familiar";
export type GrupoEtnico = "indigena" | "afrocolombiana" | "raizal" | "palenquera" | "ninguno";
export type IdentidadLGBTIQ = 
  | "lesbiana" 
  | "gay" 
  | "bisexual" 
  | "transgenero" 
  | "intersexual" 
  | "queer" 
  | "pansexual" 
  | "asexual" 
  | "no_binario" 
  | "genero_fluido" 
  | "dos_espiritus" 
  | "agenero" 
  | "demisexual" 
  | "otro"
  | "no";
export type NivelEducativo = "primaria" | "bachiller" | "tecnico" | "tecnologo" | "profesional";
export type SituacionLaboral = "desempleada" | "empleada_informal" | "empleada_formal" | "hogar";

// Interfaces para subsecciones
export interface DatosIdentificacion {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefonoPrincipal: string;
  telefonoSecundario: string;
  correoElectronico: string;
}

export interface UbicacionTerritorial {
  direccion: string;
  barrio: string;
  upz_upl: string;
  resideCiudadBolivar: boolean;
  reciboPublico: File | null;
}

export interface SeleccionComponente {
  lineaFormacion: LineaFormacion | "";
  
  // Emprendimiento
  tieneNegocio?: "activo" | "idea";
  estadoEmprendimiento?: EstadoEmprendimiento;
  perteneceOrganizacion?: boolean;
  nombreOrganizacion?: string;
  emprendimientoDomiciliadoCB?: boolean;
  
  // Conducción
  sabeConducir?: boolean;
  comoAprendioConducir?: AprendizajeConduccion;
  tieneLicencia?: boolean;
  
  // Vigilancia
  tieneAntecedentes?: boolean;
  
  // Cuidado Estético
  ultimoGradoEscolar?: string;
}

export interface PersonaCuidado {
  nombres: string;
  apellidos: string;
  identificacion: string;
  telefono: string;
}

export interface CalculadoraPuntaje {
  // Salud (1 punto)
  regimenSalud: RegimenSalud | "";
  certificadoAdres: File | null;
  
  // Rol de Cuidado (1 punto)
  esCuidadora: boolean;
  tipoCuidado?: TipoCuidado;
  personaCuidada?: PersonaCuidado;
  certificadoCuidado?: File | null;
  
  // Discapacidad (1 punto)
  tieneDiscapacidad: boolean;
  certificadoDiscapacidad?: File | null;
  
  // Pertenencia Étnica (1 punto)
  grupoEtnico: GrupoEtnico | "";
  certificadoEtnico?: File | null;
  
  // Víctima del Conflicto (1 punto)
  esVictima: boolean;
  certificadoRUV?: File | null;
  
  // Construcción de Paz (1 punto)
  firmantePaz: boolean;
  certificadoPaz?: File | null;
  
  // Protección (1 punto)
  tieneProteccion: boolean;
  certificadoProteccion?: File | null;
  
  // Ruralidad (1 punto)
  viveZonaRural: boolean;
  certificadoRuralidad?: File | null;
  
  // Diversidad Sexual (1 punto)
  identidadLGBTIQ: IdentidadLGBTIQ | "";
  identidadOtra?: string;
  
  // Población Migrante (1 punto)
  esMigrante: boolean;
  certificadoMigrante?: File | null;
  
  // Puntaje calculado
  puntajeTotal?: number;
}

export interface PerfilSociolaboral {
  nivelEducativo: NivelEducativo | "";
  situacionLaboral: SituacionLaboral | "";
  esJefaHogar: boolean;
  tieneHijos: boolean;
  numeroHijos?: number;
}

export interface LegalCierre {
  aceptaDeclaracion: boolean;
  aceptaAutorizacionDatos: boolean;
  aceptaCompromiso: boolean;
}

// Interfaz principal del formulario
export interface FormularioInscripcion {
  // Sección I
  datosIdentificacion: DatosIdentificacion;
  
  // Sección II
  ubicacionTerritorial: UbicacionTerritorial;
  
  // Sección III
  seleccionComponente: SeleccionComponente;
  
  // Sección IV
  calculadoraPuntaje: CalculadoraPuntaje;
  
  // Sección V
  perfilSociolaboral: PerfilSociolaboral;
  
  // Sección VI
  legalCierre: LegalCierre;
}