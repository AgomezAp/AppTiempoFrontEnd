import {
  CommonModule,
  Location,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [CommonModule,RouterLink],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent {
  constructor(private location: Location) {}
  goBack(): void {
    this.location.back();
  }
}
