import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  MsalService
} from '@azure/msal-angular';

import {
  RoleService,
  UserRole
} from '../../core/role';

import {
  CatalogService,
  CatalogServiceItem
} from '../../service/catalog.service';


@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {

  /* =====================================================
     DATOS
  ===================================================== */

  services: CatalogServiceItem[] = [];

  loading = false;

  errorMessage = '';


  constructor(
    private router: Router,
    private authService: MsalService,
    public roleService: RoleService,
    private catalogService: CatalogService,
    private changeDetector: ChangeDetectorRef
  ) {}


  /* =====================================================
     INICIO
  ===================================================== */

  ngOnInit(): void {
    // Carga directa del catálogo sin expulsiones por inicialización asíncrona de rol
    this.loadCatalog();
  }


  /* =====================================================
     CARGAR CATÁLOGO
  ===================================================== */

  loadCatalog(): void {

    this.loading = true;
    this.errorMessage = '';

    this.catalogService
      .getServices()
      .subscribe({

        next: (services: CatalogServiceItem[]) => {

          console.log('Servicios listos para Angular:', services);

          this.services = [...services];
          this.loading = false;

          this.changeDetector.detectChanges();

        },

        error: (error: unknown) => {

          console.error('Error cargando catálogo:', error);

          this.errorMessage = 'No fue posible cargar el catálogo.';
          this.loading = false;

          this.changeDetector.detectChanges();

        }

      });

  }


  /* =====================================================
     ROLES
  ===================================================== */

  get currentRole(): UserRole | null {

    return this.roleService.getRole();

  }


  get isAdmin(): boolean {

    return this.roleService.isAdmin();

  }


  get isDispatcher(): boolean {

    return this.roleService.isDispatcher();

  }


  get roleName(): string {

    if (this.currentRole === 'ADMIN') {

      return 'Administrador';

    }

    if (this.currentRole === 'DISPATCHER') {

      return 'Despachador';

    }

    return 'Cliente';

  }


  /* =====================================================
     ESTADÍSTICAS
  ===================================================== */

  get activeServices(): number {

    return this.services.filter(
      service => service.status === 'Activo' || service.activo
    ).length;

  }


  get totalCapacity(): number {

    return this.services.reduce(
      (total, service) => total + (service.capacity || service.capacidadDisponible || 0),
      0
    );

  }


  get minimumPrice(): number {

    if (this.services.length === 0) {

      return 0;

    }

    return Math.min(
      ...this.services.map(
        service => service.price || service.tarifa || 0
      )
    );

  }


  /* =====================================================
     CERRAR SESIÓN (DINÁMICO PARA LOCAL Y VERCEL)
  ===================================================== */

  logout(): void {

    this.roleService.clearActiveRole();
    sessionStorage.clear();
    localStorage.clear();

    const activeAccount =
      this.authService.instance.getActiveAccount() ||
      this.authService.instance.getAllAccounts()[0];

    const targetLogoutUri = `${window.location.origin}/login`;

    if (activeAccount) {

      this.authService.logoutRedirect({
        account: activeAccount,
        postLogoutRedirectUri: targetLogoutUri
      });

    } else {

      window.location.href = targetLogoutUri;

    }

  }

}