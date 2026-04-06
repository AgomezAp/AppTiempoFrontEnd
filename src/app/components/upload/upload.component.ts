import { HttpEventType, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { UploadService, UploadHistorial } from '../../services/upload.service';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  progress: number = 0;
  selectedFiles: File[] = []
  uploadProgress = 0;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  mergedXmlUrl: string | null = null;
  historial: UploadHistorial[] = [];

  constructor(private uploadService: UploadService, private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.uploadService.getUploadHistorial().subscribe({
      next: (data) => this.historial = data,
      error: () => {}
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0];
    } else{
      console.error('No se seleccionó ningún archivo');
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.selectedFile) {
      this.toastr.error('Seleccione un archivo');
      return;
    }
    this.subirArchivo(this.selectedFile, false);
  }

  private subirArchivo(file: File, forzar: boolean): void {
    const obs = forzar
      ? this.uploadService.uploadForce(file)
      : this.uploadService.upload(file);

    obs.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const body = event.body;
          if (body?.totalCorregidos > 0) {
            this.toastr.warning(
              `Se autocorrigieron ${body.totalCorregidos} registros`,
              'Correcciones automáticas',
              { timeOut: 8000, enableHtml: false }
            );
          }
          this.toastr.success('Archivo subido exitosamente');
          this.cargarHistorial();
          this.router.navigate(['/horas']);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409 && error.error?.error === 'DUPLICADO') {
          const data = error.error;
          Swal.fire({
            title: 'Registros duplicados detectados',
            html: `Ya existen <b>${data.registrosExistentes}</b> registros entre <b>${data.rangoInicio}</b> y <b>${data.rangoFin}</b>.<br><br>
                   ${data.uploadPrevioId 
                     ? '¿Desea <b>revertir la subida anterior</b> y subir de nuevo?' 
                     : '¿Desea <b>forzar</b> la subida? (se agregarán registros duplicados)'}`,
            icon: 'warning',
            showCancelButton: true,
            showDenyButton: !!data.uploadPrevioId,
            confirmButtonText: data.uploadPrevioId ? 'Revertir y subir de nuevo' : 'Forzar subida',
            denyButtonText: 'Forzar sin revertir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            denyButtonColor: '#f0ad4e'
          }).then((result) => {
            if (result.isConfirmed && data.uploadPrevioId) {
              // Revertir primero, luego subir
              this.uploadService.revertUpload(data.uploadPrevioId).subscribe({
                next: () => {
                  this.toastr.info('Subida anterior revertida. Subiendo de nuevo...');
                  this.subirArchivo(file, true);
                },
                error: () => this.toastr.error('Error al revertir la subida anterior')
              });
            } else if (result.isConfirmed || result.isDenied) {
              // Forzar subida sin revertir
              this.subirArchivo(file, true);
            }
          });
        } else {
          this.toastr.error('Error al subir el archivo');
        }
      }
    });
  }

  revertirSubida(upload: UploadHistorial): void {
    Swal.fire({
      title: '¿Revertir esta subida?',
      html: `Se eliminarán <b>${upload.cantidadRegistros}</b> registros del <b>${upload.rangoInicio}</b> al <b>${upload.rangoFin}</b> y se revertirán las horas extras acumuladas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, revertir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadService.revertUpload(upload.id).subscribe({
          next: (res) => {
            this.toastr.success(`Subida revertida: ${res.registrosEliminados} registros eliminados`);
            this.cargarHistorial();
          },
          error: (err) => {
            this.toastr.error(err.error?.error || 'Error al revertir la subida');
          }
        });
      }
    });
  }

  onFileSelect(event: any): void {
    this.selectedFiles = Array.from(event.target.files); // Convierte FileList a Array
    const file202Index = this.selectedFiles.findIndex(file => file.name.includes('202'));
    if (file202Index !== -1){
      const file202 = this.selectedFiles.splice(file202Index,1)[0];
      this.selectedFiles.unshift(file202)
    } 
  }

  onSubmit1(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Por favor, selecciona al menos un archivo XML.');
      return;
    }
    console.log(this.selectedFiles)

    this.uploadService.uploadFiles(this.selectedFiles).subscribe(
      (response: Blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.xml'; // Nombre del archivo descargado
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al subir los archivos:', error);
        alert('Ocurrió un error al procesar los archivos.');
      }
    );
  }
} 