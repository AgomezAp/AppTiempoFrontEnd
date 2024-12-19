import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ChartData,
  ChartOptions,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductService } from '../../../services/product.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'dashboard-product',
  standalone: true,
  imports: [CommonModule, FormsModule,BaseChartDirective,SpinnerComponent,NgxPaginationModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  listProducts: any[] = [];
  showAddForm: boolean = false;
  filteredProducts: any[] = [];
  filterText: string = '';
  totalQuantity: number = 0;
  loading: boolean = false;

  // Datos del gráfico
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = { responsive: true };

  editingProduct: any = null;
  sortOrder: string = 'asc';

  p: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadProducts();
  }
  
  updateChartData(): void {
    this.barChartData.labels = this.filteredProducts.map(product => product.name);
    this.barChartData.datasets[0].data = this.filteredProducts.map(product => product.quantity);
  }

  loadProducts() {
    this.productService.getProduct().subscribe((data: any[]) => {
      this.listProducts = data;
      this.updateChart();
      this.filteredProducts = data;
      this.updateChartData();
      this.updateTotalQuantity();
      this.loading = false;
      console.log(data);
    });
  }

  updateTotalQuantity(): void {
    this.totalQuantity = this.filteredProducts.reduce((sum, product) => sum + product.quantity, 0);
    this.loading = false;
  }

  applyFilter(): void {
    this.filteredProducts = this.listProducts.filter(product => 
      product.category.toLowerCase().includes(this.filterText.toLowerCase())
    );
    this.updateChartData();
    this.updateTotalQuantity();
  }

  sortProducts(order: string): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredProducts.sort((a, b) => a.quantity - b.quantity);
    } else if (order === 'desc') {
      this.filteredProducts.sort((a, b) => b.quantity - a.quantity);
    }
    this.updateChartData();
  }
  
  updateChart() {
    // Agrupar por categoría y sumar las cantidades
    const productCategoryMap: { [key: string]: number } = {};

    this.listProducts.forEach((product) => {
      const category = product.category || 'Sin categoría';
      productCategoryMap[category] =
        (productCategoryMap[category] || 0) + product.quantity;
    });

    // Convertir los datos a formato compatible con el gráfico
    const labels = Object.keys(productCategoryMap);
    const data = Object.values(productCategoryMap);

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Cantidad de Productos por Categoría',
          data: data,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1,
        },
      ],
    };
  }

  navigateToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  navigateToEditProduct(id: number) {
    localStorage.setItem('productId', id.toString());
    this.router.navigate(['/edit-product', id]);
  }

  navigateToDeleteProduct(id: number) {
    this.router.navigate(['/delete-product', id]);
  }
}
