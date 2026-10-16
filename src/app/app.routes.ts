import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Shipments } from './pages/shipments/shipments';
import { Catalog } from './pages/catalog/catalog';
import { AuthCallback } from './pages/auth-callback/auth-callback';

export const routes: Routes = [
  { path: 'auth/callback', component: AuthCallback },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [MsalGuard] },
  { path: 'shipments', component: Shipments, canActivate: [MsalGuard] },
  { path: 'catalog', component: Catalog, canActivate: [MsalGuard] },
  { path: 'catalogo', component: Catalog, canActivate: [MsalGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];