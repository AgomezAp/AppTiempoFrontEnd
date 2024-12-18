import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';

import { ProductService } from '../../services/product.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule,SpinnerComponent],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent  {
  newProduct: any = {
    name: '',
    brand: '',
    category: '',
    price: null,
    quantity: null
  };
  loading: boolean = false;
  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  addProduct() {
    // Generar el código QR con los datos completos del producto
    this.loading = true;
    const productData = {
      name: this.newProduct.name,
      brand: this.newProduct.brand,
      category: this.newProduct.category,
      price: this.newProduct.price,
      quantity: this.newProduct.quantity
    };

    QRCode.toDataURL(JSON.stringify(productData), { errorCorrectionLevel: 'L' }, (err, url) => {
      if (err) {
        this.loading = true;
        console.error(err);
        this.toastr.error('Error al generar el código QR');
        return;
      }
      this.newProduct.qrCode = url;
      localStorage.setItem('productQRCode', url);
      // Guardar el producto con el código QR
      this.productService.createProduct(this.newProduct).subscribe(
        () => {
          this.toastr.success('Producto creado exitosamente');
          this.loading = true;
          this.openQRCodeWindow(url);
        },
        (error) => {
          this.toastr.error('Error al crear el producto');
          this.loading = true;
        }
      );
    });
  }
  openQRCodeWindow(qrCodeUrl: string): void {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      this.loading = true;
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Código QR</title>
            <style>
              body { text-align: center; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
              .button-container { margin-top: 20px; }
              button { margin: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer; }
              .btn-print { background-color: #4CAF50; color: white; border: none; }
              .btn-dashboard { background-color: #008CBA; color: white; border: none; }
            </style>
          </head>
          <body>
            <h3>Código QR Generado</h3>
            <img src="${qrCodeUrl}" alt="Código QR">
            <div class="button-container">
              <button class="btn-print" onclick="window.print()">Imprimir</button>
              <button class="btn-dashboard" onclick="window.close(); window.opener.location.href='/dashBoard';">Volver al Dashboard</button>
            </div>
          </body>
        </html>
      `);
    printWindow.document.close();
  }
  this.loading = false;
}
/* 
  openQRCodeWindow(qrCodeUrl: string): void {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Código QR</title>
          <style>
            body { text-align: center; }
            img { max-width: 100%; height: auto; }
            button { margin-top: 10px; padding: 10px 20px; font-size: 16px; }
          </style>
        </head>
        <body>
          <h3>Código QR Generado</h3>
          <img src="${qrCodeUrl}" alt="Código QR">
          <button onclick="window.print()">Imprimir</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  } */

  cancel() {
    this.loading = true;
    this.router.navigate(['/dashBoard']);
  }
}