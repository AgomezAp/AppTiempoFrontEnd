import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { NovedadService } from '../../services/novedad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Extra, Novedad } from '../../interfaces/hora'
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-extra-list',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './extra-list.component.html',
  styleUrl: './extra-list.component.css'
})
export class ExtraListComponent implements OnInit {
  loading: boolean = false;
  listExtra: Extra[] = [];
  listNovedad: Novedad[] = [];
  filterdExtra: any[] = [];
  filterdNovedad: any[] = [];

  constructor(
      private horaService: HoraService,
      private novedadService: NovedadService,
      private route: ActivatedRoute,
      private router: Router,
      private toastr: ToastrService) {}

  
  ngOnInit(): void {
    this.loadData();
  }

  loadExtra(): void {
    this.loading = true
    this.horaService.getExtra().subscribe((data: Extra[]) => {
      this.listExtra = data;
      this.filterdExtra = data;
      this.loading=false;
    });
  }
  loadNovedad(): void {
    this.loading = true
    this.novedadService.verNovedad().subscribe((data: Novedad[]) => {
      this.listNovedad = data;
      this.filterdNovedad = data;
      this.loading = false
    })
  }

  loadData(): void {
    this.horaService.getExtra().subscribe((dataE: Extra[]) => {
      this.novedadService.verNovedad().subscribe((dataN: Novedad[]) => {

        this.listExtra = dataE.map(extra => {
          const novedadEncontrada = dataN.filter(n => n.Nid === extra.Sid).map(n => n.description);
          const [hours, minutes] = extra.Acumulado.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes;
          const days = totalMinutes < 0 ? Math.ceil(totalMinutes/ (8.5 * 60)) :Math.floor(totalMinutes / (8.5 * 60));
          const remainingHours = totalMinutes < 0 ? Math.ceil((totalMinutes % (8.5 * 60))/60) : Math.floor((totalMinutes % (8.5 * 60)) / 60);
          const remainingMinutes = totalMinutes % 60;
          const acumuladoEnDias = `${days} días, ${remainingHours} horas, ${remainingMinutes} minutos`;
          return { 
            ...extra, 
            observaciones: novedadEncontrada.length > 0 ? novedadEncontrada : ['sin observacion'],
            acumuladoEnDias
          };
        });
        this.filterdExtra = this.listExtra;
        console.log(this.filterdExtra)
        this.loading = false;
      });
    });
  }
  openModal(extra: Extra): void {
    console.log("Open Modal", extra)
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.borderRadius = '8px';
    modal.style.width = '400px';
    modal.style.maxWidth = '90%';
    modal.style.textAlign = 'center';

    const title = document.createElement('h2');
    title.textContent = 'Detalles del Extra';
    title.style.marginBottom = '20px';
    title.style.fontSize = '1.5rem';
    title.style.color = '#333';
    modal.appendChild(title);

    const content = document.createElement('div');
    content.innerHTML = `
      <label><strong>Nombre:</strong> <input style="margin-bottom: 15px" type="text" value="${extra.Name || ''}" readonly></label>
      <label><strong>Acumulado:</strong> <input style="margin-bottom: 15px" id="acumuladoInput" type="text" value="${extra?.Acumulado || ''}"></label>
    `;
    content.style.display = 'block';
    content.style.marginBottom = '10px';
    content.style.fontWeight = 'bold';
    content.style.textAlign = 'left';
    content.style.width = '100%';
    content.style.padding = '8px';
    content.style.border = '1px solid #ccc';
    content.style.borderRadius = '4px';
    content.style.fontSize = '1rem';

    modal.appendChild(content);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.style.marginRight = '10px';
    saveButton.style.padding = '10px 20px';
    saveButton.style.fontSize = '1rem';
    saveButton.style.border = 'none'
    saveButton.style.borderRadius = '4px'
    saveButton.style.cursor = 'pointer'
    saveButton.style.transition = 'background-color 0.3s ease'
    saveButton.style.color = 'white';
    saveButton.style.backgroundColor = '#28a745';
    saveButton.addEventListener('mouseover', () => {
      saveButton.style.backgroundColor = '#218838';
      saveButton.style.opacity = '0.9s'
    });
    saveButton.addEventListener('mouseout', () => {
      saveButton.style.backgroundColor = '#28a745';
      saveButton.style.color = 'white';
      saveButton.style.marginRight = '10px'
    });

    saveButton.addEventListener('click', () => {
      const acumuladoInput = (document.getElementById('acumuladoInput') as HTMLInputElement).value;
      this.horaService.updateExtra(extra.Sid.toString(), acumuladoInput).subscribe({
        next: () => {
          this.toastr.success('Datos actualizados con éxito');
          document.body.removeChild(modal);
          document.body.removeChild(overlay);
          this.loadData();
        },
        error: (err) => {
          console.error('Error al actualizar los datos',err);
          alert('Error al actualizar')
        }
      });
    });
    modal.appendChild(saveButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.marginRight = '10px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.fontSize = '1rem';
    closeButton.style.border = 'none'
    closeButton.style.borderRadius = '4px'
    closeButton.style.cursor = 'pointer'
    closeButton.style.transition = 'background-color 0.3s ease';
    closeButton.style.color = 'white';
    closeButton.style.backgroundColor = '#dc3545';
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.backgroundColor = '#c82333';
      closeButton.style.opacity = '0.9s'
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.backgroundColor = '#dc3545';
      closeButton.style.color = 'white';
    });
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });
    modal.appendChild(closeButton);


    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    overlay.addEventListener('click', () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }
}
