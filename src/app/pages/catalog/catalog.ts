import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  RoleService,
  UserRole
} from '../../core/role';


interface Service {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo: string;
  tarifa: number;
  capacidad: number;
  capacidadMaxima: number;
  icono: string;
}


@Component({
  selector: 'app-catalog',

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {

  services: Service[] = [

    {
      id: 1,
      nombre: 'Estándar',
      descripcion: 'Servicio económico para entregas programadas.',
      tiempo: '24 - 48 horas',
      tarifa: 3990,
      capacidad: 38,
      capacidadMaxima: 50,
      icono: '□'
    },

    {
      id: 2,
      nombre: 'Express',
      descripcion: 'Entrega prioritaria para envíos urgentes.',
      tiempo: 'Durante el día',
      tarifa: 5990,
      capacidad: 17,
      capacidadMaxima: 30,
      icono: '➜'
    },

    {
      id: 3,
      nombre: 'Same Day',
      descripcion: 'Entrega el mismo día con prioridad máxima.',
      tiempo: 'Mismo día',
      tarifa: 7990,
      capacidad: 8,
      capacidadMaxima: 20,
      icono: '⚡'
    }

  ];


  constructor(
    public roleService: RoleService,
    private router: Router
  ) {}


  ngOnInit(): void {

    /*
      Según el caso, Cliente no tiene acceso
      al catálogo.
    */

    if (!this.roleService.canAccessCatalog()) {

      this.router.navigate([
        '/dashboard'
      ]);

    }

  }


  get currentRole(): UserRole | null {
  return this.roleService.getRole();
  }


  changeRole(
    role: UserRole
  ): void {

    this.roleService.setRole(role);

    /*
      Si cambia a Cliente,
      deja de tener acceso.
    */

    if (
      !this.roleService.canAccessCatalog()
    ) {

      this.router.navigate([
        '/dashboard'
      ]);

    }

  }


  get roleName(): string {

    if (
      this.currentRole === 'ADMIN'
    ) {

      return 'Administrador';

    }

    if (
      this.currentRole === 'DISPATCHER'
    ) {

      return 'Despachador';

    }

    return 'Cliente';

  }


  get totalCapacity(): number {

    return this.services.reduce(
      (total, service) =>
        total + service.capacidad,
      0
    );

  }


  get maxCapacity(): number {

    return this.services.reduce(
      (total, service) =>
        total + service.capacidadMaxima,
      0
    );

  }


  getCapacityPercentage(
    service: Service
  ): number {

    return Math.round(
      (
        service.capacidad /
        service.capacidadMaxima
      ) * 100
    );

  }


  formatPrice(
    price: number
  ): string {

    return new Intl.NumberFormat(
      'es-CL',
      {
        style: 'currency',
        currency: 'CLP'
      }
    ).format(price);

  }

}