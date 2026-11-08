import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RoleService, UserRole } from '../../core/role';
import {
  CreateShipmentRequest,
  ShipmentResponse,
  ShipmentsService,
  ShipmentStatus
} from '../../service/shipments.service';
import { CatalogService } from '../../service/catalog.service';

@Component({
  selector: 'app-shipments',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css'
})
export class Shipments implements OnInit {
  /* =====================================================
     DATOS
  ===================================================== */
  shipments: ShipmentResponse[] = [];
  catalogServices: any[] = [];
  searchTerm = '';
  statusFilter: 'Todos' | ShipmentStatus = 'Todos';

  showModal = false;
  loading = false;
  saving = false;
  errorMessage = '';

  /* =====================================================
     MODAL CAMBIO DE ESTADO Y OBSERVACIONES
  ===================================================== */
  showStatusModal = false;
  selectedShipmentForStatus: ShipmentResponse | null = null;
  nextStatusToApply: ShipmentStatus | null = null;
  statusComment = '';

  /* =====================================================
     NUEVO ENVÍO
  ===================================================== */
  newShipment: CreateShipmentRequest = {
    clienteId: '',
    destinatarioNombre: '',
    destinatarioEmail: '',
    direccionOrigen: '',
    direccionDestino: '',
    servicioId: 1
  };

  constructor(
    public roleService: RoleService,
    private shipmentsService: ShipmentsService,
    private catalogService: CatalogService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadShipments();
    this.loadCatalogServices();
  }

  /* =====================================================
     CARGAR SERVICIOS DEL CATÁLOGO
  ===================================================== */
  loadCatalogServices(): void {
    const fallbackServices = [
      { id: 1, nombre: 'Envío Express 24h', name: 'Envío Express 24h', tiempoEntrega: '24 horas', deliveryTime: '24 horas', tarifa: 4990, fare: 4990 },
      { id: 2, nombre: 'Envío Estándar Nacional', name: 'Envío Estándar Nacional', tiempoEntrega: '48 a 72 horas', deliveryTime: '48 a 72 horas', tarifa: 2990, fare: 2990 },
      { id: 3, nombre: 'Envío Prioritario Bodega', name: 'Envío Prioritario Bodega', tiempoEntrega: '12 horas', deliveryTime: '12 horas', tarifa: 7990, fare: 7990 }
    ];

    this.catalogService.getServices().subscribe({
      next: (services: any[]) => {
        if (services && services.length > 0) {
          this.catalogServices = services;
        } else {
          this.catalogServices = fallbackServices;
        }

        if (this.catalogServices.length > 0 && this.catalogServices[0].id) {
          this.newShipment.servicioId = this.catalogServices[0].id;
        }
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando servicios del catálogo, usando fallback:', error);
        this.catalogServices = fallbackServices;
        this.newShipment.servicioId = fallbackServices[0].id;
        this.changeDetector.detectChanges();
      }
    });
  }

  /* =====================================================
     CARGAR ENVÍOS REALES
  ===================================================== */
  loadShipments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.shipmentsService.getShipments().subscribe({
      next: (shipments) => {
        this.shipments = [...shipments];
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando envíos:', error);
        this.errorMessage = 'No fue posible cargar los envíos.';
        this.loading = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  /* =====================================================
     ROLES Y PERMISOS
  ===================================================== */
  get currentRole(): UserRole | null {
    return this.roleService.getRole();
  }

  changeRole(role: UserRole): void {
    this.roleService.setRole(role);
  }

  get roleName(): string {
    if (this.currentRole === 'ADMIN') return 'Administrador';
    if (this.currentRole === 'DISPATCHER') return 'Despachador';
    return 'Cliente';
  }

  get canCreateShipment(): boolean {
    return this.roleService.canCreateShipment();
  }

  get canChangeStatus(): boolean {
    return this.roleService.canChangeShipmentStatus();
  }

  get canAccessCatalog(): boolean {
    return this.roleService.canAccessCatalog();
  }

  get pendingCount(): number {
    return this.shipments.filter(shipment => shipment.status === 'CREADO').length;
  }

  get filteredShipments(): ShipmentResponse[] {
    const text = this.searchTerm.trim().toLowerCase();

    return this.shipments.filter(shipment => {
      const matchesSearch =
        shipment.trackingNumber.toLowerCase().includes(text) ||
        shipment.destinatarioNombre.toLowerCase().includes(text) ||
        shipment.direccionDestino.toLowerCase().includes(text) ||
        shipment.clienteId.toLowerCase().includes(text);

      const matchesStatus =
        this.statusFilter === 'Todos' || shipment.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  /* =====================================================
     MODAL CREAR ENVÍO
  ===================================================== */
  openModal(): void {
    if (!this.canCreateShipment) return;
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    if (this.saving) return;
    this.showModal = false;
  }

  createShipment(): void {
    if (!this.canCreateShipment) return;

    if (
      !this.newShipment.clienteId.trim() ||
      !this.newShipment.destinatarioNombre.trim() ||
      !this.newShipment.destinatarioEmail.trim() ||
      !this.newShipment.direccionOrigen.trim() ||
      !this.newShipment.direccionDestino.trim() ||
      !this.newShipment.servicioId
    ) {
      this.errorMessage = 'Debes completar todos los campos.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.shipmentsService.createShipment(this.newShipment).subscribe({
      next: (shipment) => {
        this.shipments = [shipment, ...this.shipments];
        this.resetForm();
        this.saving = false;
        this.showModal = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error creando envío:', error);
        this.errorMessage = this.getErrorMessage(
          error,
          'No fue posible registrar el envío.'
        );
        this.saving = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  private resetForm(): void {
    const defaultServicioId =
      this.catalogServices.length > 0 && this.catalogServices[0].id
        ? this.catalogServices[0].id
        : 1;

    this.newShipment = {
      clienteId: '',
      destinatarioNombre: '',
      destinatarioEmail: '',
      direccionOrigen: '',
      direccionDestino: '',
      servicioId: defaultServicioId
    };
  }

  /* =====================================================
     MODAL CAMBIO DE ESTADO Y OBSERVACIÓN
  ===================================================== */
  openStatusModal(shipment: ShipmentResponse): void {
    if (!this.canChangeStatus) return;

    const next = this.getNextStatus(shipment.status);
    if (!next) return;

    this.selectedShipmentForStatus = shipment;
    this.nextStatusToApply = next;
    this.statusComment = '';
    this.errorMessage = '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    if (this.saving) return;
    this.showStatusModal = false;
    this.selectedShipmentForStatus = null;
    this.nextStatusToApply = null;
  }

  confirmStatusChange(): void {
    if (!this.selectedShipmentForStatus || !this.nextStatusToApply) return;

    this.saving = true;
    this.errorMessage = '';

    this.shipmentsService
      .updateStatus(
        this.selectedShipmentForStatus.id,
        this.nextStatusToApply,
        this.statusComment
      )
      .subscribe({
        next: (updatedShipment) => {
          const index = this.shipments.findIndex(
            item => item.id === updatedShipment.id
          );

          if (index !== -1) {
            this.shipments[index] = updatedShipment;
            this.shipments = [...this.shipments];
          }

          this.saving = false;
          this.closeStatusModal();
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible cambiar el estado.'
          );
          this.saving = false;
          this.changeDetector.detectChanges();
        }
      });
  }

  /* =====================================================
     UTILIDADES DE ESTADO Y FORMATO
  ===================================================== */
  getNextStatus(status: ShipmentStatus): ShipmentStatus | null {
    switch (status) {
      case 'CREADO': return 'ACEPTADO';
      case 'ACEPTADO': return 'EN_BODEGA';
      case 'EN_BODEGA': return 'EN_RUTA';
      case 'EN_RUTA': return 'ENTREGADO';
      default: return null;
    }
  }

  getActionLabel(status: ShipmentStatus): string {
    switch (status) {
      case 'CREADO': return 'Aceptar';
      case 'ACEPTADO': return 'Enviar a bodega';
      case 'EN_BODEGA': return 'Despachar';
      case 'EN_RUTA': return 'Entregar';
      case 'ENTREGADO': return 'Completado';
      case 'CANCELADO': return 'Cancelado';
    }
  }

  getStatusLabel(status: ShipmentStatus): string {
    switch (status) {
      case 'CREADO': return 'Pendiente';
      case 'ACEPTADO': return 'Aceptado';
      case 'EN_BODEGA': return 'En bodega';
      case 'EN_RUTA': return 'En tránsito';
      case 'ENTREGADO': return 'Entregado';
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

  formatDate(date: string | null): string {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString('es-CL');
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error === 'string') return error.error;
    if (error?.error?.message) return error.error.message;
    return fallback;
  }
}