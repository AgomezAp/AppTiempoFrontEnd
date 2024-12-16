import {
  CanDeactivateFn,
  Router,
} from '@angular/router';

import {
  DashboardComponent,
} from '../components/dashboard/dashboard.component';
import { GuardService } from '../services/guard.service';

export const guardGuard: CanDeactivateFn<DashboardComponent> = (component, currentRoute, currentState, nextState) => {
 
  const authGuard = new GuardService(new Router)

  return authGuard.desactivar();
};
