import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-upload',
  imports: [NavbarComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post('/api/upload-xml', formData).subscribe(
        response => {
          this.toastr.success('Archivo subido exitosamente');
          this.router.navigate(['/horas']); // Redirige a la pantalla de horas
        },
        error => {
          this.toastr.error('Error al subir el archivo');
        }
      );
    }
  }
}
