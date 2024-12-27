import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { UploadService } from '../../services/upload.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedFile: File | null = null;
  progress: number = 0;
  constructor(private uploadService: UploadService, private toastr: ToastrService, private router: Router) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.uploadService.upload(this.selectedFile).subscribe( event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.progress = Math.round((100 * event.loaded) / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          this.toastr.success('Archivo subido exitosamente');
          this.router.navigate(['/horas']); // Redirige a la pantalla de horas
        }
      },
      error => {
        this.toastr.error('Error al subir el archivo');
      });
    } else {
      this.toastr.error('Seleccione un archivo');
    }
  }  
} 