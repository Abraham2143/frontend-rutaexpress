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

export interface ProcessStep {
  key: ShipmentStatus;
  stepNumber: number;
  title: string;
  description: string;
}

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
  private readonly DELETED_STORAGE_KEY = 'rutaexpress_deleted_shipments';

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
     MODAL CAMBIO DE ESTADO Y OBSERVACIONES (SOLO EN RUTA)
  ===================================================== */
  showStatusModal = false;
  selectedShipmentForStatus: ShipmentResponse | null = null;
  nextStatusToApply: ShipmentStatus | null = null;
  statusComment = '';

  readonly quickObservations: string[] = [
    'Paquete verificado sin novedades.',
    'Caja presenta un hoyo leve en el costado al retirar.',
    'Embalaje con desgaste, contenido intacto.',
    'Caja sellada y en buen estado al retiro.'
  ];

  /* =====================================================
     MODAL TRAZABILIDAD (5 PROCESOS) Y COMENTARIOS
  ===================================================== */
  showDetailModal = false;
  selectedShipmentForDetail: ShipmentResponse | null = null;

  readonly processSteps: ProcessStep[] = [
    {
      key: 'CREADO',
      stepNumber: 1,
      title: 'Pedido Recibido',
      description: 'Solicitud registrada en plataforma.'
    },
    {
      key: 'ACEPTADO',
      stepNumber: 2,
      title: 'Pedido Confirmado',
      description: 'Orden validada para gestión logística.'
    },
    {
      key: 'EN_BODEGA',
      stepNumber: 3,
      title: 'Llegada a Sucursal',
      description: 'Paquete recepcionado en sucursal/bodega.'
    },
    {
      key: 'EN_RUTA',
      stepNumber: 4,
      title: 'Retiro por Chofer',
      description: 'Inspección de estado de la caja y traslado en ruta.'
    },
    {
      key: 'ENTREGADO',
      stepNumber: 5,
      title: 'Entrega Realizada',
      description: 'Pedido entregado en destino final.'
    }
  ];

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
     GESTIÓN LOCAL DE PEDIDOS ELIMINADOS
  ===================================================== */
  private getDeletedIds(): number[] {
    try {
      const raw = localStorage.getItem(this.DELETED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveDeletedId(id: number): void {
    try {
      const current = this.getDeletedIds();
      if (!current.includes(id)) {
        localStorage.setItem(
          this.DELETED_STORAGE_KEY,
          JSON.stringify([...current, id])
        );
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }

  /* =====================================================
     VALIDACIÓN DE ID DUPLICADO
  ===================================================== */
  get isDuplicateId(): boolean {
    const cleanId = this.newShipment.clienteId.trim().toLowerCase();
    if (!cleanId) return false;

    return this.shipments.some(
      s =>
        s.status !== 'CANCELADO' &&
        (s.clienteId || '').trim().toLowerCase() === cleanId
    );
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
        const deletedIds = this.getDeletedIds();
        this.shipments = shipments.filter(s => !deletedIds.includes(s.id));
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

  get activeShipmentsCount(): number {
    return this.shipments.filter(s => s.status !== 'CANCELADO').length;
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
        this.statusFilter === 'Todos'
          ? shipment.status !== 'CANCELADO'
          : shipment.status === this.statusFilter;

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

    if (this.isDuplicateId) {
      this.errorMessage = `El ID "${this.newShipment.clienteId.trim()}" ya existe. Ingresa un ID diferente.`;
      return;
    }

    const payload: CreateShipmentRequest = {
      ...this.newShipment,
      clienteId: this.newShipment.clienteId.trim()
    };

    this.saving = true;
    this.errorMessage = '';

    this.shipmentsService.createShipment(payload).subscribe({
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
     MODAL DETALLE / 5 PROCESOS Y COMENTARIOS
  ===================================================== */
  openDetailModal(shipment: ShipmentResponse): void {
    this.selectedShipmentForDetail = shipment;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedShipmentForDetail = null;
  }

  advanceFromDetail(): void {
    if (!this.selectedShipmentForDetail) return;
    const target = this.selectedShipmentForDetail;
    this.closeDetailModal();
    this.openStatusModal(target);
  }

  getStepIndex(status: ShipmentStatus): number {
    const order: ShipmentStatus[] = [
      'CREADO',
      'ACEPTADO',
      'EN_BODEGA',
      'EN_RUTA',
      'ENTREGADO'
    ];
    return order.indexOf(status);
  }

  isStepCompleted(shipmentStatus: ShipmentStatus, stepKey: ShipmentStatus): boolean {
    const currentIdx = this.getStepIndex(shipmentStatus);
    const stepIdx = this.getStepIndex(stepKey);
    return currentIdx !== -1 && stepIdx <= currentIdx;
  }

  isStepCurrent(shipmentStatus: ShipmentStatus, stepKey: ShipmentStatus): boolean {
    return shipmentStatus === stepKey;
  }

  getStepDate(shipment: ShipmentResponse, stepKey: ShipmentStatus): string {
    if (stepKey === 'CREADO') return this.formatDateTime(shipment.fechaCreacion);
    if (stepKey === 'ACEPTADO') return this.formatDateTime(shipment.fechaAceptacion);
    if (stepKey === 'ENTREGADO') return this.formatDateTime(shipment.fechaEntrega);
    if (this.isStepCompleted(shipment.status, stepKey)) return 'Completado';
    return 'Pendiente';
  }

  /* =====================================================
     MODAL CAMBIO DE ESTADO Y OBSERVACIÓN (SOLO EN RUTA)
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

  applyQuickObservation(text: string): void {
    this.statusComment = text;
  }

  confirmStatusChange(): void {
    if (!this.selectedShipmentForStatus || !this.nextStatusToApply) return;

    this.saving = true;
    this.errorMessage = '';

    const commentToSend =
      this.nextStatusToApply === 'EN_RUTA' && this.statusComment.trim()
        ? this.statusComment.trim()
        : undefined;

    this.shipmentsService
      .updateStatus(
        this.selectedShipmentForStatus.id,
        this.nextStatusToApply,
        commentToSend
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
     ELIMINAR ENVÍO
  ===================================================== */
  deleteShipment(shipment: ShipmentResponse): void {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el pedido "${shipment.clienteId}" (#${shipment.trackingNumber})?`
    );

    if (!confirmed) return;

    this.errorMessage = '';
    this.saveDeletedId(shipment.id);
    this.shipments = this.shipments.filter(item => item.id !== shipment.id);
    this.changeDetector.detectChanges();

    if (shipment.status !== 'ENTREGADO' && shipment.status !== 'CANCELADO') {
      this.shipmentsService
        .updateStatus(shipment.id, 'CANCELADO', 'Pedido eliminado por error de registro.')
        .subscribe({
          next: () => {},
          error: () => {}
        });
    }
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
      case 'CREADO': return 'Confirmar pedido';
      case 'ACEPTADO': return 'Ingresar a sucursal';
      case 'EN_BODEGA': return 'Retiro chofer (Ruta)';
      case 'EN_RUTA': return 'Marcar entregado';
      case 'ENTREGADO': return 'Completado';
      case 'CANCELADO': return 'Cancelado';
    }
  }

  getStatusLabel(status: ShipmentStatus | null): string {
    if (!status) return '-';
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

  formatDate(date: string | null): string {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString('es-CL');
  }

  formatDateTime(date: string | null): string {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error === 'string') return error.error;
    if (error?.error?.message) return error.error.message;
    return fallback;
  }
}