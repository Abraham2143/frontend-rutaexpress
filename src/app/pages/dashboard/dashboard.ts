import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import {
  RoleService,
  UserRole
} from '../../core/role';
import {
  ShipmentResponse,
  ShipmentsService,
  ShipmentStatus
} from '../../service/shipments.service';
import { CatalogService } from '../../service/catalog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly DELETED_STORAGE_KEY = 'rutaexpress_deleted_shipments';
  private readonly CATALOG_OVERRIDES_KEY = 'rutaexpress_catalog_overrides';

  userName = 'Usuario';
  userEmail = '';
  userInitial = 'U';

  shipments: ShipmentResponse[] = [];
  catalogServices: any[] = [];
  loadingShipments = false;

  showHelpModal = false;
  copiedAdminEmail = false;

  constructor(
    private authService: MsalService,
    public roleService: RoleService,
    private shipmentsService: ShipmentsService,
    private catalogService: CatalogService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const account =
      this.authService.instance.getActiveAccount()
      ??
      this.authService.instance.getAllAccounts()[0];

    if (account) {
      this.userName = account.name ?? 'Usuario';
      this.userEmail = account.username ?? '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }

    this.loadCatalogServices();
    this.loadShipments();
  }

  /* =========================
     MODAL AYUDA ADMINISTRADOR
  ========================== */
  openHelpModal(): void {
    this.copiedAdminEmail = false;
    this.showHelpModal = true;
  }

  closeHelpModal(): void {
    this.showHelpModal = false;
  }

  copyAdminEmail(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('ab.neira@duocuc.cl');
      this.copiedAdminEmail = true;
    }
  }

  /* =========================
     DATOS REALES (ENVÍOS Y CATÁLOGO)
  ========================== */
  private getDeletedIds(): number[] {
    try {
      const raw = localStorage.getItem(this.DELETED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private applyCatalogOverrides(services: any[]): any[] {
    try {
      const raw = localStorage.getItem(this.CATALOG_OVERRIDES_KEY);
      if (!raw) return services;
      const overrides = JSON.parse(raw) as Record<string, any>;
      return services.map(s => (overrides[s.id] ? { ...s, ...overrides[s.id] } : s));
    } catch {
      return services;
    }
  }

  loadCatalogServices(): void {
    const fallbackServices = [
      { id: 1, nombre: 'Estándar', name: 'Estándar' },
      { id: 2, nombre: 'Express', name: 'Express' },
      { id: 3, nombre: 'Same Day', name: 'Same Day' }
    ];

    this.catalogService.getServices().subscribe({
      next: (services: any[]) => {
        const base = services && services.length > 0 ? services : fallbackServices;
        this.catalogServices = this.applyCatalogOverrides(base);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.catalogServices = this.applyCatalogOverrides(fallbackServices);
        this.changeDetector.detectChanges();
      }
    });
  }

  loadShipments(): void {
    this.loadingShipments = true;

    this.shipmentsService.getShipments().subscribe({
      next: (data) => {
        const deletedIds = this.getDeletedIds();
        this.shipments = data.filter(
          s => s.status !== 'CANCELADO' && !deletedIds.includes(s.id)
        );
        this.loadingShipments = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando envíos en Dashboard:', error);
        this.loadingShipments = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  get totalShipmentsCount(): number {
    return this.shipments.length;
  }

  get waitingDispatchCount(): number {
    return this.shipments.filter(
      s => s.status === 'CREADO' || s.status === 'ACEPTADO' || s.status === 'EN_BODEGA'
    ).length;
  }

  get inRouteCount(): number {
    return this.shipments.filter(s => s.status === 'EN_RUTA').length;
  }

  get deliveredCount(): number {
    return this.shipments.filter(s => s.status === 'ENTREGADO').length;
  }

  get attentionShipments(): ShipmentResponse[] {
    return this.shipments
      .filter(s => s.status !== 'ENTREGADO')
      .slice(0, 6);
  }

  get recentShipments(): ShipmentResponse[] {
    return this.shipments.slice(0, 6);
  }

  getStatusLabel(status: ShipmentStatus): string {
    switch (status) {
      case 'CREADO': return '1. Recibido (Pendiente)';
      case 'ACEPTADO': return '2. Confirmado';
      case 'EN_BODEGA': return '3. En sucursal';
      case 'EN_RUTA': return '4. En ruta';
      case 'ENTREGADO': return '5. Entregado';
      case 'CANCELADO': return 'Cancelado';
    }
  }

  getServiceName(servicioId: number): string {
    const found = this.catalogServices.find(s => s.id === servicioId);
    if (found) {
      return found.nombre || found.name || `Servicio #${servicioId}`;
    }
    return `Servicio #${servicioId}`;
  }

  /* =========================
     ROLES
  ========================== */
  get currentRole(): UserRole | null {
    return this.roleService.getRole();
  }

  get assignedRoles(): UserRole[] {
    return this.roleService.getAssignedRoles();
  }

  get hasMultipleRoles(): boolean {
    return this.assignedRoles.length > 1;
  }

  changeRole(role: UserRole): void {
    this.roleService.setRole(role);
  }

  getRoleName(role: UserRole): string {
    const names: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      DISPATCHER: 'Despachador',
      CLIENT: 'Cliente',
      AUDITOR: 'Auditor'
    };

    return names[role];
  }

  get roleName(): string {
    const role = this.currentRole;

    if (!role) {
      return 'Sin rol asignado';
    }

    return this.getRoleName(role);
  }

  get isAdmin(): boolean {
    return this.roleService.isAdmin();
  }

  get isDispatcher(): boolean {
    return this.roleService.isDispatcher();
  }

  get isClient(): boolean {
    return this.roleService.isClient();
  }

  get isAuditor(): boolean {
    return this.roleService.isAuditor();
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

  /* =========================
     CERRAR SESIÓN
  ========================== */
  logout(): void {
    const deletedBackup = localStorage.getItem(this.DELETED_STORAGE_KEY);
    const catalogBackup = localStorage.getItem(this.CATALOG_OVERRIDES_KEY);

    sessionStorage.clear();
    localStorage.clear();

    if (deletedBackup) {
      localStorage.setItem(this.DELETED_STORAGE_KEY, deletedBackup);
    }
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