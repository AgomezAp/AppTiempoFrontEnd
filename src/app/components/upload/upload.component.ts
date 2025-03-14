import { HttpEventType, HttpEvent } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../services/upload.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedFile: File | null = null;
  progress: number = 0;
  selectedFiles: File[] = []
  uploadProgress = 0;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  mergedXmlUrl: string | null = null;
  constructor(private uploadService: UploadService, private toastr: ToastrService, private router: Router) {}

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
    if (this.selectedFile) {
      this.uploadService.upload(this.selectedFile).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          console.log('Respuesta del servidor:', event.body);
            if (event.body && event.body.success){
              this.toastr.success('Archivo subido exitosamente');
            } else {
              this.toastr.success('Archivo subido exitosamente');
              this.router.navigate(['/horas']);
              }
          }
      }, error => {
        console.error('Error al subir el archivo:2', error);
        this.toastr.error('Error al subir el archivo3');
      });
    } else {
      this.toastr.error('Seleccione un archivo');
    }
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