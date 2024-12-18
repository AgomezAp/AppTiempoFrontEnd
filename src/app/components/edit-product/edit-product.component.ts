import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, FormsModule,SpinnerComponent],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit {
  editingProduct: Product = {
    id: 0,
    name: '',
    brand: '',
    category: '',
    price: 0,
    quantity: 0
  };
  loading: boolean = false;
  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = localStorage.getItem('productId');
    console.log('ID recuperado del localStorage:', id); // Asegúrate de que este valor no sea null o undefined
    if (id) {
      try {
        const response = await firstValueFrom(this.productService.getProductById(+id));
        console.log('Respuesta completa del backend:', response);
        this.loading = false;
  
        // Extraer el producto y asignar manualmente el id
        this.editingProduct = response; 
        this.editingProduct.id = response.id || +id; // Asegura que el ID se asigne correctamente
        console.log('Producto asignado a editingProduct:', this.editingProduct);
      } catch (error) {
        this.loading = true;
        this.toastr.error('Error al cargar el producto');
        console.error('Error al obtener el producto:', error);
      }
    } else {
      console.error('Product ID is null');
      this.loading = true;
    }
  }
  

  async updateProduct(): Promise<void> {
    console.log('ID del producto a actualizar:', this.editingProduct.id);
    try {
      this.loading = true;
      await firstValueFrom(this.productService.updateProduct(this.editingProduct.id, this.editingProduct));
      this.toastr.success('Producto actualizado exitosamente');
      this.router.navigate(['/dashBoard']);
    } catch (error) {
      this.toastr.error('Error al actualizar el producto');
      console.error(error);
    this.loading = true;

    }
    this.loading = false;

  }

  cancelEdit() {
    this.router.navigate(['/dashBoard']);
  }
}