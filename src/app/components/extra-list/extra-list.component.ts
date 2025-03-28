import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { NovedadService } from '../../services/novedad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Extra, Novedad } from '../../interfaces/hora'
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
      private router: Router) {}

  
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
      console.log(dataE)
      this.novedadService.verNovedad().subscribe((dataN: Novedad[]) => {
        console.log(dataN)

        this.listExtra = dataE.map(extra => {
          const novedadEncontrada = dataN.filter(n => n.Nid === extra.Sid).map(n => n.description);
          return { ...extra, observaciones: novedadEncontrada.length > 0 ?  novedadEncontrada : ['sin observacion']};
        });
        this.filterdExtra = this.listExtra;
        console.log(this.filterdExtra)
        console.log(this.listExtra)
        this.loading = false;
      });
    });
  }
}
