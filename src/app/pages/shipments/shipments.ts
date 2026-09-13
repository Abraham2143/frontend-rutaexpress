import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  RoleService,
  UserRole
} from '../../core/role';


interface Shipment {
  id: string;
  destinatario: string;
  direccion: string;
  comuna: string;
  servicio: string;
  estado: string;
  fecha: string;
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
export class Shipments {

  searchTerm = '';
  statusFilter = 'Todos';

  showModal = false;


  /* =========================
     ENVÍOS DE PRUEBA
  ========================== */

  shipments: Shipment[] = [

    {
      id: 'RX-1024',
      destinatario: 'Camila González',
      direccion: 'Av. Providencia 1234',
      comuna: 'Providencia',
      servicio: 'Express',
      estado: 'En tránsito',
      fecha: '13/09/2026'
    },

    {
      id: 'RX-1023',
      destinatario: 'Felipe Muñoz',
      direccion: 'Av. Apoquindo 4500',
      comuna: 'Las Condes',
      servicio: 'Same Day',
      estado: 'Entregado',
      fecha: '13/09/2026'
    },

    {
      id: 'RX-1022',
      destinatario: 'Daniela Soto',
      direccion: 'Irarrázaval 2200',
      comuna: 'Ñuñoa',
      servicio: 'Estándar',
      estado: 'Pendiente',
      fecha: '12/09/2026'
    },

    {
      id: 'RX-1021',
      destinatario: 'Martín Rojas',
      direccion: 'Gran Avenida 3560',
      comuna: 'San Miguel',
      servicio: 'Express',
      estado: 'En tránsito',
      fecha: '12/09/2026'
    }

  ];


  /* =========================
     FORMULARIO NUEVO ENVÍO
  ========================== */

  newShipment = {
    destinatario: '',
    direccion: '',
    comuna: '',
    servicio: 'Estándar'
  };


  /* =========================
     SERVICIO DE ROLES
  ========================== */

  constructor(
    public roleService: RoleService
  ) {}


  /* =========================
     ROL ACTUAL
  ========================== */

  get currentRole(): UserRole {
    return this.roleService.getRole();
  }


  changeRole(role: UserRole): void {
    this.roleService.setRole(role);
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


  /* =========================
     PERMISOS SEGÚN EL CASO
  ========================== */

  get canCreateShipment(): boolean {
    return this.roleService.canCreateShipment();
  }


  get canChangeStatus(): boolean {
    return this.roleService.canChangeShipmentStatus();
  }


  get canAccessCatalog(): boolean {
    return this.roleService.canAccessCatalog();
  }


  /* =========================
     CONTADORES
  ========================== */

  get pendingCount(): number {

    return this.shipments.filter(
      shipment =>
        shipment.estado === 'Pendiente'
    ).length;

  }


  /* =========================
     FILTRO DE ENVÍOS
  ========================== */

  get filteredShipments(): Shipment[] {

    return this.shipments.filter(shipment => {

      const text =
        this.searchTerm.toLowerCase();

      const matchesSearch =
        shipment.id
          .toLowerCase()
          .includes(text) ||

        shipment.destinatario
          .toLowerCase()
          .includes(text) ||

        shipment.comuna
          .toLowerCase()
          .includes(text);


      const matchesStatus =
        this.statusFilter === 'Todos' ||
        shipment.estado === this.statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }


  /* =========================
     ABRIR NUEVO ENVÍO
  ========================== */

  openModal(): void {

    // Solo Cliente y Despachador
    // pueden crear envíos.
    if (!this.canCreateShipment) {
      return;
    }

    this.showModal = true;
  }


  /* =========================
     CERRAR FORMULARIO
  ========================== */

  closeModal(): void {
    this.showModal = false;
  }


  /* =========================
     CREAR ENVÍO
  ========================== */

  createShipment(): void {

    // Seguridad visual de demostración.
    if (!this.canCreateShipment) {
      return;
    }


    if (
      !this.newShipment.destinatario ||
      !this.newShipment.direccion ||
      !this.newShipment.comuna
    ) {
      return;
    }


    const shipment: Shipment = {

      id:
        'RX-' +
        (1021 + this.shipments.length),

      destinatario:
        this.newShipment.destinatario,

      direccion:
        this.newShipment.direccion,

      comuna:
        this.newShipment.comuna,

      servicio:
        this.newShipment.servicio,

      estado:
        'Pendiente',

      fecha:
        new Date()
          .toLocaleDateString('es-CL')

    };


    this.shipments.unshift(shipment);


    // Limpiar formulario
    this.newShipment = {

      destinatario: '',
      direccion: '',
      comuna: '',
      servicio: 'Estándar'

    };


    this.closeModal();

  }


  /* =========================
     CAMBIAR ESTADO
  ========================== */

  changeStatus(
    shipment: Shipment
  ): void {

    // Solo Despachador y Admin
    // pueden cambiar estados.
    if (!this.canChangeStatus) {
      return;
    }


    if (
      shipment.estado === 'Pendiente'
    ) {

      shipment.estado =
        'En tránsito';

    }

    else if (
      shipment.estado === 'En tránsito'
    ) {

      shipment.estado =
        'Entregado';

    }

  }

}