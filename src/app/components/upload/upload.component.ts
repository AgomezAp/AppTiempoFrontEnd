import { HttpEventType } from '@angular/common/http';
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
  constructor(private uploadService: UploadService, private toastr: ToastrService, private router: Router) {}

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    } else{
      console.error('No se seleccionó ningún archivo');
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    console.log('onSubmit EJECUTANDO');
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
} 