import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

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
    FormsModule,
    RouterLink
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {
  private readonly CATALOG_OVERRIDES_KEY = 'rutaexpress_catalog_overrides';

  /* =====================================================
     DATOS
  ===================================================== */

  services: CatalogServiceItem[] = [];

  loading = false;

  errorMessage = '';

  /* =====================================================
     MODAL EDICIÓN DE SERVICIO (SOLO ADMINISTRADOR)
  ===================================================== */

  showEditModal = false;

  editingService: {
    id: number;
    name: string;
    description: string;
    deliveryTime: string;
    price: number;
    capacity: number;
    status: 'Activo' | 'Inactivo';
  } | null = null;


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
    this.loadCatalog();
  }


  /* =====================================================
     PERSISTENCIA LOCAL DE CAMBIOS DEL CATÁLOGO
  ===================================================== */

  private getCatalogOverrides(): Record<string, any> {
    try {
      const raw = localStorage.getItem(this.CATALOG_OVERRIDES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveCatalogOverride(id: number, updatedFields: any): void {
    try {
      const current = this.getCatalogOverrides();
      current[id] = updatedFields;
      localStorage.setItem(this.CATALOG_OVERRIDES_KEY, JSON.stringify(current));
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }

  private applyOverrides(services: CatalogServiceItem[]): CatalogServiceItem[] {
    const overrides = this.getCatalogOverrides();
    return services.map(service =>
      overrides[service.id] ? { ...service, ...overrides[service.id] } : service
    );
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

          this.services = this.applyOverrides([...services]);
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
     EDITAR SERVICIO (SOLO ADMIN)
  ===================================================== */

  openEditModal(service: any): void {
    if (!this.isAdmin) return;

    this.editingService = {
      id: service.id,
      name: service.name || service.nombre || '',
      description: service.description || service.descripcion || '',
      deliveryTime: service.deliveryTime || service.tiempoEntrega || '',
      price: Number(service.price ?? service.tarifa ?? 0),
      capacity: Number(service.capacity ?? service.capacidadDisponible ?? 0),
      status: service.status === 'Inactivo' || service.activo === false ? 'Inactivo' : 'Activo'
    };

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingService = null;
  }

  saveServiceChanges(): void {
    if (!this.isAdmin || !this.editingService) return;

    const cleanName = this.editingService.name.trim() || `Servicio #${this.editingService.id}`;
    const cleanDescription = this.editingService.description.trim();
    const cleanDeliveryTime = this.editingService.deliveryTime.trim() || 'Estándar';
    const cleanPrice = Math.max(0, Number(this.editingService.price) || 0);
    const cleanCapacity = Math.max(0, Number(this.editingService.capacity) || 0);
    const cleanStatus = this.editingService.status;
    const isActive = cleanStatus === 'Activo';

    const updatedFields = {
      name: cleanName,
      nombre: cleanName,
      description: cleanDescription,
      descripcion: cleanDescription,
      deliveryTime: cleanDeliveryTime,
      tiempoEntrega: cleanDeliveryTime,
      price: cleanPrice,
      tarifa: cleanPrice,
      capacity: cleanCapacity,
      capacidadDisponible: cleanCapacity,
      status: cleanStatus,
      activo: isActive
    };

    this.services = this.services.map(service =>
      service.id === this.editingService!.id
        ? { ...service, ...updatedFields }
        : service
    );

    this.saveCatalogOverride(this.editingService.id, updatedFields);
    this.closeEditModal();
    this.changeDetector.detectChanges();
  }


  /* =====================================================
     ROLES Y PERMISOS
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

    if (this.currentRole === 'AUDITOR') {

      return 'Auditor';

    }

    return 'Cliente';

  }


  get canAccessShipments(): boolean {

    return this.roleService.canAccessShipments();

  }


  get canAccessCatalog(): boolean {

    return this.roleService.canAccessCatalog();

  }


  get canAccessReports(): boolean {

    return this.roleService.canAccessReports();

  }


  get canAccessAudit(): boolean {

    return this.roleService.canAccessAudit();

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
      (total, service) => total + Number(service.capacity ?? service.capacidadDisponible ?? 0),
      0
    );

  }


  get minimumPrice(): number {

    if (this.services.length === 0) {

      return 0;

    }

    return Math.min(
      ...this.services.map(
        service => Number(service.price ?? service.tarifa ?? 0)
      )
    );

  }


  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  logout(): void {
    const catalogBackup = localStorage.getItem(this.CATALOG_OVERRIDES_KEY);

    this.roleService.clearActiveRole();
    sessionStorage.clear();
    localStorage.clear();

    if (catalogBackup) {
      localStorage.setItem(this.CATALOG_OVERRIDES_KEY, catalogBackup);
    }

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