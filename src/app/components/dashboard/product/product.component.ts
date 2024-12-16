import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'dashboard-product',
  imports: [CommonModule,FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  listProducts: any[] = [];
  showAddForm: boolean = false;
  newProduct: any = {
    name: '',
    brand: '',
    category: '',
    price: null,
    quantity: null
  };
  editingProduct: any = null;

  constructor(private productService: ProductService,private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProduct().subscribe((data: any[]) => {
      this.listProducts = data;
    });
  }

  navigateToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  navigateToEditProduct(id: number) {
    localStorage.setItem('productId', id.toString());
    console.log('Product ID:', id);
    this.router.navigate(['/edit-product', id]);
  }

  navigateToDeleteProduct(id: number) {
    this.router.navigate(['/delete-product', id]);
  }
}