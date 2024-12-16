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

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit{
  editingProduct: any = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.productService.getProductById(Number(id)).subscribe((product) => {
        this.editingProduct = product;
      });
    } else {
      // Handle the case where id is null
      console.error('Product ID is null');
    }
  }

  updateProduct() {
    this.productService.updateProduct(this.editingProduct).subscribe(() => {
      this.router.navigate(['/dashBoard']);
    });
  }
  cancelEdit() {
    this.router.navigate(['/dashBoard']);
  }
}
