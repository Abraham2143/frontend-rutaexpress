import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  RoleService,
  UserRole
} from '../../core/role';


interface CatalogService {
  id: number;
  name: string;
  description: string;
  deliveryTime: string;
  price: number;
  capacity: number;
  status: 'Activo' | 'Inactivo';
}


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


  /* =========================
     DATOS DEL CATÁLOGO
  ========================== */

  services: CatalogService[] = [

    {
      id: 1,
      name: 'Estándar',
      description:
        'Servicio de despacho económico para entregas regulares.',
      deliveryTime: '3 a 5 días',
      price: 4990,
      capacity: 120,
      status: 'Activo'
    },

    {
      id: 2,
      name: 'Express',
      description:
        'Servicio rápido para envíos que requieren prioridad.',
      deliveryTime: '1 a 2 días',
      price: 7990,
      capacity: 75,
      status: 'Activo'
    },

    {
      id: 3,
      name: 'Same Day',
      description:
        'Servicio de entrega durante el mismo día.',
      deliveryTime: 'Mismo día',
      price: 11990,
      capacity: 40,
      status: 'Activo'
    }

  ];


  constructor(
    private router: Router,
    public roleService: RoleService
  ) {}


  ngOnInit(): void {

    /*
      Catálogo:
      ADMIN ✅
      DISPATCHER ✅
      CLIENT ❌
    */
    if (!this.roleService.canAccessCatalog()) {

      this.router.navigate(['/dashboard']);

    }

  }


  /* =========================
     ROLES
  ========================== */

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

    return 'Sin acceso';

  }


  /* =========================
     ESTADÍSTICAS
  ========================== */

  get activeServices(): number {

    return this.services.filter(
      service => service.status === 'Activo'
    ).length;

  }


  get totalCapacity(): number {

    return this.services.reduce(
      (total, service) =>
        total + service.capacity,
      0
    );

  }


  get minimumPrice(): number {

    if (this.services.length === 0) {

      return 0;

    }

    return Math.min(
      ...this.services.map(
        service => service.price
      )
    );

  }

}