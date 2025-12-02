import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  constructor(private toastr: ToastrService) { }

  messageError(e: HttpErrorResponse){
    console.log('ERROR COMPLETO:', e);
    console.log('ERROR.ERROR:', e.error);
    console.log('ERROR.STATUS:', e.status);
    console.log('ERROR.MESSAGE:', e.message);
    
    if (e.error && e.error.msg) {
      this.toastr.error(e.error.msg, 'Error');
    } else if (e.error && typeof e.error === 'string') {
      this.toastr.error(e.error, 'Error');
    } else if (e.message) {
      this.toastr.error(e.message, 'Error');
    } else {
      this.toastr.error("Existe un error en el servidor o no hay conexión", "Error")
    } 
  }
}
