import { Routes } from '@angular/router';

import {
  AccesDeniedComponent,
} from './components/acces-denied/acces-denied.component';

import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {
  ErrorPageComponent,
} from './components/error-page/error-page.component';
import { HorasComponent } from './components/horas/horas.component';
import { LoginComponent } from './components/login/login.component';
import {
  MantenimientoComponent,
} from './components/mantenimiento/mantenimiento.component';
import { PermisoComponent } from './components/permiso/permiso.component';
import {
  ResetPasswordComponent,
} from './components/reset-password/reset-password.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { UploadComponent } from './components/upload/upload.component';
import { tRolGuard } from './utils/t-rol.guard';
import { EditSalidaComponent } from './components/edit-salida/edit-salida.component';
import { InformesComponent } from './components/informes/informes.component';
import { NovedadComponent } from './components/novedades/novedades.component';
import { VerNovedadComponent } from './components/ver-novedad/ver-novedad.component'
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
import { ExtraListComponent } from './components/extra-list/extra-list.component';
import { AusentismoComponent } from './components/ausentismo/ausentismo.component';
import { GestionArchivosComponent } from './components/gestion-archivos/gestion-archivos.component';
import { CertificadoLaboralComponent } from './components/certificado-laboral/certificado-laboral.component';
import { ConfiguracionNominaComponent } from './components/configuracion-nomina/configuracion-nomina.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { RegistroAsistenciaComponent } from './components/registro-asistencia/registro-asistencia.component';
import { FirmarAsistenciaComponent } from './components/firmar-asistencia/firmar-asistencia.component';
import { ActasRecargasComponent } from './components/actas-recargas/actas-recargas.component';
import { FirmarActaComponent } from './components/firmar-acta/firmar-acta.component';
import { SsgtAccidentesComponent } from './components/ssgt-accidentes/ssgt-accidentes.component';
import { SsgtDashboardComponent } from './components/ssgt-dashboard/ssgt-dashboard.component';
import { SsgtEppCatalogoComponent } from './components/ssgt-epp-catalogo/ssgt-epp-catalogo.component';
import { SsgtEppEntregasComponent } from './components/ssgt-epp-entregas/ssgt-epp-entregas.component';
import { SsgtEppFirmarComponent } from './components/ssgt-epp-firmar/ssgt-epp-firmar.component';
import { SsgtDocumentosFirmaComponent } from './components/ssgt-documentos-firma/ssgt-documentos-firma.component';
import { SsgtDocumentoFirmarComponent } from './components/ssgt-documento-firmar/ssgt-documento-firmar.component';
import { SsgtInspeccionesComponent } from './components/ssgt-inspecciones/ssgt-inspecciones.component';
import { SsgtCapacitacionesComponent } from './components/ssgt-capacitaciones/ssgt-capacitaciones.component';
import { SsgtEvaluacionComponent } from './components/ssgt-evaluacion/ssgt-evaluacion.component';
import { WhatsappConfigComponent } from './components/whatsapp-config/whatsapp-config.component';

export const routes: Routes = [
  {
    path: '', component: LoginComponent
  },
  {
    path: 'logIn', component: LoginComponent
  },
  {
    path: 'signup', component: SignInComponent
  },
  {
    path: 'reestablecerContraseña', component: ResetPasswordComponent
  },
  {
    path: 'dashBoard', component: DashboardComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] }
  },
  {
    path: 'mantenimiento', component: MantenimientoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User','Tecnologia'] }
  },
  {
    path: 'errorPage', component: ErrorPageComponent
  },
  {
    path: 'horas', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } 
  },
  {
    path: 'horas/:id', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] } 
  },
  {
    path: 'horas/:fecha', component: HorasComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } 
  },
  {
    path: 'editar-salida/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }
  },
  {
    path: 'editar-entrada/:id/:fecha', component: EditSalidaComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'nuevoRegistro', component: NuevoRegistroComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'informes', component: InformesComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] }
  },
  {
    path: 'novedad', component: NovedadComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'verNovedad', component: VerNovedadComponent, canActivate: [tRolGuard], data: {allowedRoles: ['Admin', 'Tecnologia']}
  },
  {
    path: 'access-denied', component: AccesDeniedComponent,canActivate: [tRolGuard], data: { allowedRoles: ['Admin','User', 'Tecnologia'] }  // Página de acceso denegado
  },

  { 
    path: 'subirArchivo', component: UploadComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'Tecnologia'] } // Página para subir archivos
  },
  {
    path: 'extras', component: ExtraListComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin']} //Pagina para ver las horas extras
  },
    {
      path: 'ausentismo', component: AusentismoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] }
    },
  { path: 'permisos', component: PermisoComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } },
  { path: 'admin', component: AdminComponent, canActivate: [tRolGuard], data: { allowedRoles: ['Admin'] } },
  
  // Nuevas rutas para gestión de archivos y certificados
  { 
    path: 'gestion-archivos', 
    component: GestionArchivosComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  { 
    path: 'mi-certificado', 
    component: CertificadoLaboralComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  { 
    path: 'configuracion-nomina', 
    component: ConfiguracionNominaComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin'] } 
  },
  { 
    path: 'reservas', 
    component: ReservasComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  
  // Rutas de Registro de Asistencia
  { 
    path: 'registro-asistencia', 
    component: RegistroAsistenciaComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin'] } 
  },
  // Ruta pública para firmar (sin guard)
  { 
    path: 'firmar-asistencia/:token', 
    component: FirmarAsistenciaComponent
  },
  
  // Actas de Recargas
  { 
    path: 'actas-recargas', 
    component: ActasRecargasComponent, 
    canActivate: [tRolGuard], 
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] } 
  },
  // Ruta pública para firmar acta de recarga (sin guard)
  {
    path: 'firmar-acta/:token',
    component: FirmarActaComponent
  },

  // SSGT - Seguridad y Salud en el Trabajo
  {
    path: 'ssgt-dashboard',
    component: SsgtDashboardComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },
  {
    path: 'ssgt-accidentes',
    component: SsgtAccidentesComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },

  // SSGT - EPP (Elementos de Protección Personal)
  {
    path: 'ssgt-epp-catalogo',
    component: SsgtEppCatalogoComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },
  {
    path: 'ssgt-epp-entregas',
    component: SsgtEppEntregasComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },
  // Ruta pública para firmar entrega EPP (sin guard)
  {
    path: 'firmar-epp/:token',
    component: SsgtEppFirmarComponent
  },

  // SSGT - Documentos para Firmar
  {
    path: 'ssgt-documentos-firma',
    component: SsgtDocumentosFirmaComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin', 'User', 'Tecnologia'] }
  },
  // Ruta pública para firmar documento (sin guard)
  {
    path: 'firmar-documento/:token',
    component: SsgtDocumentoFirmarComponent
  },

  // SSGT - Inspecciones y Riesgos
  {
    path: 'ssgt-inspecciones',
    component: SsgtInspeccionesComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },

  // SSGT - Capacitaciones SST
  {
    path: 'ssgt-capacitaciones',
    component: SsgtCapacitacionesComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },
  {
    path: 'ssgt-evaluacion/:id',
    component: SsgtEvaluacionComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },

  // WhatsApp
  {
    path: 'whatsapp',
    component: WhatsappConfigComponent,
    canActivate: [tRolGuard],
    data: { allowedRoles: ['Admin'] }
  },

  { path: '**', component: ErrorPageComponent },
];