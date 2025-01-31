import {
  CommonModule,
  Location,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { PermisosService } from '../../services/permisos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-permiso',
  imports: [CommonModule, FormsModule, SpinnerComponent, NavbarComponent],
  templateUrl: './permiso.component.html',
  styleUrl: './permiso.component.css',
})
export class PermisoComponent implements OnInit {
  permiso: any = {
    tipo: '',
    descripcion: '',
    fecha: new Date(),
    horas: 0,
    Uid: parseInt(localStorage.getItem('userId') || '0', 10),
    emailPersonal: localStorage.getItem('email') || '',
    emailLider: '',
    nombre: localStorage.getItem('name') + ' ' + localStorage.getItem('lastname'),
    numeroDocumento: '',
    horaSalida: '',
    horaEntrada: '',
    observaciones: '',
  };
  ngOnInit(): void {
    // Obtener el correo del líder desde localStorage
    const correoLider = localStorage.getItem('correoLider');
    if (correoLider) {
      this.permiso.emailLider = correoLider;
    }
  }
  loading: boolean = false;
  tiposPermiso: string[] = [
    'Permiso personal de todo el día',
    'Salida Temprano',
    'Entrada luego de la jornada',
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
    'Movimiento de horario',
    'Vacaciones',
    'Horas extras (en casa, fuera de las instalaciones y viajes)'
  ];

  permitidosSalida: string[] = [ 
    'Salida Temprano',
    'Cita médica',
    'Cita odontológica',
    'Movimiento de horario',
    'Horas extras (en casa, fuera de las instalaciones y viajes)'
  ];

  permitidoEntrada: string[] = [
    'Entrada luego de la jornada',
    'Llegada tarde por factores externos',
    'Cita médica',
    'Cita odontológica',
    'Movimiento de horario',
    'Horas extras (en casa, fuera de las instalaciones y viajes)'
  ];

  mostrarSalida(): boolean {
    return this.permitidosSalida.includes(this.permiso.tipo);
  }
  mostrarEntrada(): boolean {
    return this.permitidoEntrada.includes(this.permiso.tipo);
  }
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
        this.permiso;
        this.router.navigate(['/permisos']); // Redirigir a la pantalla de horas
      },
      error: (error: any) => {
        this.toastr.error('Error al crear el permiso', 'Error');
      },
    });
  }
  cancel() {
    this.location.back(); // Redirigir a la página anterior
  }
}
