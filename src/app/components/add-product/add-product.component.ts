import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  newProduct: any = {
    name: '',
    brand: '',
    category: '',
    price: null,
    quantity: null
  };

  constructor(private productService: ProductService, private router: Router) {}

  addProduct() {
    this.productService.createProduct(this.newProduct).subscribe(() => {
      this.router.navigate(['/dashBoard']);
    });
  }
  cancel() {
    this.router.navigate(['/dashBoard']);
  }
}
