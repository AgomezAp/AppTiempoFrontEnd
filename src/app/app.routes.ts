import { Routes } from '@angular/router';
import { tRolGuard } from './utils/t-rol.guard';

export const routes: Routes = [
  // ==================== AUTENTICACIÓN (público) ====================
  { path: '', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'logIn', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./components/sign-in/sign-in.component').then(m => m.SignInComponent) },
  { path: 'reestablecerContraseña', loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // ==================== PÁGINAS DE ERROR ====================
  { path: 'errorPage', loadComponent: () => import('./components/error-page/error-page.component').then(m => m.ErrorPageComponent) },
  { path: 'access-denied', loadComponent: () => import('./components/acces-denied/acces-denied.component').then(m => m.AccesDeniedComponent) },

  // ==================== RUTAS PÚBLICAS (firma por token — sin guard) ====================
  { path: 'firmar-asistencia/:token', loadComponent: () => import('./components/firmar-asistencia/firmar-asistencia.component').then(m => m.FirmarAsistenciaComponent) },
  { path: 'firmar-acta/:token', loadComponent: () => import('./components/firmar-acta/firmar-acta.component').then(m => m.FirmarActaComponent) },
  { path: 'firmar-epp/:token', loadComponent: () => import('./components/ssgt-epp-firmar/ssgt-epp-firmar.component').then(m => m.SsgtEppFirmarComponent) },
  { path: 'firmar-documento/:token', loadComponent: () => import('./components/ssgt-documento-firmar/ssgt-documento-firmar.component').then(m => m.SsgtDocumentoFirmarComponent) },
  { path: 'inspeccion-movil/:token', loadComponent: () => import('./components/ssgt-inspeccion-movil/ssgt-inspeccion-movil.component').then(m => m.SsgtInspeccionMovilComponent) },

  // ==================== RUTAS PÚBLICAS — INVENTARIO (firma por token desde correo) ====================
  { path: 'firmar/:token', loadComponent: () => import('./components/inventario/firma-externa/firma-externa.component').then(m => m.FirmaExternaComponent) },
  { path: 'firmar-devolucion/:token', loadComponent: () => import('./components/inventario/firma-devolucion/firma-devolucion.component').then(m => m.FirmaDevolucionComponent) },
  { path: 'firmar-mobiliario/:token', loadComponent: () => import('./components/inventario/firma-mobiliario/firma-mobiliario.component').then(m => m.FirmaMobiliarioComponent) },
  { path: 'firmar-consumible/:token', loadComponent: () => import('./components/inventario/firma-consumible/firma-consumible.component').then(m => m.FirmaConsumibleComponent) },

  // ==================== HORAS Y REGISTRO ====================
  { path: 'dashBoard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'horas' } },
  { path: 'horas', loadComponent: () => import('./components/horas/horas.component').then(m => m.HorasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },
  { path: 'horas/:id', loadComponent: () => import('./components/horas/horas.component').then(m => m.HorasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'horas' } },
  { path: 'editar-salida/:id/:fecha', loadComponent: () => import('./components/edit-salida/edit-salida.component').then(m => m.EditSalidaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },
  { path: 'editar-entrada/:id/:fecha', loadComponent: () => import('./components/edit-salida/edit-salida.component').then(m => m.EditSalidaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },
  { path: 'nuevoRegistro', loadComponent: () => import('./components/nuevo-registro/nuevo-registro.component').then(m => m.NuevoRegistroComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },
  { path: 'informes', loadComponent: () => import('./components/informes/informes.component').then(m => m.InformesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },
  { path: 'extras', loadComponent: () => import('./components/extra-list/extra-list.component').then(m => m.ExtraListComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'horas' } },
  { path: 'ausentismo', loadComponent: () => import('./components/ausentismo/ausentismo.component').then(m => m.AusentismoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'horas' } },
  { path: 'mantenimiento', loadComponent: () => import('./components/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'horas' } },

  // ==================== NOVEDADES ====================
  { path: 'novedad', loadComponent: () => import('./components/novedades/novedades.component').then(m => m.NovedadComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'novedades' } },
  { path: 'verNovedad', loadComponent: () => import('./components/ver-novedad/ver-novedad.component').then(m => m.VerNovedadComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'novedades' } },

  // ==================== USUARIOS Y PERMISOS ====================
  { path: 'permisos', loadComponent: () => import('./components/permiso/permiso.component').then(m => m.PermisoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'permisos' } },
  { path: 'admin', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'usuarios' } },
  { path: 'admin-roles', loadComponent: () => import('./components/admin-roles/admin-roles.component').then(m => m.AdminRolesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'admin_roles' } },
  { path: 'admin-destinatarios', loadComponent: () => import('./components/admin-destinatarios/admin-destinatarios.component').then(m => m.AdminDestinatariosComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  { path: 'admin-permisos-config', loadComponent: () => import('./components/admin-permisos-config/admin-permisos-config.component').then(m => m.AdminPermisosConfigComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  { path: 'admin-certificados', loadComponent: () => import('./components/admin-certificados/admin-certificados.component').then(m => m.AdminCertificadosComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  { path: 'admin-inventarios', loadComponent: () => import('./components/admin-inventarios/admin-inventarios.component').then(m => m.AdminInventariosComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  { path: 'mi-inventario', loadComponent: () => import('./components/mi-inventario/mi-inventario.component').then(m => m.MiInventarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } },

  // ==================== RECURSOS / DOCUMENTOS ====================
  { path: 'gestion-archivos', loadComponent: () => import('./components/gestion-archivos/gestion-archivos.component').then(m => m.GestionArchivosComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'recursos' } },
  { path: 'mi-certificado', loadComponent: () => import('./components/certificado-laboral/certificado-laboral.component').then(m => m.CertificadoLaboralComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'recursos' } },
  { path: 'configuracion-nomina', loadComponent: () => import('./components/configuracion-nomina/configuracion-nomina.component').then(m => m.ConfiguracionNominaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'usuarios' } },
  { path: 'configuracion-horario', loadComponent: () => import('./components/configuracion-horario/configuracion-horario.component').then(m => m.ConfiguracionHorarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'horas' } },
  { path: 'compensacion-horas', loadComponent: () => import('./components/compensacion-horas/compensacion-horas.component').then(m => m.CompensacionHorasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'recursos' } },
  { path: 'reservas', loadComponent: () => import('./components/reservas/reservas.component').then(m => m.ReservasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'recursos' } },
  { path: 'subirArchivo', loadComponent: () => import('./components/upload/upload.component').then(m => m.UploadComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'horas' } },

  // ==================== ASISTENCIA Y ACTAS ====================
  { path: 'registro-asistencia', loadComponent: () => import('./components/registro-asistencia/registro-asistencia.component').then(m => m.RegistroAsistenciaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'actas-recargas', loadComponent: () => import('./components/actas-recargas/actas-recargas.component').then(m => m.ActasRecargasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'recursos' } },

  // ==================== SSGT ====================
  { path: 'ssgt-dashboard', loadComponent: () => import('./components/ssgt-dashboard/ssgt-dashboard.component').then(m => m.SsgtDashboardComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'ssgt-accidentes', loadComponent: () => import('./components/ssgt-accidentes/ssgt-accidentes.component').then(m => m.SsgtAccidentesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'ssgt-epp-catalogo', loadComponent: () => import('./components/ssgt-epp-catalogo/ssgt-epp-catalogo.component').then(m => m.SsgtEppCatalogoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'ssgt-epp-entregas', loadComponent: () => import('./components/ssgt-epp-entregas/ssgt-epp-entregas.component').then(m => m.SsgtEppEntregasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'ssgt-documentos-firma', loadComponent: () => import('./components/ssgt-documentos-firma/ssgt-documentos-firma.component').then(m => m.SsgtDocumentosFirmaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'ssgt' } },
  { path: 'ssgt-inspecciones', loadComponent: () => import('./components/ssgt-inspecciones/ssgt-inspecciones.component').then(m => m.SsgtInspeccionesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },
  { path: 'ssgt-evaluacion/:id', loadComponent: () => import('./components/ssgt-evaluacion/ssgt-evaluacion.component').then(m => m.SsgtEvaluacionComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'ssgt' } },

  // ==================== WHATSAPP ====================
  { path: 'whatsapp', loadComponent: () => import('./components/whatsapp-config/whatsapp-config.component').then(m => m.WhatsappConfigComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },

  // ==================== NUEVOS MÓDULOS RRHH ====================
  { path: 'contratos', loadComponent: () => import('./components/contratos/contratos.component').then(m => m.ContratosComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'rrhh_contratos' } },
  { path: 'expedientes', loadComponent: () => import('./components/expedientes/expedientes.component').then(m => m.ExpedientesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin'], modulo: 'rrhh_hoja_vida' } },
  { path: 'hoja-vida/:uid', loadComponent: () => import('./components/hoja-vida/hoja-vida.component').then(m => m.HojaVidaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'], modulo: 'rrhh_hoja_vida' } },
  { path: 'evaluaciones', loadComponent: () => import('./components/evaluaciones/evaluaciones.component').then(m => m.EvaluacionesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'rrhh_evaluaciones' } },
  { path: 'evaluaciones/:id', loadComponent: () => import('./components/evaluaciones/evaluaciones.component').then(m => m.EvaluacionesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'rrhh_evaluaciones' } },

  // ==================== INVENTARIO — DISPOSITIVOS ====================
  { path: 'inventario', loadComponent: () => import('./components/inventario/inventario/inventario.component').then(m => m.InventarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'agregar-dispositivo', loadComponent: () => import('./components/inventario/agregar-dispositivo/agregar-dispositivo.component').then(m => m.AgregarDispositivoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'crear-acta', loadComponent: () => import('./components/inventario/crear-acta/crear-acta.component').then(m => m.CrearActaComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'actas', loadComponent: () => import('./components/inventario/actas/actas.component').then(m => m.ActasComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'trazabilidad/:id', loadComponent: () => import('./components/inventario/trazabilidad/trazabilidad.component').then(m => m.TrazabilidadComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'dispositivo/:id', loadComponent: () => import('./components/inventario/detalle-dispositivo/detalle-dispositivo.component').then(m => m.DetalleDispositivoComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },

  // ==================== INVENTARIO — DEVOLUCIONES ====================
  { path: 'acta-devolucion', loadComponent: () => import('./components/inventario/acta-devolucion/acta-devolucion.component').then(m => m.ActaDevolucionComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'crear-devolucion', loadComponent: () => import('./components/inventario/crear-devolucion/crear-devolucion.component').then(m => m.CrearDevolucionComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },
  { path: 'actas-devolucion', loadComponent: () => import('./components/inventario/actas-devolucion/actas-devolucion.component').then(m => m.ActasDevolucionComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_dispositivos' } },

  // ==================== INVENTARIO — MOBILIARIO ====================
  { path: 'inventario-mobiliario', loadComponent: () => import('./components/inventario/inventario-mobiliario/inventario-mobiliario.component').then(m => m.InventarioMobiliarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_mobiliario' } },
  { path: 'agregar-mobiliario', loadComponent: () => import('./components/inventario/agregar-mobiliario/agregar-mobiliario.component').then(m => m.AgregarMobiliarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_mobiliario' } },
  { path: 'crear-acta-mobiliario', loadComponent: () => import('./components/inventario/crear-acta-mobiliario/crear-acta-mobiliario.component').then(m => m.CrearActaMobiliarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_mobiliario' } },
  { path: 'actas-mobiliario', loadComponent: () => import('./components/inventario/actas-mobiliario/actas-mobiliario.component').then(m => m.ActasMobiliarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_mobiliario' } },
  { path: 'mobiliario/:id', loadComponent: () => import('./components/inventario/inventario-mobiliario/inventario-mobiliario.component').then(m => m.InventarioMobiliarioComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], modulo: 'inventario_mobiliario' } },

  // ==================== INVENTARIO — CONSUMIBLES ====================
  { path: 'inventario-aseo', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'aseo', modulo: 'inventario_aseo' } },
  { path: 'inventario-papeleria', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'papeleria', modulo: 'inventario_papeleria' } },
  { path: 'inventario-botiquin', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'botiquin', modulo: 'inventario_botiquin' } },
  { path: 'inventario-dotacion', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'dotacion', modulo: 'inventario_dotacion' } },
  { path: 'inventario-desechables', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'desechables', modulo: 'inventario_desechables' } },
  { path: 'inventario-herramientas', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipoInventario: 'herramientas', modulo: 'inventario_herramientas' } },
  { path: 'inventario-consumible/:codigo', loadComponent: () => import('./components/inventario/inventario-consumibles/inventario-consumibles.component').then(m => m.InventarioConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } },
  { path: 'agregar-consumible/:tipo', loadComponent: () => import('./components/inventario/agregar-consumible/agregar-consumible.component').then(m => m.AgregarConsumibleComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } },

  // ==================== INVENTARIO — ACTAS CONSUMIBLES ====================
  { path: 'actas-aseo', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'aseo', modulo: 'inventario_aseo' } },
  { path: 'actas-papeleria', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'papeleria', modulo: 'inventario_papeleria' } },
  { path: 'actas-botiquin', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'botiquin', modulo: 'inventario_botiquin' } },
  { path: 'actas-dotacion', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'dotacion', modulo: 'inventario_dotacion' } },
  { path: 'actas-desechables', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'desechables', modulo: 'inventario_desechables' } },
  { path: 'actas-herramientas', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'], tipo: 'herramientas', modulo: 'inventario_herramientas' } },
  { path: 'crear-acta-consumible/:tipo', loadComponent: () => import('./components/inventario/crear-acta-consumible/crear-acta-consumible.component').then(m => m.CrearActaConsumibleComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } },
  { path: 'actas-consumible/:codigo', loadComponent: () => import('./components/inventario/actas-consumibles/actas-consumibles.component').then(m => m.ActasConsumiblesComponent), canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } },

  // ==================== FALLBACK ====================
  { path: '**', loadComponent: () => import('./components/error-page/error-page.component').then(m => m.ErrorPageComponent) }
];
