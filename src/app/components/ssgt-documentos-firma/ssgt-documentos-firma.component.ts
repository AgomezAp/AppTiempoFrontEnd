import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import { DocumentoFirma } from '../../interfaces/ssgt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-documentos-firma',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-documentos-firma.component.html',
  styleUrl: './ssgt-documentos-firma.component.css',
})
export class SsgtDocumentosFirmaComponent implements OnInit {
  documentos: DocumentoFirma[] = [];
  usuarios: any[] = [];
  loading = false;
  userId: number = 0;
  filtroEstado: string = '';
  filtroEmpresa: string = '';

  mostrarModalSubir = false;
  archivoSeleccionado: File | null = null;
  subiendoDocumento = false;
  nuevoDocumento = { titulo: '', descripcion: '', empresa: '' };

  documentoSeleccionado: DocumentoFirma | null = null;
  mostrarEditor = false;
  paginaActual = 1;
  campos: any[] = [];
  guardandoCampos = false;
  enviandoParaFirmar = false;

  agregandoCampo = false;
  nuevoCampo = { etiqueta: '', nombreFirmante: '', emailFirmante: '', usuarioId: null as number | null, esExterno: false };

  mostrarDetalle = false;

  zoom = 100;

  private draggingCampo: any = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private campoStartX = 0;
  private campoStartY = 0;

  constructor(private ssgtService: SsgtService, private userService: UserService) {}

  ngOnInit(): void {
    this.userId = parseInt(localStorage.getItem('userId') || '0');
    this.cargarDocumentos();
    this.cargarUsuarios();
  }

  cargarDocumentos(): void {
    this.loading = true;
    this.ssgtService.obtenerDocumentosFirma(this.filtroEstado || undefined, this.filtroEmpresa || undefined).subscribe({
      next: (data) => { this.documentos = data; this.loading = false; },
      error: () => { this.loading = false; Swal.fire('Error', 'Error al cargar documentos', 'error'); }
    });
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({ next: (data: any) => { this.usuarios = data; }, error: () => {} });
  }

  abrirModalSubir(): void {
    this.mostrarModalSubir = true;
    this.archivoSeleccionado = null;
    this.nuevoDocumento = { titulo: '', descripcion: '', empresa: '' };
  }

  cerrarModalSubir(): void { this.mostrarModalSubir = false; }

  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(ext || '')) { Swal.fire('Error', 'Solo se permiten archivos PDF, DOC o DOCX', 'error'); return; }
      this.archivoSeleccionado = file;
      if (!this.nuevoDocumento.titulo) { this.nuevoDocumento.titulo = file.name.replace(/\.[^/.]+$/, ''); }
    }
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado || !this.nuevoDocumento.titulo) { Swal.fire('Error', 'Seleccione archivo y título', 'error'); return; }
    this.subiendoDocumento = true;
    this.ssgtService.subirDocumento(this.archivoSeleccionado, this.nuevoDocumento.titulo, this.nuevoDocumento.descripcion, this.nuevoDocumento.empresa).subscribe({
      next: (res) => {
        Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        this.cerrarModalSubir();
        this.subiendoDocumento = false;
        this.cargarDocumentos();
        if (res.documento) { this.abrirEditor(res.documento); }
      },
      error: () => { Swal.fire('Error', 'Error al subir el documento', 'error'); this.subiendoDocumento = false; }
    });
  }

  abrirEditor(doc: DocumentoFirma): void {
    this.loading = true;
    this.ssgtService.obtenerDocumentoFirmaPorId(doc.id!).subscribe({
      next: (data) => {
        this.documentoSeleccionado = data;
        this.campos = (data.campos || []).map((c: any) => ({ ...c }));
        this.paginaActual = 1;
        this.mostrarEditor = true;
        this.mostrarDetalle = false;
        this.loading = false;
      },
      error: () => { this.loading = false; Swal.fire('Error', 'Error al cargar el documento', 'error'); }
    });
  }

  cerrarEditor(): void { this.mostrarEditor = false; this.documentoSeleccionado = null; this.campos = []; this.agregandoCampo = false; }

  abrirDetalle(doc: DocumentoFirma): void {
    this.loading = true;
    this.ssgtService.obtenerDocumentoFirmaPorId(doc.id!).subscribe({
      next: (data) => {
        this.documentoSeleccionado = data;
        this.campos = data.campos || [];
        this.paginaActual = 1;
        this.mostrarDetalle = true;
        this.mostrarEditor = false;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cerrarDetalle(): void { this.mostrarDetalle = false; this.documentoSeleccionado = null; }

  getPaginaImagenUrl(): string {
    if (!this.documentoSeleccionado) return '';
    return this.ssgtService.obtenerPaginaImagen(this.documentoSeleccionado.id!, this.paginaActual);
  }

  paginaAnterior(): void { if (this.paginaActual > 1) this.paginaActual--; }
  paginaSiguiente(): void { if (this.documentoSeleccionado && this.paginaActual < this.documentoSeleccionado.totalPaginas) this.paginaActual++; }

  getCamposPaginaActual(): any[] { return this.campos.filter(c => c.paginaNumero === this.paginaActual); }

  iniciarAgregarCampo(): void {
    this.agregandoCampo = true;
    this.nuevoCampo = { etiqueta: '', nombreFirmante: '', emailFirmante: '', usuarioId: null, esExterno: true };
  }

  cancelarAgregarCampo(): void { this.agregandoCampo = false; }

  onUsuarioCampoChange(event: any): void {
    const uid = parseInt(event.target.value);
    if (uid) {
      const user = this.usuarios.find(u => u.Uid === uid);
      if (user) { this.nuevoCampo.usuarioId = uid; this.nuevoCampo.nombreFirmante = user.nombre; this.nuevoCampo.emailFirmante = user.email || ''; this.nuevoCampo.esExterno = false; }
    } else { this.nuevoCampo.usuarioId = null; this.nuevoCampo.esExterno = true; }
  }

  agregarCampo(): void {
    if (!this.nuevoCampo.emailFirmante) { Swal.fire('Error', 'El email del firmante es obligatorio', 'error'); return; }
    this.campos.push({
      documentoId: this.documentoSeleccionado!.id, paginaNumero: this.paginaActual,
      posX: 10 + (this.getCamposPaginaActual().length * 5), posY: 70 + (this.getCamposPaginaActual().length * 5),
      ancho: 20, alto: 8, etiqueta: this.nuevoCampo.etiqueta, nombreFirmante: this.nuevoCampo.nombreFirmante,
      emailFirmante: this.nuevoCampo.emailFirmante, usuarioId: this.nuevoCampo.usuarioId,
      esExterno: this.nuevoCampo.esExterno, firmado: false
    });
    this.agregandoCampo = false;
  }

  eliminarCampo(index: number): void {
    const campoIndex = this.campos.indexOf(this.getCamposPaginaActual()[index]);
    if (campoIndex > -1) this.campos.splice(campoIndex, 1);
  }

  onCampoDragStart(event: MouseEvent, campo: any): void {
    event.preventDefault();
    this.draggingCampo = campo;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.campoStartX = campo.posX;
    this.campoStartY = campo.posY;
    const container = (event.target as HTMLElement).closest('.pagina-container');
    if (!container) return;
    const img = container.querySelector('.pagina-imagen') as HTMLElement;
    if (!img) return;
    const onMove = (e: MouseEvent) => {
      if (!this.draggingCampo) return;
      const imgRect = img.getBoundingClientRect();
      const dx = ((e.clientX - this.dragStartX) / imgRect.width) * 100;
      const dy = ((e.clientY - this.dragStartY) / imgRect.height) * 100;
      this.draggingCampo.posX = Math.max(0, Math.min(100 - this.draggingCampo.ancho, this.campoStartX + dx));
      this.draggingCampo.posY = Math.max(0, Math.min(100 - this.draggingCampo.alto, this.campoStartY + dy));
    };
    const onUp = () => { this.draggingCampo = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onCampoResizeStart(event: MouseEvent, campo: any): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startAncho = campo.ancho;
    const startAlto = campo.alto;
    const container = (event.target as HTMLElement).closest('.pagina-container');
    if (!container) return;
    const img = container.querySelector('.pagina-imagen') as HTMLElement;
    if (!img) return;
    const onMove = (e: MouseEvent) => {
      const imgRect = img.getBoundingClientRect();
      const dx = ((e.clientX - startX) / imgRect.width) * 100;
      const dy = ((e.clientY - startY) / imgRect.height) * 100;
      campo.ancho = Math.max(5, Math.min(100 - campo.posX, startAncho + dx));
      campo.alto = Math.max(3, Math.min(100 - campo.posY, startAlto + dy));
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  zoomIn(): void { this.zoom = Math.min(200, this.zoom + 25); }
  zoomOut(): void { this.zoom = Math.max(50, this.zoom - 25); }

  guardarCampos(): void {
    if (!this.documentoSeleccionado) return;
    this.guardandoCampos = true;
    this.ssgtService.guardarCamposFirma(this.documentoSeleccionado.id!, this.campos).subscribe({
      next: () => { Swal.fire('Éxito', 'Campos guardados', 'success'); this.guardandoCampos = false; },
      error: () => { Swal.fire('Error', 'Error al guardar', 'error'); this.guardandoCampos = false; }
    });
  }

  enviarParaFirmar(): void {
    if (!this.documentoSeleccionado || this.campos.length === 0) { Swal.fire('Error', 'Agregue al menos un campo de firma', 'error'); return; }
    Swal.fire({ title: 'Enviar para firmar', text: 'Se enviarán correos a todos los firmantes. ¿Continuar?', icon: 'question', showCancelButton: true, confirmButtonColor: '#141414', confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar' }).then((result) => {
      if (result.isConfirmed) {
        this.enviandoParaFirmar = true;
        this.ssgtService.guardarCamposFirma(this.documentoSeleccionado!.id!, this.campos).subscribe({
          next: () => {
            this.ssgtService.enviarDocumentoParaFirmar(this.documentoSeleccionado!.id!).subscribe({
              next: () => { Swal.fire('Éxito', 'Documento enviado para firmar', 'success'); this.enviandoParaFirmar = false; this.cerrarEditor(); this.cargarDocumentos(); },
              error: () => { Swal.fire('Error', 'Error al enviar', 'error'); this.enviandoParaFirmar = false; }
            });
          },
          error: () => { Swal.fire('Error', 'Error al guardar campos', 'error'); this.enviandoParaFirmar = false; }
        });
      }
    });
  }

  reenviarCorreo(campo: any): void {
    if (!this.documentoSeleccionado) return;
    this.ssgtService.reenviarCorreoCampo(this.documentoSeleccionado.id!, campo.id).subscribe({
      next: () => { Swal.fire('Éxito', 'Correo reenviado', 'success'); },
      error: () => { Swal.fire('Error', 'Error al reenviar', 'error'); }
    });
  }

  descargarPdfFirmado(): void {
    if (!this.documentoSeleccionado) return;
    this.ssgtService.descargarPdfFirmado(this.documentoSeleccionado.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${this.documentoSeleccionado!.titulo}_firmado.pdf`; a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { Swal.fire('Error', 'Error al descargar PDF', 'error'); }
    });
  }

  eliminarDocumento(doc: DocumentoFirma): void {
    Swal.fire({ title: '¿Eliminar documento?', text: `Se eliminará "${doc.titulo}"`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService.eliminarDocumentoFirma(doc.id!).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarDocumentos(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) { case 'borrador': return 'badge-secondary'; case 'pendiente': return 'badge-warning'; case 'completado': return 'badge-success'; default: return 'badge-secondary'; }
  }
  getEstadoLabel(estado: string): string {
    switch (estado) { case 'borrador': return 'Borrador'; case 'pendiente': return 'Pendiente de Firmas'; case 'completado': return 'Completado'; default: return estado; }
  }
  getCamposFirmados(): number { return this.campos.filter(c => c.firmado).length; }
  getCamposFirmadosDoc(doc: DocumentoFirma): number { return doc.campos ? doc.campos.filter(c => c.firmado).length : 0; }
  getEmpresaNombre(empresa: string): string {
    switch (empresa) { case 'AP': return 'Andrés Publicidad'; case 'AT': return 'Andrés Tobón'; case 'ME': return 'María Evangelina'; default: return empresa || 'No especificada'; }
  }
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
