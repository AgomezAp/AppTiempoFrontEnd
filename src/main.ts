import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { tokenInterceptor } from './app/utils/token.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig, // Mantén todas las configuraciones actuales de appConfig
  providers: [
    ...appConfig.providers,  // Mantén los proveedores ya definidos en appConfig
    provideAnimations(), 
    provideHttpClient(),  
    provideHttpClient(withInterceptors([tokenInterceptor])),   // Agrega el proveedor de animaciones
    provideToastr({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),          // Agrega el proveedor de Toastr
  ]
})
  .catch((err) => console.error(err));
