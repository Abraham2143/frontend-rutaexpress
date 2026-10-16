import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Shipments } from './pages/shipments/shipments';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [MsalGuard] },
  { path: 'shipments', component: Shipments, canActivate: [MsalGuard] },
  { path: 'catalog', component: Shipments, canActivate: [MsalGuard] },
  { path: 'catalogo', component: Shipments, canActivate: [MsalGuard] },
  { path: '', component: Dashboard, canActivate: [MsalGuard] },
  { path: '**', redirectTo: 'dashboard' }
];