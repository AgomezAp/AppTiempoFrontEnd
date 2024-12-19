import {
  CommonModule,
  Location,
} from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { PermisosService } from '../../services/permisos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-permiso',
  imports: [CommonModule,FormsModule,SpinnerComponent],
  templateUrl: './permiso.component.html',
  styleUrl: './permiso.component.css'
})
export class PermisoComponent {
  permiso: any = {
    tipo: '',
    descripcion: '',
    fechaInicio: new Date(),
    fechaFin: new Date(),
    horas: 0,
    Uid: parseInt(localStorage.getItem('userId') || '0', 10),
    emailPersonal: '',
    emailLider: '',
    nombre: '',
    numeroDocumento: '',
    horaSalida: '',
    horaRegreso: '',
    observaciones: ''
  };
  loading: boolean = false;
  tiposPermiso: string[] = [
    'Permiso personal de todo el día',
    'Llegada tarde por factores externos',
    'Cita médica',
    'Cita odontológica',
    'Incapacidad médica',
    'Día de la familia',
    'Día extralegal',
    'Calamidad',
    'Suspensión por proceso disciplinario',
    'Licencia de luto',
    'Media jornada por votación',
    'Jurado de votación',
    'Incapacidad laboral',
    'Urgencia médica',
    'Vacaciones'
  ];
  selectedFile: File | null = null;
  today: string;

  constructor(
    private permisoService: PermisosService,
    private toastr: ToastrService,
    private router: Router,
    private location: Location
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  createPermiso() {
    const formData = new FormData();
    this.loading = true;
    for (const key in this.permiso) {
      if (this.permiso.hasOwnProperty(key)) {
        formData.append(key, (this.permiso as any)[key]);
      }
    }
    if (this.selectedFile) {
      formData.append('soporte', this.selectedFile);
    }

    this.permisoService.createPermiso(formData).subscribe({
      
      next: (response: any) => {
        this.loading = false;
        this.toastr.success('Permiso creado con éxito', 'Éxito');
        this.router.navigate(['/horas']); // Redirigir a la pantalla de horas
      },
      error: (error: any) => {
        this.toastr.error('Error al crear el permiso', 'Error');
      }
    });
  }
  cancel() {
    this.location.back(); // Redirigir a la página anterior
  }
}
