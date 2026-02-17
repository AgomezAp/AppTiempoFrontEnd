import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActaRecargaService } from '../../services/acta-recarga.service';
import { UserService } from '../../services/user.service';
import {
  ActaRecarga,
  ActaRecargaAcceso,
  UsuarioActa,
  MiAccesoResponse,
} from '../../interfaces/acta-recarga';
import { UResponse } from '../../interfaces/user';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-actas-recargas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './actas-recargas.component.html',
  styleUrl: './actas-recargas.component.css',
})
export class ActasRecargasComponent implements OnInit {
  // Estados
  loading = true;
  loadingAccesos = false;
  loadingUsuarios = false;
  enviando = false;
  guardando = false;

  // Acceso
  miAcceso: MiAccesoResponse | null = null;
  sinAcceso = false;

  // Listas
  actas: ActaRecarga[] = [];
  accesos: ActaRecargaAcceso[] = [];
  todosLosUsuarios: UResponse[] = [];
  usuariosDisponibles: UsuarioActa[] = [];

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalActas = 0;
  limite = 10;

  // Filtros
  filtroAnio: number = new Date().getFullYear();
  filtroEstado: string = '';

  // Modales
  mostrarModalCrear = false;
  mostrarModalVer = false;
  mostrarModalAccesos = false;
  mostrarModalAgregarAcceso = false;

  // Formularios
  formCrear: FormGroup;
  formAcceso: FormGroup;

  // Acta seleccionada
  actaSeleccionada: ActaRecarga | null = null;

  // Para el PDF
  generandoPdf = false;

  // Firma del emisor
  tipoFirmaEmisor: 'texto' | 'imagen' = 'texto';
  firmaEmisorImagenPreview: string | null = null;
  firmaEmisorImagenBase64: string | null = null;

  // Firma del emisor (crear/editar acta)
  @ViewChild('firmaCanvasCrear') firmaCanvasCrear?: ElementRef<HTMLCanvasElement>;
  firmaEmisorCrearTipo: 'dibujo' | 'imagen' | 'texto' = 'dibujo';
  firmaEmisorTextoCrear: string = '';
  firmaEmisorImagenBase64Crear: string | null = null;
  firmaEmisorArchivoNombreCrear: string | null = null;
  firmaEmisorArchivoTipoCrear: string | null = null;
  private firmaCanvasCtxCrear: CanvasRenderingContext2D | null = null;
  private firmaDibujandoCrear = false;
  private firmaCanvasVacioCrear = true;

  // Usuario actual
  usuarioActualId: number = 0;

  constructor(
    private actaService: ActaRecargaService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.formCrear = this.fb.group({
      periodoInicio: ['', Validators.required],
      periodoFin: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
      totalRequeridoProyectado: [null, [Validators.min(0)]],
      totalIngresadoTarjetas: [null, [Validators.min(0)]],
      totalRecargadoGoogleAds: [null, [Validators.min(0)]],
      totalReportadoFormularios: [null, [Validators.min(0)]],
      firmaEmisor: [''],
      firmaEmisorImagen: [''],
      revisorId: [null, Validators.required],
    });

    this.formAcceso = this.fb.group({
      usuarioId: [null, Validators.required],
      puedeVer: [true],
      puedeEditar: [false],
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.verificarAcceso();
  }

  obtenerUsuarioActual(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioActualId = payload.Uid || 0;
      } catch (e) {
        console.error('Error al decodificar token', e);
      }
    }
  }

  verificarAcceso(): void {
    this.actaService.verificarMiAcceso().subscribe({
      next: (res) => {
        this.miAcceso = res;
        if (res.tieneAcceso) {
          this.cargarActas();
          this.cargarUsuariosDisponibles();
          if (res.esAdmin) {
            this.cargarTodosLosUsuarios();
          }
        } else {
          this.sinAcceso = true;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al verificar acceso:', err);
        this.sinAcceso = true;
        this.loading = false;
      },
    });
  }

  cargarActas(): void {
    this.loading = true;
    const params: any = {
      page: this.paginaActual,
      limit: this.limite,
    };
    if (this.filtroAnio) params.anio = this.filtroAnio;
    if (this.filtroEstado) params.estado = this.filtroEstado;

    this.actaService.getActas(params).subscribe({
      next: (res) => {
        this.actas = res.actas;
        this.totalActas = res.pagination.total;
        this.totalPaginas = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar actas:', err);
        this.loading = false;
      },
    });
  }

  cargarUsuariosDisponibles(): void {
    this.actaService.getUsuariosDisponibles().subscribe({
      next: (res) => {
        this.usuariosDisponibles = res.usuarios;
      },
      error: (err) => console.error('Error al cargar usuarios disponibles:', err),
    });
  }

  cargarTodosLosUsuarios(): void {
    this.loadingUsuarios = true;
    this.userService.getAllUsers().subscribe({
      next: (res: UResponse[]) => {
        this.todosLosUsuarios = res.filter(u => u.status === 1);
        this.loadingUsuarios = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loadingUsuarios = false;
      },
    });
  }

  cargarAccesos(): void {
    this.loadingAccesos = true;
    this.actaService.getUsuariosConAcceso().subscribe({
      next: (res) => {
        this.accesos = res.accesos;
        this.loadingAccesos = false;
      },
      error: (err) => {
        console.error('Error al cargar accesos:', err);
        this.loadingAccesos = false;
      },
    });
  }

  // ==================== ACCIONES ====================

  abrirModalCrear(): void {
    this.formCrear.reset({
      anio: new Date().getFullYear(),
      puedeVer: true,
      puedeEditar: false,
    });
    this.mostrarModalCrear = true;
    this.resetFirmaEmisorCrear();
    setTimeout(() => this.prepararCanvasFirmaEmisorCrear(), 0);
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.formCrear.reset();
    this.resetFirmaEmisorCrear();
  }

  crearActa(): void {
    if (this.formCrear.invalid) return;

    const firmaTexto = this.firmaEmisorCrearTipo === 'texto' ? this.firmaEmisorTextoCrear.trim() : '';
    const firmaImagen = this.firmaEmisorCrearTipo !== 'texto' ? this.firmaEmisorImagenBase64Crear : null;
    if (!firmaTexto && !firmaImagen) {
      alert('Debe firmar el acta antes de crearla');
      return;
    }

    this.formCrear.patchValue({
      firmaEmisor: firmaTexto || null,
      firmaEmisorImagen: firmaImagen || null,
    });

    const rawCrear = this.formCrear.value;
    const payloadCrear = {
      ...rawCrear,
      totalRequeridoProyectado: this.parseMonto(rawCrear.totalRequeridoProyectado),
      totalIngresadoTarjetas: this.parseMonto(rawCrear.totalIngresadoTarjetas),
      totalRecargadoGoogleAds: this.parseMonto(rawCrear.totalRecargadoGoogleAds),
      totalReportadoFormularios: this.parseMonto(rawCrear.totalReportadoFormularios),
    };

    this.guardando = true;
    this.actaService.crearActa(payloadCrear).subscribe({
      next: (res) => {
        console.log('Acta creada:', res);
        const actaCreada = res.acta;
        
        // Si tiene al menos un monto, enviar automáticamente para revisión
        const tieneMonto = actaCreada.totalRequeridoProyectado || actaCreada.totalIngresadoTarjetas || 
                          actaCreada.totalRecargadoGoogleAds || actaCreada.totalReportadoFormularios;
        
        if (tieneMonto) {
          console.log('Enviando acta para revisión automáticamente...');
          // Enviar con firma automática (nombre del emisor)
          const firmaAuto = firmaTexto || `${actaCreada.emisor?.name || ''} ${actaCreada.emisor?.lastName || ''}`.trim() || 'Emisor';
          const firmaImagenAuto = firmaImagen || actaCreada.firmaEmisorImagen || undefined;
          this.actaService.enviarActaParaRevision(actaCreada.id, firmaAuto, firmaImagenAuto).subscribe({
            next: (envioRes) => {
              this.guardando = false;
              this.cerrarModalCrear();
              this.cargarActas();
              alert('Acta creada y enviada al revisor exitosamente. Se ha enviado un correo electrónico.');
            },
            error: (envioErr) => {
              this.guardando = false;
              this.cerrarModalCrear();
              this.cargarActas();
              console.error('Error al enviar email:', envioErr);
              alert('Acta creada, pero hubo un error al enviar el correo al revisor.');
            }
          });
        } else {
          this.guardando = false;
          this.cerrarModalCrear();
          this.cargarActas();
          alert('Acta creada como borrador. Agregue montos y envíe para revisión.');
        }
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.msg || 'Error al crear acta');
      },
    });
  }

  verActa(acta: ActaRecarga): void {
    this.actaSeleccionada = acta;
    this.mostrarModalVer = true;
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.actaSeleccionada = null;
  }

  // ==================== FIRMA EMISOR ====================

  mostrarModalFirmaEmisor = false;
  actaParaFirmar: ActaRecarga | null = null;
  firmaEmisorTexto: string = '';

  abrirModalFirmaEmisor(acta: ActaRecarga): void {
    if (!acta.totalRequeridoProyectado && !acta.totalIngresadoTarjetas && !acta.totalRecargadoGoogleAds && !acta.totalReportadoFormularios) {
      alert('Debe ingresar al menos un monto antes de enviar');
      return;
    }
    this.actaParaFirmar = acta;
    this.tipoFirmaEmisor = 'texto';
    this.firmaEmisorTexto = '';
    this.firmaEmisorImagenPreview = null;
    this.firmaEmisorImagenBase64 = null;
    this.mostrarModalFirmaEmisor = true;
  }

  cerrarModalFirmaEmisor(): void {
    this.mostrarModalFirmaEmisor = false;
    this.actaParaFirmar = null;
  }

  onFirmaEmisorImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.firmaEmisorImagenBase64 = reader.result as string;
      this.firmaEmisorImagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  confirmarEnvioActa(): void {
    if (!this.actaParaFirmar) return;

    const firmaTexto = this.tipoFirmaEmisor === 'texto' ? this.firmaEmisorTexto.trim() : undefined;
    const firmaImagen = this.tipoFirmaEmisor === 'imagen' ? this.firmaEmisorImagenBase64 : undefined;

    if (!firmaTexto && !firmaImagen) {
      alert('Debe proporcionar su firma (nombre o imagen)');
      return;
    }

    this.enviando = true;
    this.actaService.enviarActaParaRevision(
      this.actaParaFirmar.id,
      firmaTexto || undefined,
      firmaImagen || undefined
    ).subscribe({
      next: (res) => {
        this.enviando = false;
        this.cerrarModalFirmaEmisor();
        this.cargarActas();
        alert(res.msg || 'Acta enviada para revisión');
      },
      error: (err) => {
        this.enviando = false;
        alert(err.error?.msg || 'Error al enviar acta');
      },
    });
  }

  editarActa(acta: ActaRecarga): void {
    this.actaSeleccionada = acta;
    this.formCrear.patchValue({
      periodoInicio: acta.periodoInicio,
      periodoFin: acta.periodoFin,
      anio: acta.anio,
      totalRequeridoProyectado: acta.totalRequeridoProyectado,
      totalIngresadoTarjetas: acta.totalIngresadoTarjetas,
      totalRecargadoGoogleAds: acta.totalRecargadoGoogleAds,
      totalReportadoFormularios: acta.totalReportadoFormularios,
      firmaEmisor: acta.firmaEmisor,
      firmaEmisorImagen: acta.firmaEmisorImagen,
      revisorId: acta.revisorId,
    });
    if (acta.firmaEmisorImagen) {
      this.firmaEmisorCrearTipo = 'imagen';
      this.firmaEmisorImagenBase64Crear = acta.firmaEmisorImagen;
      this.firmaEmisorArchivoNombreCrear = 'firma-emisor';
      this.firmaEmisorArchivoTipoCrear = 'image/png';
    } else {
      this.firmaEmisorCrearTipo = 'texto';
      this.firmaEmisorTextoCrear = acta.firmaEmisor || '';
    }
    this.mostrarModalCrear = true;
    setTimeout(() => this.prepararCanvasFirmaEmisorCrear(), 0);
  }

  guardarEdicion(): void {
    if (!this.actaSeleccionada || this.formCrear.invalid) return;

    const actaId = this.actaSeleccionada.id;
    const esBorrador = this.actaSeleccionada.estado === 'borrador';
    const firmaExistente = !!(this.actaSeleccionada.firmaEmisor || this.actaSeleccionada.firmaEmisorImagen);

    const firmaTexto = this.firmaEmisorCrearTipo === 'texto' ? this.firmaEmisorTextoCrear.trim() : '';
    const firmaImagen = this.firmaEmisorCrearTipo !== 'texto' ? this.firmaEmisorImagenBase64Crear : null;
    if (!firmaTexto && !firmaImagen && !firmaExistente) {
      alert('Debe firmar el acta antes de guardar');
      return;
    }

    this.formCrear.patchValue({
      firmaEmisor: firmaTexto || null,
      firmaEmisorImagen: firmaImagen || null,
    });

    const rawEditar = this.formCrear.value;
    const payloadEditar = {
      ...rawEditar,
      totalRequeridoProyectado: this.parseMonto(rawEditar.totalRequeridoProyectado),
      totalIngresadoTarjetas: this.parseMonto(rawEditar.totalIngresadoTarjetas),
      totalRecargadoGoogleAds: this.parseMonto(rawEditar.totalRecargadoGoogleAds),
      totalReportadoFormularios: this.parseMonto(rawEditar.totalReportadoFormularios),
    };

    this.guardando = true;
    this.actaService.actualizarActa(actaId, payloadEditar).subscribe({
      next: (res) => {
        console.log('Acta actualizada:', res);
        const actaActualizada = res.acta;
        
        // Si está en borrador y tiene montos, enviar automáticamente
        const tieneMonto = actaActualizada.totalRequeridoProyectado || actaActualizada.totalIngresadoTarjetas || 
                          actaActualizada.totalRecargadoGoogleAds || actaActualizada.totalReportadoFormularios;
        
        if (esBorrador && tieneMonto) {
          console.log('Enviando acta actualizada para revisión...');
          const firmaAuto = firmaTexto || `${actaActualizada.emisor?.name || ''} ${actaActualizada.emisor?.lastName || ''}`.trim() || 'Emisor';
          const firmaImagenAuto = firmaImagen || actaActualizada.firmaEmisorImagen || undefined;
          this.actaService.enviarActaParaRevision(actaId, firmaAuto, firmaImagenAuto).subscribe({
            next: (envioRes) => {
              this.guardando = false;
              this.cerrarModalCrear();
              this.actaSeleccionada = null;
              this.cargarActas();
              alert('Acta actualizada y enviada al revisor. Se ha enviado un correo electrónico.');
            },
            error: (envioErr) => {
              this.guardando = false;
              this.cerrarModalCrear();
              this.actaSeleccionada = null;
              this.cargarActas();
              console.error('Error al enviar email:', envioErr);
              alert('Acta actualizada, pero hubo un error al enviar el correo al revisor.');
            }
          });
        } else {
          this.guardando = false;
          this.cerrarModalCrear();
          this.actaSeleccionada = null;
          this.cargarActas();
          alert('Acta actualizada exitosamente');
        }
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.msg || 'Error al actualizar acta');
      },
    });
  }

  eliminarActa(acta: ActaRecarga): void {
    if (!confirm('¿Está seguro de eliminar esta acta?')) return;

    this.actaService.eliminarActa(acta.id).subscribe({
      next: (res) => {
        this.cargarActas();
        alert('Acta eliminada exitosamente');
      },
      error: (err) => {
        alert(err.error?.msg || 'Error al eliminar acta');
      },
    });
  }

  // ==================== GESTIÓN DE ACCESOS ====================

  abrirModalAccesos(): void {
    this.cargarAccesos();
    this.mostrarModalAccesos = true;
  }

  cerrarModalAccesos(): void {
    this.mostrarModalAccesos = false;
  }

  abrirModalAgregarAcceso(): void {
    this.formAcceso.reset({ puedeVer: true, puedeEditar: false });
    this.mostrarModalAgregarAcceso = true;
  }

  cerrarModalAgregarAcceso(): void {
    this.mostrarModalAgregarAcceso = false;
  }

  agregarAcceso(): void {
    if (this.formAcceso.invalid) return;

    const { usuarioId, puedeVer, puedeEditar } = this.formAcceso.value;
    this.actaService.agregarAcceso(usuarioId, puedeVer, puedeEditar).subscribe({
      next: (res) => {
        this.cerrarModalAgregarAcceso();
        this.cargarAccesos();
        this.cargarUsuariosDisponibles();
        alert('Acceso agregado exitosamente');
      },
      error: (err) => {
        alert(err.error?.msg || 'Error al agregar acceso');
      },
    });
  }

  toggleAcceso(acceso: ActaRecargaAcceso, tipo: 'ver' | 'editar'): void {
    const puedeVer = tipo === 'ver' ? !acceso.puedeVer : acceso.puedeVer;
    const puedeEditar = tipo === 'editar' ? !acceso.puedeEditar : acceso.puedeEditar;

    this.actaService.actualizarAcceso(acceso.id, puedeVer, puedeEditar).subscribe({
      next: (res) => {
        this.cargarAccesos();
      },
      error: (err) => {
        alert(err.error?.msg || 'Error al actualizar acceso');
      },
    });
  }

  eliminarAcceso(acceso: ActaRecargaAcceso): void {
    if (!confirm(`¿Eliminar acceso de ${acceso.usuario?.name} ${acceso.usuario?.lastName}?`)) return;

    this.actaService.eliminarAcceso(acceso.id).subscribe({
      next: (res) => {
        this.cargarAccesos();
        this.cargarUsuariosDisponibles();
        alert('Acceso eliminado');
      },
      error: (err) => {
        alert(err.error?.msg || 'Error al eliminar acceso');
      },
    });
  }

  // ==================== PDF ====================

  generarPDF(acta: ActaRecarga): void {
    this.generandoPdf = true;
    
    // Crear contenido HTML del acta
    const contenidoHTML = this.generarHTMLActa(acta);
    
    // Abrir en nueva ventana para imprimir/guardar como PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que cargue y abrir diálogo de impresión
      ventana.onload = () => {
        this.generandoPdf = false;
        ventana.print();
      };
    } else {
      this.generandoPdf = false;
      alert('Por favor habilite las ventanas emergentes para generar el PDF');
    }
  }

  generarHTMLActa(acta: ActaRecarga): string {
    const formatDate = (date: string) => {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString('es-CO', { day: 'numeric' });
    };

    const formatMonth = (date: string) => {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString('es-CO', { month: 'long' });
    };

    const formatMoney = (amount: number | null) => {
      if (amount === null || amount === undefined) return '________________';
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const logoUrl = `${window.location.origin}/LOGO_BLANCO%20VERTICAL.png`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acta de Validación y Cierre de Recargas</title>
        <style>
          @page {
            size: letter;
            margin: 2cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo-container {
            margin-bottom: 15px;
          }
          .logo-img {
            max-width: 160px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          h1 {
            font-size: 15pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 25px 0 15px 0;
          }
          .periodo {
            font-size: 12pt;
            margin-bottom: 25px;
          }
          .linea-campo {
            display: inline-block;
            border-bottom: 1px solid #000;
            min-width: 80px;
            text-align: center;
            padding: 0 5px;
          }
          .descripcion {
            text-align: justify;
            margin-bottom: 20px;
          }
          .campo-monto {
            margin: 15px 0;
            font-size: 12pt;
          }
          .campo-monto .valor {
            display: inline-block;
            border-bottom: 1px solid #000;
            min-width: 200px;
            text-align: center;
            padding: 0 10px;
          }
          .comparacion-texto {
            text-align: justify;
            margin: 25px 0;
            font-style: italic;
          }
          .nota {
            text-align: justify;
            margin: 25px 0;
          }
          .firmas {
            margin-top: 50px;
          }
          .firma-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
          }
          .firma-col {
            width: 45%;
          }
          .firma-linea {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
          }
          .firma-nombre {
            font-weight: bold;
            margin: 5px 0 0 0;
          }
          .firma-cargo {
            font-size: 10pt;
            color: #333;
            margin: 2px 0 0 0;
          }
          .footer-acta {
            margin-top: 50px;
            text-align: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 15px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img class="logo-img" src="${logoUrl}" alt="Logo Andrés Publicidad" />
          </div>
          <h1>Acta semanal de Validación y Cierre de Recargas</h1>
          <div class="periodo">
            Periodo de Revisión: <span class="linea-campo">${formatDate(acta.periodoInicio)}</span> 
            al <span class="linea-campo">${formatDate(acta.periodoFin)}</span> 
            de <span class="linea-campo">${formatMonth(acta.periodoFin)}</span> de ${acta.anio}
          </div>
        </div>

        <div class="descripcion">
          En la presente fecha, se procede a validar la correspondencia de los montos totales de las recargas.
        </div>

        <div class="campo-monto">
          <strong>Total Requerido Proyectado:</strong> $ <span class="valor">${acta.totalRequeridoProyectado !== null ? formatMoney(acta.totalRequeridoProyectado).replace('$', '').trim() : '________________'}</span>
        </div>

        <div class="campo-monto">
          <strong>Total Ingresado a las Tarjetas:</strong> $ <span class="valor">${acta.totalIngresadoTarjetas !== null ? formatMoney(acta.totalIngresadoTarjetas).replace('$', '').trim() : '________________'}</span>
        </div>

        <div class="comparacion-texto">
          Comparación entre los montos reportados por los pautadores mediante formulario y los 
          efectivamente debitados de las cuentas bancarias/tarjetas.
        </div>

        <div class="campo-monto">
          <strong>Total Recargado Google ADS:</strong> $ <span class="valor">${acta.totalRecargadoGoogleAds !== null ? formatMoney(acta.totalRecargadoGoogleAds).replace('$', '').trim() : '________________'}</span>
        </div>

        <div class="campo-monto">
          <strong>Total reportado en formularios de recarga:</strong> $ <span class="valor">${acta.totalReportadoFormularios !== null ? formatMoney(acta.totalReportadoFormularios).replace('$', '').trim() : '________________'}</span>
        </div>

        <div class="nota">
          Los montos arriba descritos deben coincidir al revisar y verificar las novedades de 
          activación, presupuestos y otras, en las cuentas correspondientes al periodo.
        </div>

        <div class="firmas">
          <div class="firma-row">
            <div class="firma-col">
              <p>Montos y novedades revisadas y certificadas por:</p>
              <div class="firma-linea">
                ${acta.firmaEmisorImagen ? `<img src="${acta.firmaEmisorImagen}" alt="Firma Emisor" style="max-width: 200px; max-height: 80px; display: block; margin-bottom: 5px;">` : ''}
                <p class="firma-nombre">${acta.firmaEmisor || 'Alexandra Castrillón Arias'}</p>
                <p class="firma-cargo">Especialista ADS</p>
              </div>
            </div>
            <div class="firma-col" style="text-align: right;">
              <p>Recibido por:</p>
              <div class="firma-linea">
                ${acta.firmaRevisorImagen ? `<img src="${acta.firmaRevisorImagen}" alt="Firma Revisor" style="max-width: 200px; max-height: 80px; display: block; margin-bottom: 5px; margin-left: auto;">` : ''}
                <p class="firma-nombre">${acta.firmaRevisor || 'Camila Burbano Muñoz'}</p>
                <p class="firma-cargo">Líder de Pauta o Encargado</p>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-acta">
          📍 Pereira, Risaralda - Colombia &nbsp; 📞 (+57) 324 234 1917 &nbsp; ✉️ andrespublicidad@andrespublicidadtg.com
        </div>
      </body>
      </html>
    `;
  }

  // ==================== UTILIDADES ====================

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'borrador': return 'badge-secondary';
      case 'pendiente_revision': return 'badge-warning';
      case 'firmado': return 'badge-info';
      case 'completado': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'pendiente_revision': return 'Pendiente de Revisión';
      case 'firmado': return 'Firmado';
      case 'completado': return 'Completado';
      default: return estado;
    }
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  }

  formatearMonto(monto: number | null): string {
    if (monto === null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  }

  onMontoFocus(controlName: string): void {
    const control = this.formCrear.get(controlName);
    if (!control) return;
    const num = this.parseMonto(control.value);
    if (num === null) return;
    control.setValue(num.toString(), { emitEvent: false });
  }

  onMontoInput(controlName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const raw = input.value;
    const num = this.parseMonto(raw);
    if (num === null) {
      this.formCrear.get(controlName)?.setValue(null, { emitEvent: false });
      input.value = '';
      return;
    }
    const formatted = new Intl.NumberFormat('es-CO').format(num);
    this.formCrear.get(controlName)?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
    const pos = formatted.length;
    input.setSelectionRange(pos, pos);
  }

  onMontoBlur(controlName: string): void {
    const control = this.formCrear.get(controlName);
    if (!control) return;
    const num = this.parseMonto(control.value);
    if (num === null) {
      control.setValue(null, { emitEvent: false });
      return;
    }
    const formatted = new Intl.NumberFormat('es-CO').format(num);
    control.setValue(formatted, { emitEvent: false });
  }

  private parseMonto(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    const cleaned = value.toString().replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    return Number(cleaned);
  }

  puedeEditar(acta: ActaRecarga): boolean {
    return acta.estado === 'borrador' && acta.emisorId === this.usuarioActualId;
  }

  puedeEnviar(acta: ActaRecarga): boolean {
    return acta.estado === 'borrador' && acta.emisorId === this.usuarioActualId && 
      (acta.totalRequeridoProyectado !== null || acta.totalIngresadoTarjetas !== null || acta.totalRecargadoGoogleAds !== null || acta.totalReportadoFormularios !== null);
  }

  firmaEmisorCrearValida(): boolean {
    const firmaTexto = this.firmaEmisorCrearTipo === 'texto' ? this.firmaEmisorTextoCrear.trim() : '';
    const firmaImagen = this.firmaEmisorCrearTipo !== 'texto' ? this.firmaEmisorImagenBase64Crear : null;
    return !!firmaTexto || !!firmaImagen;
  }

  resetFirmaEmisorCrear(): void {
    this.firmaEmisorCrearTipo = 'dibujo';
    this.firmaEmisorTextoCrear = '';
    this.firmaEmisorImagenBase64Crear = null;
    this.firmaEmisorArchivoNombreCrear = null;
    this.firmaEmisorArchivoTipoCrear = null;
    this.firmaCanvasCtxCrear = null;
    this.firmaDibujandoCrear = false;
    this.firmaCanvasVacioCrear = true;
  }

  prepararCanvasFirmaEmisorCrear(): void {
    const canvas = this.firmaCanvasCrear?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#141414';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.firmaCanvasCtxCrear = ctx;
  }

  iniciarFirmaEmisorCrear(event: MouseEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
    if (!this.firmaCanvasCtxCrear) {
      this.prepararCanvasFirmaEmisorCrear();
    }
    const ctx = this.firmaCanvasCtxCrear;
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    this.firmaDibujandoCrear = true;
  }

  moverFirmaEmisorCrear(event: MouseEvent): void {
    if (!this.firmaDibujandoCrear || !this.firmaCanvasCtxCrear) return;
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.firmaCanvasCtxCrear.lineTo(x, y);
    this.firmaCanvasCtxCrear.stroke();
    this.firmaCanvasVacioCrear = false;
  }

  terminarFirmaEmisorCrear(): void {
    if (!this.firmaDibujandoCrear) return;
    this.firmaDibujandoCrear = false;
    this.actualizarFirmaEmisorCrearDesdeCanvas();
  }

  limpiarFirmaEmisorCrear(): void {
    const canvas = this.firmaCanvasCrear?.nativeElement;
    if (!canvas || !this.firmaCanvasCtxCrear) return;
    this.firmaCanvasCtxCrear.clearRect(0, 0, canvas.width, canvas.height);
    this.firmaCanvasCtxCrear.fillStyle = '#fff';
    this.firmaCanvasCtxCrear.fillRect(0, 0, canvas.width, canvas.height);
    this.firmaEmisorImagenBase64Crear = null;
    this.firmaEmisorArchivoNombreCrear = null;
    this.firmaEmisorArchivoTipoCrear = null;
    this.firmaCanvasVacioCrear = true;
  }

  actualizarFirmaEmisorCrearDesdeCanvas(): void {
    const canvas = this.firmaCanvasCrear?.nativeElement;
    if (!canvas || this.firmaCanvasVacioCrear) return;
    this.firmaEmisorImagenBase64Crear = canvas.toDataURL('image/png');
    this.firmaEmisorArchivoNombreCrear = 'firma-dibujada.png';
    this.firmaEmisorArchivoTipoCrear = 'image/png';
  }

  onFirmaEmisorCrearArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    if (file.size > 4 * 1024 * 1024) {
      alert('El archivo no debe superar los 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.firmaEmisorImagenBase64Crear = reader.result as string;
      this.firmaEmisorArchivoNombreCrear = file.name;
      this.firmaEmisorArchivoTipoCrear = file.type;
    };
    reader.readAsDataURL(file);
  }

  puedeEliminar(acta: ActaRecarga): boolean {
    return acta.estado === 'borrador' && acta.emisorId === this.usuarioActualId;
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarActas();
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarActas();
  }

  limpiarFiltros(): void {
    this.filtroAnio = new Date().getFullYear();
    this.filtroEstado = '';
    this.paginaActual = 1;
    this.cargarActas();
  }

  get usuariosSinAcceso(): UResponse[] {
    const idsConAcceso = this.accesos.map(a => a.usuarioId);
    return this.todosLosUsuarios.filter(u => !idsConAcceso.includes(u.Uid!));
  }
}
