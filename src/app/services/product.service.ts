import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
 private appUrl : string;
 private apiUrl : string;
  constructor(private http:HttpClient) { 
    this.appUrl= environment.apiUrl
    this.apiUrl = 'api/product'
  }

  getProduct():Observable<Product[]>{
    return this.http.get<Product[]>(`${this.appUrl}${this.apiUrl}/ObtenerInventario`)
  }
  createProduct(product:Product):Observable<Product>{
    return this.http.post<Product>(`${this.appUrl}${this.apiUrl}/register`, product)
  }

  updateProduct( id:number, product: Product): Observable<Product> {
    return this.http.patch<Product>(`${this.appUrl}${this.apiUrl}/actualizar/${id}`, product);
  }

  deleteProduct(id:number):Observable<Product>{
    return this.http.delete<Product>(`${this.appUrl}${this.apiUrl}/delete/${id}`)
  }
  getProductById(id:number):Observable<Product>{
    return this.http.get<Product>(`${this.appUrl}${this.apiUrl}/obtener/${id}`)
  }
  
}
