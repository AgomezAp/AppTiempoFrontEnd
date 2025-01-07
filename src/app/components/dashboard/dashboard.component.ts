import { Component } from '@angular/core';

import { HorasComponent } from '../horas/horas.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent,ProductComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
