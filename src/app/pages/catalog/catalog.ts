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

  templateUrl:
    './catalog.html',

  styleUrl:
    './catalog.css'
})
export class Catalog
  implements OnInit {


  /* =====================================================
     DATOS
  ====================================================== */

  services:
    CatalogServiceItem[] = [];


  loading =
    false;


  errorMessage =
    '';


  constructor(

    private router:
      Router,

    private authService:
      MsalService,

    public roleService:
      RoleService,

    private catalogService:
      CatalogService,

    private changeDetector:
      ChangeDetectorRef

  ) {}


  /* =====================================================
     INICIO
  ====================================================== */

  ngOnInit(): void {


    if (
      !this.roleService
        .canAccessCatalog()
    ) {

      this.router.navigate([
        '/dashboard'
      ]);

      return;

    }


    this.loadCatalog();

  }


  /* =====================================================
     CARGAR CATÁLOGO
  ====================================================== */

  loadCatalog(): void {


    this.loading =
      true;


    this.errorMessage =
      '';


    this.catalogService
      .getServices()
      .subscribe({

        next: (
          services:
            CatalogServiceItem[]
        ) => {


          console.log(
            'Servicios listos para Angular:',
            services
          );


          this.services =
            [...services];


          this.loading =
            false;


          /*
            Fuerza a Angular a refrescar
            inmediatamente la pantalla
            después de recibir el backend.
          */
          this.changeDetector
            .detectChanges();

        },


        error: (
          error:
            unknown
        ) => {


          console.error(
            'Error cargando catálogo:',
            error
          );


          this.errorMessage =
            'No fue posible cargar el catálogo.';


          this.loading =
            false;


          this.changeDetector
            .detectChanges();

        }

      });

  }


  /* =====================================================
     ROLES
  ====================================================== */

  get currentRole():
    UserRole | null {

    return this.roleService
      .getRole();

  }


  get isAdmin():
    boolean {

    return this.roleService
      .isAdmin();

  }


  get isDispatcher():
    boolean {

    return this.roleService
      .isDispatcher();

  }


  get roleName():
    string {


    if (
      this.currentRole ===
      'ADMIN'
    ) {

      return 'Administrador';

    }


    if (
      this.currentRole ===
      'DISPATCHER'
    ) {

      return 'Despachador';

    }


    return 'Sin acceso';

  }


  /* =====================================================
     ESTADÍSTICAS
  ====================================================== */

  get activeServices():
    number {

    return this.services
      .filter(
        service =>
          service.status ===
          'Activo'
      )
      .length;

  }


  get totalCapacity():
    number {

    return this.services
      .reduce(

        (
          total,
          service
        ) =>
          total
          +
          service.capacity,

        0

      );

  }


  get minimumPrice():
    number {


    if (
      this.services.length === 0
    ) {

      return 0;

    }


    return Math.min(

      ...this.services.map(
        service =>
          service.price
      )

    );

  }


  /* =====================================================
     CERRAR SESIÓN
  ====================================================== */

  logout(): void {


    this.roleService
      .clearActiveRole();


    this.authService
      .logoutRedirect({

        postLogoutRedirectUri:
          'http://localhost:4200/login'

      });

  }

}