import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  supportSubject = 'Consulta de soporte - RutaExpress';
  supportMessage = '';
  sendingSupport = false;
  supportSent = false;
  supportError = '';

  constructor(
    private authService: MsalService,
    private http: HttpClient,
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
    this.sendingSupport = false;
    this.supportSent = false;
    this.supportError = '';
    this.supportSubject = 'Consulta de soporte - RutaExpress';
    this.supportMessage = '';
    this.showHelpModal = true;
  }

  closeHelpModal(): void {
    if (this.sendingSupport) return;
    this.showHelpModal = false;
  }

  copyAdminEmail(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('ab.neira@duocuc.cl');
      this.copiedAdminEmail = true;
    }
  }

  sendSupportEmail(): void {
    if (!this.supportMessage.trim() || this.sendingSupport) return;

    this.sendingSupport = true;
    this.supportSent = false;
    this.supportError = '';

    const payload = {
      Nombre: this.userName,
      Correo_Remitente: this.userEmail || 'No especificado',
      Rol_Activo: this.roleName,
      Mensaje: this.supportMessage.trim(),
      _subject: this.supportSubject.trim() || 'Consulta de soporte - RutaExpress',
      _replyto: this.userEmail || undefined,
      _template: 'table'
    };

    this.http.post('https://formsubmit.co/ajax/ab.neira@duocuc.cl', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).subscribe({
      next: () => {
        this.sendingSupport = false;
        this.supportSent = true;
        this.supportMessage = '';
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error enviando correo al administrador:', error);
        this.sendingSupport = false;
        this.supportError = 'No se pudo enviar el correo en este momento. Intenta nuevamente o usa Outlook Web.';
        this.changeDetector.detectChanges();
      }
    });
  }

  get outlookWebComposeUrl(): string {
    const subject = encodeURIComponent(this.supportSubject || 'Soporte RutaExpress');
    const body = encodeURIComponent(
      this.supportMessage.trim()
        ? `${this.supportMessage.trim()}\n\nEnviado por: ${this.userName} (${this.userEmail})`
        : `Hola Abraham,\n\nNecesito ayuda con la plataforma RutaExpress.\n\nEnviado por: ${this.userName} (${this.userEmail})`
    );
    return `https://outlook.office.com/mail/deeplink/compose?to=ab.neira@duocuc.cl&subject=${subject}&body=${body}`;
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