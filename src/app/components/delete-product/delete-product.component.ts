import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-delete-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-product.component.html',
  styleUrl: './delete-product.component.css'
})
export class DeleteProductComponent implements OnInit {
  productId!: number;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
  }

  deleteProduct() {
    this.productService.deleteProduct(this.productId).subscribe(
      () => {
        this.toastr.success('Producto eliminado exitosamente');
        this.router.navigate(['/dashBoard']);
      },
      (error) => {
        this.toastr.error('Error al eliminar el producto');
        console.error(error);
      }
    );
  }
  cancelDelete() {
    this.router.navigate(['/dashBoard']);
  }
}
